'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Download, LogOut, Save, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';

interface UserProfile {
  email: string;
  name: string;
  avatar?: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  weeklyReports: boolean;
  securityAlerts: boolean;
}

interface LoginActivity {
  id: string;
  timestamp: string;
  location: string;
  device: string;
  ipAddress: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    email: '',
    name: '',
  });
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    weeklyReports: true,
    securityAlerts: true,
  });
  const [loginActivity, setLoginActivity] = useState<LoginActivity[]>([]);

  useEffect(() => {
    console.log('[SettingsUI] Component mounted');
    fetchUserProfile();
    fetchLoginActivity();
    
    return () => {
      console.log('[SettingsUI] Component unmounted');
    };
  }, []);

  const fetchUserProfile = async () => {
    console.log('[SettingsUI] Fetching user profile...');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setProfile({
          email: user.email || '',
          name: user.user_metadata?.name || user.email?.split('@')[0] || '',
        });
        console.log('[SettingsUI] User profile fetched:', user.email);
      }
    } catch (error) {
      console.error('[SettingsUI] Error fetching user profile:', error);
    }
  };

  const fetchLoginActivity = () => {
    console.log('[SettingsUI] Fetching login activity...');
    // Mock login activity data
    const mockActivity: LoginActivity[] = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        location: 'San Francisco, CA',
        device: 'Chrome on macOS',
        ipAddress: '192.168.1.1',
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        location: 'San Francisco, CA',
        device: 'Safari on iPhone',
        ipAddress: '192.168.1.2',
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'New York, NY',
        device: 'Chrome on Windows',
        ipAddress: '10.0.0.1',
      },
    ];
    setLoginActivity(mockActivity);
    console.log('[SettingsUI] Login activity fetched:', mockActivity.length);
  };

  const handleProfileSave = async () => {
    console.log('[SettingsUI] Saving profile:', profile);
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { name: profile.name }
      });

      if (error) throw error;

      console.log('[SettingsUI] Profile saved successfully');
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been saved successfully',
      });
    } catch (error) {
      console.error('[SettingsUI] Error saving profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationSave = () => {
    console.log('[SettingsUI] Saving notification settings:', notifications);
    // In a real app, this would save to the backend
    toast({
      title: 'Settings Saved',
      description: 'Your notification preferences have been updated',
    });
  };

  const handleDataExport = async () => {
    console.log('[SettingsUI] Exporting user data...');
    setIsLoading(true);
    try {
      const response = await fetch('/api/data-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          export_type: 'all',
          filters: {},
        }),
      });

      if (!response.ok) throw new Error('Export failed');

      const result = await response.json();
      
      // Create download link
      const link = document.createElement('a');
      link.href = result.download_url;
      link.download = result.filename;
      link.click();

      console.log('[SettingsUI] Data export completed');
      toast({
        title: 'Export Complete',
        description: 'Your data has been exported successfully',
      });
    } catch (error) {
      console.error('[SettingsUI] Error exporting data:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    console.log('[SettingsUI] Signing out...');
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-900">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="data">Data & Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="border-gray-800 bg-[#121212]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-purple-600 text-white text-xl">
                    {profile.name.charAt(0).toUpperCase() || profile.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Photo
                  </Button>
                  <p className="text-xs text-gray-400">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={profile.email}
                    disabled
                    className="bg-gray-900"
                  />
                  <p className="text-xs text-gray-400">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>
              </div>

              <Button onClick={handleProfileSave} disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-gray-800 bg-[#121212]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-gray-400">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <p className="text-sm text-gray-400">Receive browser push notifications</p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, pushNotifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sms-notifications">SMS Notifications</Label>
                    <p className="text-sm text-gray-400">Receive critical alerts via SMS</p>
                  </div>
                  <Switch
                    id="sms-notifications"
                    checked={notifications.smsNotifications}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, smsNotifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weekly-reports">Weekly Reports</Label>
                    <p className="text-sm text-gray-400">Receive weekly analytics summaries</p>
                  </div>
                  <Switch
                    id="weekly-reports"
                    checked={notifications.weeklyReports}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, weeklyReports: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="security-alerts">Security Alerts</Label>
                    <p className="text-sm text-gray-400">Receive security and login alerts</p>
                  </div>
                  <Switch
                    id="security-alerts"
                    checked={notifications.securityAlerts}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, securityAlerts: checked }))
                    }
                  />
                </div>
              </div>

              <Button onClick={handleNotificationSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="border-gray-800 bg-[#121212]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Recent Login Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loginActivity.map((activity) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 border border-gray-800 rounded-lg"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{activity.device}</span>
                        {activity.id === '1' && (
                          <Badge variant="outline" className="text-xs">Current</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">
                        {activity.location} • {activity.ipAddress}
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-[#121212]">
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Enable Two-Factor Authentication
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Download Recovery Codes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card className="border-gray-800 bg-[#121212]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Data Export
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-400">
                Download a copy of all your data including calls, agents, analytics, and settings.
              </p>
              <Button onClick={handleDataExport} disabled={isLoading}>
                <Download className="mr-2 h-4 w-4" />
                {isLoading ? 'Exporting...' : 'Export All Data'}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-[#121212]">
            <CardHeader>
              <CardTitle>Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Call recordings</span>
                  <span className="text-gray-400">90 days</span>
                </div>
                <div className="flex justify-between">
                  <span>Analytics data</span>
                  <span className="text-gray-400">1 year</span>
                </div>
                <div className="flex justify-between">
                  <span>Activity logs</span>
                  <span className="text-gray-400">6 months</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-800 bg-red-950/20">
            <CardHeader>
              <CardTitle className="text-red-400">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-400">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button variant="destructive" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}