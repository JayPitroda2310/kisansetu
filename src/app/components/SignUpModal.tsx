import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { signUp } from '../utils/supabase/auth';
import { toast } from 'sonner';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  onSignupComplete?: (signupData: any) => void;
}

export function SignUpModal({ isOpen, onClose, onSwitchToLogin, onSignupComplete }: SignUpModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'farmer' as 'farmer' | 'buyer' | 'both'
  });
  const [isLoading, setIsLoading] = useState(false);

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
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match', {
        description: 'Please make sure both passwords are the same.',
      });
      return;
    }
    
    // Validate password length
    if (formData.password.length < 6) {
      toast.error('Password too short', {
        description: 'Password must be at least 6 characters long.',
      });
      return;
    }
    
    setIsLoading(true);

    try {
      // Sign up with Supabase
      const { user, session } = await signUp(
        formData.email,
        formData.password,
        {
          fullName: formData.fullName,
          phone: formData.phone,
          role: formData.role,
          location: '', // Will be filled in profile completion
        }
      );
      
      console.log('Sign up successful:', user);
      
      // Store session info
      if (session) {
        localStorage.setItem('supabase_session', JSON.stringify(session));
      }
      
      // Show success message
      toast.success('Account created successfully!', {
        description: 'Welcome to KisanSetu! Please complete your profile.',
      });
      
      // Call onSignupComplete callback
      if (onSignupComplete) {
        onSignupComplete({
          ...formData,
          userId: user?.id,
        });
      }
      
      onClose();
      
      // Reset form
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'farmer'
      });
      
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      // Show error message
      toast.error('Sign up failed', {
        description: error.message || 'An error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGoogleSignUp = () => {
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
                  console.log('Google Sign-Up Success:', userInfo);
                  // Store user info and proceed
                  const signupData = {
                    fullName: userInfo.name,
                    email: userInfo.email,
                    avatar: userInfo.picture,
                    provider: 'google',
                    role: 'farmer' // Default role
                  };
                  localStorage.setItem('user', JSON.stringify(signupData));
                  if (onSignupComplete) {
                    onSignupComplete(signupData);
                  }
                  onClose();
                })
                .catch((error) => {
                  console.error('Error fetching user info:', error);
                  alert('Failed to sign up with Google. Please try again.');
                });
            }
          },
          error_callback: (error: any) => {
            // Silently handle popup closed errors
            if (error.type === 'popup_closed') {
              console.log('Google sign-up popup was closed');
              return;
            }
            console.error('Google Sign-Up Error:', error);
            alert('Google sign up failed. Please try again.');
          }
        });
        
        // Request access token with proper error handling
        try {
          client.requestAccessToken();
        } catch (error) {
          console.error('Error requesting access token:', error);
          // Fall back to demo mode
          handleDemoGoogleSignUp();
        }
      } catch (error) {
        console.error('Error initializing Google client:', error);
        // Fall back to demo mode
        handleDemoGoogleSignUp();
      }
    } else {
      // Fallback: Demo mode for development
      handleDemoGoogleSignUp();
    }
  };

  const handleDemoGoogleSignUp = () => {
    console.log('Google Sign-Up: Demo Mode (Development)');
    const demoUser = {
      fullName: 'Google User',
      email: 'user@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      provider: 'google',
      role: 'farmer'
    };
    localStorage.setItem('user', JSON.stringify(demoUser));
    if (onSignupComplete) {
      onSignupComplete(demoUser);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div 
        className="bg-[#fefaf0] rounded-2xl shadow-2xl w-full max-w-md mx-4 px-8 py-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-black/60 hover:text-black transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="font-['Fraunces',sans-serif] text-3xl mb-1">
            <span className="text-black">Join </span>
            <span className="text-[#64b900]">KisanSetu</span>
          </h2>
          <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            Create your account and start your journey
          </p>
        </div>

        {/* Sign Up Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Full Name and Phone Number - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label 
                htmlFor="fullName" 
                className="block font-['Geologica:Regular',sans-serif] mb-1 text-sm" 
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              >
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border-2 border-black/10 focus:border-[#64b900] focus:outline-none bg-white font-['Geologica:Regular',sans-serif] text-sm"
                placeholder="Enter full name"
                required
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              />
            </div>

            <div>
              <label 
                htmlFor="phone" 
                className="block font-['Geologica:Regular',sans-serif] mb-1 text-sm" 
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border-2 border-black/10 focus:border-[#64b900] focus:outline-none bg-white font-['Geologica:Regular',sans-serif] text-sm"
                placeholder="+91 98765 43210"
                required
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              />
            </div>
          </div>

          {/* Email Address - Full Width */}
          <div>
            <label 
              htmlFor="email" 
              className="block font-['Geologica:Regular',sans-serif] mb-1 text-sm" 
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border-2 border-black/10 focus:border-[#64b900] focus:outline-none bg-white font-['Geologica:Regular',sans-serif] text-sm"
              placeholder="your.email@example.com"
              required
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
            />
          </div>

          {/* Password and Confirm Password - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label 
                htmlFor="password" 
                className="block font-['Geologica:Regular',sans-serif] mb-1 text-sm" 
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border-2 border-black/10 focus:border-[#64b900] focus:outline-none bg-white font-['Geologica:Regular',sans-serif] text-sm"
                placeholder="Create password"
                required
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              />
            </div>

            <div>
              <label 
                htmlFor="confirmPassword" 
                className="block font-['Geologica:Regular',sans-serif] mb-1 text-sm" 
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border-2 border-black/10 focus:border-[#64b900] focus:outline-none bg-white font-['Geologica:Regular',sans-serif] text-sm"
                placeholder="Re-enter password"
                required
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              />
            </div>
          </div>

          <div className="flex items-start gap-2">
            <input type="checkbox" className="w-4 h-4 accent-[#64b900] mt-0.5" required />
            <span className="font-['Geologica:Regular',sans-serif] text-xs text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              I agree to the{' '}
              <a href="#" className="text-[#64b900] hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-[#64b900] hover:underline">Privacy Policy</a>
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#64b900] text-white py-2 rounded-lg font-['Geologica:Regular',sans-serif] hover:bg-[#559900] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-black/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-[#fefaf0] font-['Geologica:Regular',sans-serif] text-black/60 text-xs" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              OR
            </span>
          </div>
        </div>

        {/* Social Sign Up */}
        <div>
          <button type="button" className="w-full bg-white border-2 border-black/10 py-2 rounded-lg font-['Geologica:Regular',sans-serif] hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }} onClick={handleGoogleSignUp}>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Login Link */}
        <p className="text-center mt-3 font-['Geologica:Regular',sans-serif] text-black/70 text-sm" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
          Already have an account?{' '}
          <button 
            onClick={onSwitchToLogin}
            className="text-[#64b900] hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}