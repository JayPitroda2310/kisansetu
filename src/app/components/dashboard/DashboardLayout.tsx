import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { DashboardHeader } from './DashboardHeader';
import { ProfileCompletionBanner } from './ProfileCompletionBanner';
import { ActivitiesSection } from './ActivitiesSection';
import { DashboardContent } from './DashboardContent';
import { AddActivityModal } from './AddActivityModal';
import { FarmerDashboard } from './FarmerDashboard';
import { MarketplaceDashboard } from './MarketplaceDashboard';
import { MessagesPage } from './MessagesPage';
import { ProfilePage } from './ProfilePage';
import { MyListingsPage } from './MyListingsPage';
import { MyBiddingsPage } from './MyBiddingsPage';
import OrderHistoryPage from './OrderHistoryPage';
import { SettingsPage } from './SettingsPage';
import { EscrowPaymentView } from './EscrowPaymentView';
import { NotificationsPanel } from './NotificationsPanel';
import { NotificationsPage } from './NotificationsPage';
import { getTotalUnreadCount, subscribeToConversations } from '../../utils/supabase/messages';
import { supabase } from '../../utils/supabase/client';
import { getUserProfile, calculateProfileCompletion, subscribeToProfile } from '../../utils/supabase/profiles';

export type UserRole = 'buyer' | 'seller' | 'equipment' | 'service';

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  enabledRoles: UserRole[];
  profileCompletion: number;
  avatarUrl?: string;
}

interface DashboardLayoutProps {
  onLogout: () => void;
}

export function DashboardLayout({ onLogout }: DashboardLayoutProps) {
  const [currentRole, setCurrentRole] = useState<UserRole>('seller');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Jay Pitroda',
    email: '', // Will be loaded from Supabase Auth
    enabledRoles: ['seller'],
    profileCompletion: 70
  });
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [showProfileBanner, setShowProfileBanner] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(true); // Track actual completion status

  // Load user email on mount
  useEffect(() => {
    const loadUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        console.log('📧 Loading user email in DashboardLayout:', user.email);
        setUserProfile(prev => ({ ...prev, email: user.email || '' }));
      }
    };
    loadUserEmail();
  }, []);

  // Check profile completion status
  useEffect(() => {
    const checkProfileStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const userEmail = user?.email || '';
        
        const { data, error } = await getUserProfile();
        
        if (error) {
          console.error('Error fetching profile:', error);
          setLoading(false);
          return;
        }

        if (data) {
          const completionPercentage = calculateProfileCompletion(data);
          const isComplete = data.profile_completed === true;
          
          setUserProfile(prev => ({
            ...prev,
            name: data.full_name || prev.name,
            email: userEmail, // Load from Supabase Auth
            profileCompletion: completionPercentage,
            avatarUrl: data.avatar_url
          }));

          setIsProfileComplete(isComplete);
          setProfileCompleted(isComplete);
        }
      } catch (error) {
        console.error('Error in checkProfileStatus:', error);
      } finally {
        setLoading(false);
      }
    };

    checkProfileStatus();

    // Subscribe to profile changes
    const channel = subscribeToProfile((profile) => {
      if (profile) {
        const completionPercentage = calculateProfileCompletion(profile);
        const isComplete = profile.profile_completed === true;
        
        setUserProfile(prev => ({
          ...prev,
          name: profile.full_name || prev.name,
          profileCompletion: completionPercentage,
          avatarUrl: profile.avatar_url
        }));

        setIsProfileComplete(isComplete);
        setProfileCompleted(isComplete);
      }
    });

    // Listen for profile-updated events from Settings page
    const handleProfileUpdated = () => {
      console.log('Profile updated event received, reloading profile...');
      checkProfileStatus();
    };
    
    window.addEventListener('profile-updated', handleProfileUpdated);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('profile-updated', handleProfileUpdated);
    };
  }, []);

  // Load unread message count
  useEffect(() => {
    const loadUnreadCount = async () => {
      const { count } = await getTotalUnreadCount();
      if (count !== null) {
        setUnreadMessageCount(count);
      }
    };
    
    loadUnreadCount();
    
    // Subscribe to message updates to refresh count
    const channel = subscribeToConversations(() => {
      loadUnreadCount();
    });
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAddActivities = (newRoles: UserRole[]) => {
    setUserProfile(prev => ({
      ...prev,
      enabledRoles: [...new Set([...prev.enabledRoles, ...newRoles])]
    }));
    setShowAddActivityModal(false);
  };

  const handleNavigateToProfile = () => {
    setActiveView('profile');
    setShowProfileBanner(false); // Optionally hide banner after navigating
  };

  const handleViewChange = (view: string, conversationId?: string) => {
    setActiveView(view);
    if (conversationId) {
      setSelectedConversationId(conversationId);
    }
  };

  const handleProfileCompletion = () => {
    setShowProfileCompletion(false);
    setProfileCompleted(true);
  };

  // Show loading state while checking profile
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#fefaf0]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#64b900] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-['Geologica:Regular',sans-serif] text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#fefaf0] overflow-hidden">
      {/* Left Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar 
          enabledRoles={userProfile.enabledRoles} 
          currentRole={currentRole}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          activeView={activeView}
          onViewChange={setActiveView}
          unreadMessageCount={unreadMessageCount}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Top Header */}
        <DashboardHeader 
          userProfile={userProfile}
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          onLogout={onLogout}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          title={activeView === 'dashboard' ? 'Dashboard' : activeView.charAt(0).toUpperCase() + activeView.slice(1)}
          activeView={activeView}
          onViewChange={setActiveView}
          unreadMessageCount={unreadMessageCount}
        />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {activeView === 'messages' ? (
            // Messages page - full width, no padding, but show banner at top if needed
            <div className="h-full flex flex-col">
              {showProfileBanner && !isProfileComplete && (
                <div className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-2">
                  <ProfileCompletionBanner 
                    completion={userProfile.profileCompletion}
                    onDismiss={() => setShowProfileBanner(false)}
                    onNavigateToProfile={handleNavigateToProfile}
                  />
                </div>
              )}
              <div className="flex-1">
                <MessagesPage />
              </div>
            </div>
          ) : activeView === 'settings' ? (
            // Settings page - full width with own padding and layout
            <SettingsPage />
          ) : activeView === 'notifications' ? (
            // Notifications panel - full height
            <NotificationsPanel />
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
              {/* Profile Completion Banner - Only show if profile is NOT completed */}
              {showProfileBanner && !isProfileComplete && (
                <ProfileCompletionBanner 
                  completion={userProfile.profileCompletion}
                  onDismiss={() => setShowProfileBanner(false)}
                  onNavigateToProfile={handleNavigateToProfile}
                />
              )}

              {/* Conditional Dashboard Content Based on Active View */}
              {activeView === 'profile' ? (
                <ProfilePage />
              ) : activeView === 'my-listings' ? (
                <MyListingsPage onNavigate={handleViewChange} />
              ) : activeView === 'my-biddings' ? (
                <MyBiddingsPage onNavigate={setActiveView} />
              ) : activeView === 'order-history' ? (
                <OrderHistoryPage />
              ) : activeView === 'notifications' ? (
                <NotificationsPage />
              ) : activeView === 'dashboard' && currentRole === 'seller' ? (
                // Marketplace Dashboard with SELL/BUY toggle
                <MarketplaceDashboard onNavigate={handleViewChange} />
              ) : (
                // Original Dashboard for other roles or views
                <>
                  {/* Activities Section */}
                  <ActivitiesSection 
                    enabledRoles={userProfile.enabledRoles}
                    onAddActivity={() => setShowAddActivityModal(true)}
                  />

                  {/* Main Dashboard Content */}
                  <DashboardContent 
                    currentRole={currentRole}
                    enabledRoles={userProfile.enabledRoles}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Activity Modal */}
      <AddActivityModal 
        isOpen={showAddActivityModal}
        onClose={() => setShowAddActivityModal(false)}
        currentRoles={userProfile.enabledRoles}
        onAdd={handleAddActivities}
      />
    </div>
  );
}