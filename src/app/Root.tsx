import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { NavBar } from './components/NavBar';
import { Footer } from './components/Footer';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { Toaster } from 'sonner';
import { StorageBucketInitializer } from './components/StorageBucketInitializer';
import { supabase } from './utils/supabase/client';

export default function Root() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const location = useLocation();

  // Check for existing session on mount and listen for auth changes
  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('Existing session found, user is logged in');
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session ? 'Session active' : 'No session');
      setIsLoggedIn(!!session);
      setIsCheckingAuth(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignupComplete = () => {
    console.log('Signup complete - user logged in');
    setIsLoggedIn(true);
  };

  const handleLogin = () => {
    console.log('Login complete - user logged in');
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    console.log('User logging out');
    try {
      await supabase.auth.signOut();
      setIsLoggedIn(false);
      // Clear any stored preferences
      localStorage.removeItem('kisansetu_remember_me');
      sessionStorage.removeItem('kisansetu_temp_session');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fefaf0]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#64b900] border-t-transparent mx-auto mb-4"></div>
          <p className="font-['Geologica:Regular',sans-serif] text-black/70">Loading...</p>
        </div>
      </div>
    );
  }

  try {
    // Show dashboard if logged in
    if (isLoggedIn) {
      return (
        <>
          <DashboardLayout onLogout={handleLogout} />
          <Toaster position="top-right" richColors closeButton />
          <StorageBucketInitializer />
        </>
      );
    }

    // Hide navbar on home page since it's integrated in Hero
    const isHomePage = location.pathname === '/';

    return (
      <>
        <div className={`min-h-screen ${isHomePage ? 'bg-[#fefaf0]' : 'bg-[#fefaf0]'}`}>
          {!isHomePage && <NavBar onSignupComplete={handleSignupComplete} onLogin={handleLogin} />}
          <Outlet context={{ onSignupComplete: handleSignupComplete, onLogin: handleLogin }} />
          <Footer />
        </div>
        <Toaster position="top-right" richColors closeButton />
        <StorageBucketInitializer />
      </>
    );
  } catch (error) {
    console.error('Error rendering Root:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600">Please refresh the page</p>
        </div>
      </div>
    );
  }
}