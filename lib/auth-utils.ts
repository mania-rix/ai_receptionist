/**
 * Authentication utilities for secure user management
 */
import { supabase } from '@/lib/supabase-browser';
import { createClient } from '@supabase/supabase-js';

// Constants
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
const MAX_LOGIN_ATTEMPTS = 5;
const ATTEMPT_RESET_TIME = 60 * 1000; // 1 minute

// Track login attempts for rate limiting
interface LoginAttempt {
  count: number;
  lastAttempt: number;
}

const loginAttempts: Record<string, LoginAttempt> = {};

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * Requires minimum 8 characters with at least 1 uppercase and 1 number
 */
export function validatePassword(password: string): boolean {
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
}

/**
 * Check if user has exceeded login attempt rate limit
 */
export function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const attempt = loginAttempts[email];
  
  if (!attempt) {
    loginAttempts[email] = { count: 1, lastAttempt: now };
    return false;
  }
  
  // Reset counter if last attempt was more than ATTEMPT_RESET_TIME ago
  if (now - attempt.lastAttempt > ATTEMPT_RESET_TIME) {
    loginAttempts[email] = { count: 1, lastAttempt: now };
    return false;
  }
  
  // Increment attempt counter
  attempt.count += 1;
  attempt.lastAttempt = now;
  
  // Check if exceeded max attempts
  return attempt.count > MAX_LOGIN_ATTEMPTS;
}

/**
 * Securely login user with email and password
 */
export async function loginUser(email: string, password: string): Promise<{ user: any; error: any }> {
  console.log('[AuthUtils] Attempting login for:', email);
  
  // Validate inputs
  if (!validateEmail(email)) {
    return { user: null, error: { message: 'Invalid email format' } };
  }
  
  if (!validatePassword(password)) {
    return { user: null, error: { message: 'Password must be at least 8 characters with 1 uppercase letter and 1 number' } };
  }
  
  // Check rate limiting
  if (checkRateLimit(email)) {
    console.warn('[AuthUtils] Rate limit exceeded for:', email);
    return { user: null, error: { message: 'Too many login attempts. Please try again later.' } };
  }
  
  try {
    // Attempt login with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    // Set session expiry
    const expiryTime = Date.now() + SESSION_TIMEOUT;
    localStorage.setItem('session_expiry', expiryTime.toString());
    
    console.log('[AuthUtils] Login successful for:', email);
    return { user: data.user, error: null };
  } catch (error) {
    console.error('[AuthUtils] Login error:', error);
    return { user: null, error };
  }
}

/**
 * Register a new user
 */
export async function registerUser(email: string, password: string, firstName: string, lastName: string): Promise<{ user: any; error: any }> {
  console.log('[AuthUtils] Registering new user:', email);
  
  // Validate inputs
  if (!validateEmail(email)) {
    return { user: null, error: { message: 'Invalid email format' } };
  }
  
  if (!validatePassword(password)) {
    return { user: null, error: { message: 'Password must be at least 8 characters with 1 uppercase letter and 1 number' } };
  }
  
  try {
    // Register with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`
        }
      }
    });
    
    if (error) throw error;
    
    console.log('[AuthUtils] Registration successful for:', email);
    return { user: data.user, error: null };
  } catch (error) {
    console.error('[AuthUtils] Registration error:', error);
    return { user: null, error };
  }
}

/**
 * Securely logout user and clean up session data
 */
export async function logoutUser(): Promise<{ error: any }> {
  console.log('[AuthUtils] Logging out user');
  
  try {
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
    
    // Clean up session data
    localStorage.removeItem('session_expiry');
    
    // Clear any cached data
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('blvckwall_')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('[AuthUtils] Logout successful');
    return { error: null };
  } catch (error) {
    console.error('[AuthUtils] Logout error:', error);
    return { error };
  }
}

/**
 * Check if session is expired
 */
export function isSessionExpired(): boolean {
  const expiryTime = localStorage.getItem('session_expiry');
  if (!expiryTime) return true;
  
  return Date.now() > parseInt(expiryTime);
}

/**
 * Refresh session if needed
 */
export async function refreshSessionIfNeeded(): Promise<void> {
  if (isSessionExpired()) {
    console.log('[AuthUtils] Session expired, refreshing');
    
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      if (data.session) {
        // Update session expiry
        const expiryTime = Date.now() + SESSION_TIMEOUT;
        localStorage.setItem('session_expiry', expiryTime.toString());
        console.log('[AuthUtils] Session refreshed successfully');
      }
    } catch (error) {
      console.error('[AuthUtils] Session refresh error:', error);
      // Force logout on refresh failure
      await logoutUser();
    }
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<any> {
  try {
    const { data } = await supabase.auth.getUser();
    return data.user;
  } catch (error) {
    console.error('[AuthUtils] Get current user error:', error);
    return null;
  }
}