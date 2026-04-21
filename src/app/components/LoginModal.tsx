import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { signIn } from '../utils/supabase/auth';
import { toast } from 'sonner';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignUp: () => void;
  onLogin?: () => void;
}

export function LoginModal({ isOpen, onClose, onSwitchToSignUp, onLogin }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true); // Default to true
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetLoading, setIsResetLoading] = useState(false);

  // Demo account credentials hint
  const useDemoAccount = () => {
    setEmail('demo@kisansetu.com');
    setPassword('demo123456');
    toast.info('Demo account credentials filled', {
      description: 'You can now click "Sign In" to login with the demo account.'
    });
  };

  useEffect(() => {
    // Load Google Identity Services script
    if (isOpen && !document.getElementById('google-identity-script')) {
      const script = document.createElement('script');
      script.id = 'google-identity-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
    
    // Load remember me preference
    if (isOpen) {
      const savedRememberMe = localStorage.getItem('kisansetu_remember_me');
      if (savedRememberMe !== null) {
        setRememberMe(savedRememberMe === 'true');
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Sign in with Supabase with Remember Me option
      const { user, session } = await signIn(email, password, rememberMe);
      
      console.log('Login successful:', user);
      
      // Store session info
      if (session) {
        localStorage.setItem('supabase_session', JSON.stringify(session));
      }
      
      // Show success message
      toast.success('Welcome back!', {
        description: 'You have successfully logged in.',
      });
      
      // Call onLogin callback
      onLogin?.();
      onClose();
      
      // Reset form
      setEmail('');
      setPassword('');
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Show error message
      toast.error('Login failed', {
        description: error.message || 'Invalid email or password. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Check if Google Identity Services is loaded
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
      try {
        const client = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
          scope: 'email profile openid',
          callback: (response: any) => {
            if (response.access_token) {
              // Fetch user info from Google
              fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                  Authorization: `Bearer ${response.access_token}`,
                },
              })
                .then((res) => res.json())
                .then((userInfo) => {
                  console.log('Google Login Success:', userInfo);
                  // Store user info and proceed to dashboard
                  localStorage.setItem('user', JSON.stringify({
                    name: userInfo.name,
                    email: userInfo.email,
                    avatar: userInfo.picture,
                    provider: 'google'
                  }));
                  onLogin?.();
                  onClose();
                })
                .catch((error) => {
                  console.error('Error fetching user info:', error);
                  alert('Failed to login with Google. Please try again.');
                });
            }
          },
          error_callback: (error: any) => {
            // Silently handle popup closed errors
            if (error.type === 'popup_closed') {
              console.log('Google login popup was closed');
              return;
            }
            console.error('Google Login Error:', error);
            alert('Google login failed. Please try again.');
          }
        });
        
        // Request access token with proper error handling
        try {
          client.requestAccessToken();
        } catch (error) {
          console.error('Error requesting access token:', error);
          // Fall back to demo mode
          handleDemoGoogleLogin();
        }
      } catch (error) {
        console.error('Error initializing Google client:', error);
        // Fall back to demo mode
        handleDemoGoogleLogin();
      }
    } else {
      // Fallback: Demo mode for development
      handleDemoGoogleLogin();
    }
  };

  const handleDemoGoogleLogin = () => {
    console.log('Google Sign-In: Demo Mode (Development)');
    const demoUser = {
      name: 'Google User',
      email: 'user@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      provider: 'google'
    };
    localStorage.setItem('user', JSON.stringify(demoUser));
    onLogin?.();
    onClose();
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetLoading(true);

    try {
      // Import supabase client
      const { createClient } = await import('../utils/supabase/client');
      const supabase = createClient();

      // Send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      toast.success('Password reset email sent!', {
        description: 'Check your email for a link to reset your password.',
      });

      // Close forgot password view and reset form
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error('Failed to send reset email', {
        description: error.message || 'Please check the email address and try again.',
      });
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-[#fefaf0] rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-black/60 hover:text-black transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {showForgotPassword ? (
          /* Forgot Password View */
          <>
            <div className="text-center mb-4">
              <h2 className="font-['Fraunces',sans-serif] text-3xl mb-1">
                <span className="text-black">Reset </span>
                <span className="text-[#64b900]">Password</span>
              </h2>
              <p className="font-['Geologica:Regular',sans-serif] text-black/70 text-sm" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                Enter your email and we'll send you a reset link
              </p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label 
                  htmlFor="reset-email" 
                  className="block font-['Geologica:Regular',sans-serif] mb-1.5 text-sm" 
                  style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="reset-email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-black/10 focus:border-[#64b900] focus:outline-none bg-white font-['Geologica:Regular',sans-serif]"
                  placeholder="your.email@example.com"
                  required
                  style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                />
              </div>

              <button
                type="submit"
                disabled={isResetLoading}
                className="w-full bg-[#64b900] text-white py-2.5 rounded-lg font-['Geologica:Regular',sans-serif] hover:bg-[#559900] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              >
                {isResetLoading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetEmail('');
                }}
                className="w-full py-2 text-sm font-['Geologica:Regular',sans-serif] text-black/70 hover:text-black"
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              >
                ← Back to Login
              </button>
            </form>
          </>
        ) : (
          /* Login View */
          <>
            {/* Header */}
            <div className="text-center mb-4">
              <h2 className="font-['Fraunces',sans-serif] text-3xl mb-1">
                <span className="text-black">Welcome </span>
                <span className="text-[#64b900]">Back</span>
              </h2>
              <p className="font-['Geologica:Regular',sans-serif] text-black/70 text-sm" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                Login to access your KisanSetu account
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label 
                  htmlFor="email" 
                  className="block font-['Geologica:Regular',sans-serif] mb-1.5 text-sm" 
                  style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-black/10 focus:border-[#64b900] focus:outline-none bg-white font-['Geologica:Regular',sans-serif]"
                  placeholder="your.email@example.com"
                  required
                  style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                />
              </div>

              <div>
                <label 
                  htmlFor="password" 
                  className="block font-['Geologica:Regular',sans-serif] mb-1.5 text-sm" 
                  style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-black/10 focus:border-[#64b900] focus:outline-none bg-white font-['Geologica:Regular',sans-serif]"
                  placeholder="Enter your password"
                  required
                  style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 accent-[#64b900]" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                  <span className="font-['Geologica:Regular',sans-serif] text-sm text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Remember me
                  </span>
                </label>
                <button 
                  type="button"
                  className="font-['Geologica:Regular',sans-serif] text-sm text-[#64b900] hover:underline" 
                  style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#64b900] text-white py-2.5 rounded-lg font-['Geologica:Regular',sans-serif] hover:bg-[#559900] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#fefaf0] font-['Geologica:Regular',sans-serif] text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  OR
                </span>
              </div>
            </div>

            {/* Social Login */}
            <div>
              <button 
                type="button"
                onClick={handleGoogleLogin}
                className="w-full bg-white border-2 border-black/10 py-2.5 rounded-lg font-['Geologica:Regular',sans-serif] hover:bg-gray-50 transition-colors flex items-center justify-center gap-2" 
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>

            {/* Demo Account Link */}
            <div className="text-center mt-2 mb-2">
              <button
                type="button"
                onClick={useDemoAccount}
                className="text-xs font-['Geologica:Regular',sans-serif] text-[#64b900]/70 hover:text-[#64b900] hover:underline transition-colors"
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              >
                Use demo account credentials
              </button>
            </div>

            {/* Sign Up Link */}
            <p className="text-center mt-3 font-['Geologica:Regular',sans-serif] text-black/70 text-sm" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Don't have an account?{' '}
              <button 
                onClick={onSwitchToSignUp}
                className="text-[#64b900] hover:underline"
              >
                Sign Up
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}