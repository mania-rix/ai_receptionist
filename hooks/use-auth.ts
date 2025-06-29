/**
 * Custom hook for authentication functionality
 */
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStorage } from '@/contexts/storage-context';
import { useToast } from '@/hooks/use-toast';
import { refreshSessionIfNeeded, isSessionExpired } from '@/lib/auth-utils';

export function useAuth() {
  const router = useRouter();
  const { toast } = useToast();
  const { 
    isAuthenticated, 
    isLoading, 
    currentUser, 
    authError,
    login, 
    signup, 
    logout,
    validateCredentials
  } = useStorage();
  
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        if (!isLoading) {
          if (isSessionExpired() && isAuthenticated) {
            await refreshSessionIfNeeded();
          }
          setIsInitializing(false);
        }
      } catch (error) {
        console.error('[useAuth] Session check error:', error);
        setIsInitializing(false);
      }
    };
    
    checkSession();
  }, [isLoading, isAuthenticated]);
  
  // Handle login
  const handleLogin = useCallback(async (email: string, password: string) => {
    try {
      const result = await login(email, password);
      
      if (result.success) {
        toast({
          title: 'Login successful',
          description: 'Welcome back!',
        });
        return { success: true };
      } else {
        toast({
          title: 'Login failed',
          description: result.error || 'Invalid credentials',
          variant: 'destructive',
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = (error as Error).message || 'An unknown error occurred';
      toast({
        title: 'Login error',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, error: errorMessage };
    }
  }, [login, toast]);
  
  // Handle signup
  const handleSignup = useCallback(async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const result = await signup(email, password, firstName, lastName);
      
      if (result.success) {
        toast({
          title: 'Account created',
          description: 'Your account has been created successfully',
        });
        return { success: true };
      } else {
        toast({
          title: 'Signup failed',
          description: result.error || 'Could not create account',
          variant: 'destructive',
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = (error as Error).message || 'An unknown error occurred';
      toast({
        title: 'Signup error',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, error: errorMessage };
    }
  }, [signup, toast]);
  
  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully',
      });
      router.push('/');
    } catch (error) {
      const errorMessage = (error as Error).message || 'An unknown error occurred';
      toast({
        title: 'Logout error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [logout, toast, router]);
  
  // Require authentication
  const requireAuth = useCallback(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to access this page',
        variant: 'destructive',
      });
      router.push('/auth/blvckwall');
      return false;
    }
    return true;
  }, [isLoading, isAuthenticated, toast, router]);
  
  return {
    isAuthenticated,
    isLoading: isLoading || isInitializing,
    currentUser,
    authError,
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
    requireAuth,
    validateCredentials
  };
}