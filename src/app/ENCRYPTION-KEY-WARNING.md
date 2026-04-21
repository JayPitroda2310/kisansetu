/**
 * ✅ SECURE PASSWORD RESET UTILITIES
 * 
 * These functions allow admins to trigger password resets
 * WITHOUT ever seeing or storing user passwords
 */

import { createClient } from '@/utils/supabase/server';

/**
 * Admin function to send password reset email to user
 * This is the CORRECT and SECURE way to handle password resets
 */
export async function adminResetUserPassword(userEmail: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const supabase = await createClient();
    
    // Verify admin is authorized
    const { data: { user: adminUser } } = await supabase.auth.getUser();
    if (!adminUser) {
      return { success: false, message: 'Not authenticated' };
    }
    
    // Check if admin has permission
    const { data: adminProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', adminUser.id)
      .single();
    
    if (adminProfile?.role !== 'admin') {
      return { success: false, message: 'Not authorized' };
    }
    
    // Trigger password reset email
    // User will receive email with secure reset link
    // Old password becomes invalid after reset
    const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`
    });
    
    if (error) {
      console.error('Password reset error:', error);
      return { success: false, message: error.message };
    }
    
    // Log the admin action for audit trail
    await supabase.from('admin_audit_log').insert({
      admin_id: adminUser.id,
      action: 'password_reset_initiated',
      target_user_email: userEmail,
      timestamp: new Date().toISOString()
    });
    
    return {
      success: true,
      message: `Password reset email sent to ${userEmail}`
    };
    
  } catch (error) {
    console.error('Admin password reset error:', error);
    return {
      success: false,
      message: 'Failed to send password reset email'
    };
  }
}

/**
 * Admin function to force user to change password on next login
 * This is useful for compromised accounts
 */
export async function adminForcePasswordChange(userId: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const supabase = await createClient();
    
    // Verify admin authorization (same as above)
    const { data: { user: adminUser } } = await supabase.auth.getUser();
    if (!adminUser) {
      return { success: false, message: 'Not authenticated' };
    }
    
    const { data: adminProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', adminUser.id)
      .single();
    
    if (adminProfile?.role !== 'admin') {
      return { success: false, message: 'Not authorized' };
    }
    
    // Mark user for forced password change
    const { error } = await supabase
      .from('user_profiles')
      .update({ force_password_change: true })
      .eq('user_id', userId);
    
    if (error) {
      return { success: false, message: error.message };
    }
    
    // Log the action
    await supabase.from('admin_audit_log').insert({
      admin_id: adminUser.id,
      action: 'force_password_change',
      target_user_id: userId,
      timestamp: new Date().toISOString()
    });
    
    return {
      success: true,
      message: 'User will be required to change password on next login'
    };
    
  } catch (error) {
    console.error('Force password change error:', error);
    return {
      success: false,
      message: 'Failed to force password change'
    };
  }
}

/**
 * ✅ HOW TO USE THESE FUNCTIONS:
 * 
 * // In your admin panel:
 * import { adminResetUserPassword } from '@/utils/admin/password-reset';
 * 
 * // When admin clicks "Reset Password" button:
 * const result = await adminResetUserPassword('user@example.com');
 * 
 * if (result.success) {
 *   alert('Password reset email sent!');
 * } else {
 *   alert(`Error: ${result.message}`);
 * }
 * 
 * // User receives email
 * // User clicks link
 * // User creates NEW password
 * // Old password is invalidated
 * // Admin NEVER sees the password
 */
