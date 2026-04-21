import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { createClient } from '../utils/supabase/client';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, CheckCircle2 } from 'lucide-react';

export function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a valid session (user clicked the email link)
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Invalid or expired reset link', {
          description: 'Please request a new password reset link.'
        });
        navigate('/');
      }
    };

    checkSession();
  }, [navigate]);

  const validatePassword = (password: string): boolean => {
    if (password.length < 6) {
      toast.error('Password too short', {
        description: 'Password must be at least 6 characters long.'
      });
      return false;
    }
    return true;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!validatePassword(newPassword)) {
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match', {
        description: 'Please make sure both passwords are the same.'
      });
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      // Update the user's password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setIsSuccess(true);
      toast.success('Password reset successful!', {
        description: 'You can now log in with your new password.'
      });

      // Redirect to home page after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error('Failed to reset password', {
        description: error.message || 'Please try again or request a new reset link.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#fefaf0] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-[#64b900] rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h2 className="font-['Fraunces',sans-serif] text-3xl mb-2">
            <span className="text-[#64b900]">Success!</span>
          </h2>
          
          <p className="font-['Geologica:Regular',sans-serif] text-black/70 mb-4" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            Your password has been reset successfully.
          </p>
          
          <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            Redirecting you to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fefaf0] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mb-4 flex justify-center">
            <div className="w-14 h-14 bg-[#64b900]/10 rounded-full flex items-center justify-center">
              <Lock className="w-7 h-7 text-[#64b900]" />
            </div>
          </div>
          
          <h2 className="font-['Fraunces',sans-serif] text-3xl mb-2">
            <span className="text-black">Set New </span>
            <span className="text-[#64b900]">Password</span>
          </h2>
          
          <p className="font-['Geologica:Regular',sans-serif] text-black/70 text-sm" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            Enter your new password below
          </p>
        </div>

        {/* Reset Password Form */}
        <form onSubmit={handleResetPassword} className="space-y-4">
          {/* New Password */}
          <div>
            <label 
              htmlFor="new-password" 
              className="block font-['Geologica:Regular',sans-serif] mb-1.5 text-sm" 
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
            >
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 pr-12 rounded-lg border-2 border-black/10 focus:border-[#64b900] focus:outline-none bg-white font-['Geologica:Regular',sans-serif]"
                placeholder="Enter new password"
                required
                minLength={6}
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/70 transition-colors"
              >
                {showNewPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="mt-1 text-xs font-['Geologica:Regular',sans-serif] text-black/50" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Minimum 6 characters
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label 
              htmlFor="confirm-password" 
              className="block font-['Geologica:Regular',sans-serif] mb-1.5 text-sm" 
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 pr-12 rounded-lg border-2 border-black/10 focus:border-[#64b900] focus:outline-none bg-white font-['Geologica:Regular',sans-serif]"
                placeholder="Confirm new password"
                required
                minLength={6}
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/70 transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#64b900] text-white py-3 rounded-lg font-['Geologica:Regular',sans-serif] hover:bg-[#559900] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
          >
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>

        {/* Back to Login */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="font-['Geologica:Regular',sans-serif] text-sm text-black/60 hover:text-[#64b900] transition-colors"
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
