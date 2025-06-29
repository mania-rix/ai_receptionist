'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, AlertTriangle, User, Phone, Calendar, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase-browser';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  category: 'system' | 'calls' | 'agents' | 'hr' | 'compliance';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

const notificationIcons = {
  system: Settings,
  calls: Phone,
  agents: User,
  hr: User,
  compliance: AlertTriangle,
};

const notificationColors = {
  info: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  warning: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  error: 'text-red-400 bg-red-500/10 border-red-500/20',
  success: 'text-green-400 bg-green-500/10 border-green-500/20',
};

export function NotificationDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    console.log('[NotificationDrawer] Component mounted');
    fetchNotifications();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'activity_feed' },
        (payload) => {
          const newNotification = transformActivityToNotification(payload.new);
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      );
    
    channel.subscribe();

    return () => {
      channel.unsubscribe();
      console.log('[NotificationDrawer] Component unmounted');
    };
  }, []);

  const fetchNotifications = async () => {
    console.log('[NotificationDrawer] Fetching notifications...');
    try {
      // Generate mock notifications for demo
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'info',
          category: 'calls',
          title: 'New inbound call completed',
          description: 'Call from +1234567890 handled by Agent Sarah',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          isRead: false,
          actionUrl: '/portal/calls-in',
          actionLabel: 'View Call'
        },
        {
          id: '2',
          type: 'warning',
          category: 'system',
          title: 'High API usage detected',
          description: 'API usage is at 85% of monthly limit',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          isRead: false,
          actionUrl: '/portal/settings',
          actionLabel: 'View Usage'
        },
        {
          id: '3',
          type: 'success',
          category: 'agents',
          title: 'Agent performance improved',
          description: 'Customer Support Agent v2 showing 23% better results',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          isRead: true,
          actionUrl: '/portal/analytics',
          actionLabel: 'View Report'
        },
        {
          id: '4',
          type: 'error',
          category: 'compliance',
          title: 'Compliance violation detected',
          description: 'Call missing required HIPAA disclosure',
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          isRead: false,
          actionUrl: '/portal/compliance',
          actionLabel: 'Review Call'
        },
        {
          id: '5',
          type: 'info',
          category: 'hr',
          title: 'New time-off request',
          description: 'John Doe submitted sick leave request',
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          isRead: true,
          actionUrl: '/portal/hr-center',
          actionLabel: 'Review Request'
        }
      ];

      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
      console.log('[NotificationDrawer] Notifications loaded:', mockNotifications.length);
    } catch (error) {
      console.error('[NotificationDrawer] Error fetching notifications:', error);
    }
  };

  const transformActivityToNotification = (activity: any): Notification => {
    return {
      id: activity.id,
      type: 'info',
      category: activity.activity_type,
      title: activity.title,
      description: activity.description || '',
      timestamp: activity.created_at,
      isRead: false,
    };
  };

  const markAsRead = async (id: string) => {
    console.log('[NotificationDrawer] Marking notification as read:', id);
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    console.log('[NotificationDrawer] Marking all notifications as read');
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    setUnreadCount(0);
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.isRead;
    return notification.category === activeTab;
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-9 w-9 p-0 text-gray-400 hover:text-white hover:bg-white/5"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 40,
                mass: 0.8
              }}
              className="fixed right-0 top-0 h-full w-96 bg-[#0A0A0A]/95 backdrop-blur-xl border-l border-gray-800 z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <div>
                  <h2 className="text-lg font-semibold text-white">Notifications</h2>
                  <p className="text-sm text-gray-400">
                    {unreadCount} unread notifications
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs text-gray-400 hover:text-white"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Mark all read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="grid grid-cols-4 mx-6 mt-4 bg-gray-900/50">
                  <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                  <TabsTrigger value="unread" className="text-xs">Unread</TabsTrigger>
                  <TabsTrigger value="system" className="text-xs">System</TabsTrigger>
                  <TabsTrigger value="calls" className="text-xs">Calls</TabsTrigger>
                </TabsList>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                  <TabsContent value={activeTab} className="h-full m-0">
                    <div className="h-full overflow-y-auto px-6 py-4 space-y-3">
                      <AnimatePresence mode="popLayout">
                        {filteredNotifications.map((notification, index) => {
                          const Icon = notificationIcons[notification.category] || Bell;
                          
                          return (
                            <motion.div
                              key={notification.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ delay: index * 0.05 }}
                              className={`relative p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:bg-white/5 ${
                                notification.isRead 
                                  ? 'bg-gray-900/30 border-gray-800' 
                                  : 'bg-white/5 border-gray-700'
                              }`}
                              onClick={() => !notification.isRead && markAsRead(notification.id)}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${notificationColors[notification.type]}`}>
                                  <Icon className="h-4 w-4" />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-sm font-medium text-white truncate">
                                      {notification.title}
                                    </h4>
                                    {!notification.isRead && (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                    )}
                                  </div>
                                  
                                  <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                                    {notification.description}
                                  </p>
                                  
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">
                                      {formatTimestamp(notification.timestamp)}
                                    </span>
                                    
                                    {notification.actionUrl && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 text-xs text-blue-400 hover:text-blue-300"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          window.location.href = notification.actionUrl!;
                                        }}
                                      >
                                        {notification.actionLabel || 'View'}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                      
                      {filteredNotifications.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <Bell className="h-12 w-12 text-gray-600 mb-4" />
                          <h3 className="text-sm font-medium text-gray-400 mb-1">
                            No notifications
                          </h3>
                          <p className="text-xs text-gray-500">
                            {activeTab === 'unread' 
                              ? "You're all caught up!" 
                              : "New notifications will appear here"
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}