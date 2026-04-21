import { supabase } from './client';
import { projectId, publicAnonKey } from './info';

// Sign up with email and password via server
export const signUp = async (email: string, password: string, userData: {
  fullName: string;
  phone: string;
  role: 'farmer' | 'buyer' | 'both';
  location: string;
}) => {
  try {
    // Call server endpoint to create user with auto-confirmed email
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-8192211d/auth/signup`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          email,
          password,
          fullName: userData.fullName,
          phone: userData.phone,
          role: userData.role,
          location: userData.location,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Sign up failed');
    }

    // Now sign in to get the session
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Remember new users by default
    if (typeof window !== 'undefined') {
      localStorage.setItem('kisansetu_remember_me', 'true');
    }

    return data;
  } catch (error: any) {
    console.error('Sign up error:', error);
    throw error;
  }
};

// Sign in with email and password
export const signIn = async (email: string, password: string, rememberMe: boolean = true) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Provide more specific error messages
    if (error.message.includes('Invalid login credentials')) {
      throw new Error('Invalid email or password. Please check your credentials and try again.');
    } else if (error.message.includes('Email not confirmed')) {
      throw new Error('Please verify your email address before logging in.');
    } else {
      throw new Error(error.message);
    }
  }
  
  // Store remember me preference
  if (typeof window !== 'undefined') {
    localStorage.setItem('kisansetu_remember_me', rememberMe ? 'true' : 'false');
    
    // If remember me is false, set session to expire when browser closes
    if (!rememberMe) {
      // Store session temporarily
      sessionStorage.setItem('kisansetu_temp_session', 'true');
    }
  }
  
  return data;
};

// Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Reset password
export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
};

// Update password
export const updatePassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });
  if (error) throw error;
};

// Check if user is authenticated
export const isAuthenticated = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return !!user;
};