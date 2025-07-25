'use client';

import { useEffect } from "react";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Mail, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useStorage } from '@/contexts/storage-context';
import { validateEmail } from '@/lib/auth-utils';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('sign-in');
  const { login, signup, isAuthenticated, currentUser, authError } = useStorage();
  
  useEffect(() => {
    console.log('window.location.origin =', window.location.origin);
    
    // Check if user is already logged in
    const checkAuth = async () => {
      if (isAuthenticated && currentUser) {
        console.log('[SignInUI] User already logged in, redirecting to portal');
        router.push('/portal/overview');
      }
    };
    
    checkAuth();
  }, [router]);
  
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password || isLoading) return;
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Use login from storage context
      const result = await login(email, password);
      
      if (result.success) {
        router.push('/portal/overview');
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Error during sign in:', error);
      setError('Error during sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use login from storage context for demo Google sign in
      const result = await login('demo@blvckwall.ai', 'Password123');
      
      if (result.success) {
        router.push('/portal/overview');
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Error during Google sign in:', error);
      setError('Error during Google sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0E0E0E] to-[#1A1A1A] p-4">
      {/* Demo Mode Banner */}
      <div className="absolute top-0 left-0 right-0 bg-yellow-900/50 text-yellow-200 py-2 px-4 text-center text-sm z-50">
        ⚠️ DEMO MODE: All data is stored in session storage and will be lost on refresh or sign out
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-gray-800 bg-black/40 backdrop-blur-lg">
          <CardHeader className="space-y-1">
            <div className="flex justify-center">
              <div className="mb-2 h-12 w-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600" />
            </div>
            <CardTitle className="text-center text-2xl text-white">
              Welcome to BlvckWall AI
            </CardTitle>
            <CardDescription className="text-center text-gray-400">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="sign-in" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="mb-6 grid w-full grid-cols-2 bg-gray-800/50">
                <TabsTrigger value="sign-in">Sign In</TabsTrigger>
                <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="sign-in">
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500"
                      required
                    />
                  </div>
                  
                  {error && (
                    <div className="text-red-400 text-sm">
                      {error}
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                      </>
                    ) : (
                      'Continue with Email'
                    )}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="sign-up">
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500"
                      required
                    />
                  </div>
                  
                  {error && (
                    <div className="text-red-400 text-sm">
                      {error}
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full bg-gray-700" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-black/40 px-2 text-gray-400">or</span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="mt-6 w-full border-gray-700 bg-transparent text-white hover:bg-gray-800"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
              )}
              Continue with Google
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-gray-800 px-6 py-4">
            <p className="text-center text-sm text-gray-400">
              By signing in, you agree to our{' '}
              <a href="#" className="text-blue-400 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-blue-400 hover:underline">
                Privacy Policy
              </a>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}