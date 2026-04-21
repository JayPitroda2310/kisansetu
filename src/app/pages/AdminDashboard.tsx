import { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  DollarSign, 
  Shield,
  Gavel,
  Flag,
  FileText,
  Bell,
  Settings,
  Search,
  Menu,
  ChevronDown,
  LogOut
} from 'lucide-react';
import { DashboardOverview } from '../components/admin/DashboardOverview';
import { UserManagement } from '../components/admin/UserManagement';
import { CommodityListings } from '../components/admin/CommodityListings';
import { TransactionEscrowManagement } from '../components/admin/TransactionEscrowManagement';
import { DisputeCenter } from '../components/admin/DisputeCenter';
import { FraudDetection } from '../components/admin/FraudDetection';
import { ReportsAnalytics } from '../components/admin/ReportsAnalytics';
import { NotificationsManager } from '../components/admin/NotificationsManager';
import { PlatformSettings } from '../components/admin/PlatformSettings';
import { useNavigate } from 'react-router';

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'listings', label: 'Commodity Listings', icon: Package },
    { id: 'transactions', label: 'Transaction & Escrow', icon: DollarSign },
    { id: 'disputes', label: 'Dispute Center', icon: Gavel },
    { id: 'fraud', label: 'Fraud Detection', icon: Flag },
    { id: 'reports', label: 'Reports & Analytics', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Platform Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'users':
        return <UserManagement />;
      case 'listings':
        return <CommodityListings />;
      case 'transactions':
        return <TransactionEscrowManagement />;
      case 'disputes':
        return <DisputeCenter />;
      case 'fraud':
        return <FraudDetection />;
      case 'reports':
        return <ReportsAnalytics />;
      case 'notifications':
        return <NotificationsManager />;
      case 'settings':
        return <PlatformSettings />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex">
      {/* Sidebar */}
      <aside className={`bg-white border-r-2 border-black/10 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
        {/* Logo */}
        <div className="p-6 border-b-2 border-black/10 flex items-center justify-between">
          {sidebarOpen && (
            <h2 className="font-['Fraunces',sans-serif] text-2xl">
              <span className="text-black">Kisan</span>
              <span className="text-[#64b900]">Setu</span>
            </h2>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-[#64b900]/10 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-black" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-[#64b900] text-white shadow-lg' 
                    : 'text-black/70 hover:bg-[#64b900]/10 hover:text-black'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <span className="font-['Geologica:Regular',sans-serif] text-sm" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Admin Info (bottom) */}
        {sidebarOpen && (
          <div className="p-4 border-t-2 border-black/10">
            <div className="flex items-center gap-3 p-3 bg-[#64b900]/10 rounded-xl">
              <div className="w-10 h-10 bg-[#64b900] rounded-full flex items-center justify-center">
                <span className="font-['Geologica:Regular',sans-serif] text-white font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  A
                </span>
              </div>
              <div>
                <p className="font-['Geologica:Regular',sans-serif] text-sm font-medium text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Admin
                </p>
                <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Super Admin
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b-2 border-black/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" />
                <input
                  type="text"
                  placeholder="Search users, listings, transactions..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif]"
                  style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                />
              </div>
            </div>

            <div className="flex items-center gap-4 ml-6">
              {/* Notifications */}
              <button className="relative p-2 hover:bg-[#64b900]/10 rounded-lg transition-colors">
                <Bell className="w-6 h-6 text-black" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* System Health */}
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-['Geologica:Regular',sans-serif] text-sm text-green-700" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  System Healthy
                </span>
              </div>

              {/* Admin Profile */}
              <div className="relative">
                <button 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-[#64b900]/10 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-[#64b900] rounded-full flex items-center justify-center">
                    <span className="font-['Geologica:Regular',sans-serif] text-white font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      A
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="font-['Geologica:Regular',sans-serif] text-sm font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      Admin
                    </p>
                    <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      Super Admin
                    </p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-black/60 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown */}
                {profileDropdownOpen && (
                  <>
                    {/* Backdrop to close dropdown */}
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setProfileDropdownOpen(false)}
                    ></div>
                    
                    <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-black/10 rounded-xl shadow-lg z-20 overflow-hidden">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          navigate('/');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 text-red-600" />
                        <span className="font-['Geologica:Regular',sans-serif] text-sm text-red-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Logout
                        </span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
