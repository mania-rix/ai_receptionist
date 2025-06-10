'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, AlertTriangle, Info, CheckCircle, Clock, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase-browser';

interface Notification {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success' | 'task';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  actionLabel?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

const notificationIcons = {
  error: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle,
  task: Clock,
};

const notificationColors = {
  error: 'text-red-400',
  warning: 'text-yellow-400',
  info: 'text-blue-400',
  success: 'text-green-400',
  task: 'text-purple-400',
};

const priorityColors = {
  low: 'bg-gray-500',
  medium: 'bg-blue-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
};

export function NotificationDrawer() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    console.log('[NotificationDrawer] Component mounted');
    generateMockNotifications();
    
    // Set up real-time subscription for notifications
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'activity_feed' },
        (payload) => {
          console.log('[NotificationDrawer] New notification received:', payload.new);
          const newNotification = transformToNotification(payload.new);
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      console.log('[NotificationDrawer] Component unmounted');
    };
  }, []);

  useEffect(() => {
    const unread = notifications.filter(n => !n.isRead).length;
    setUnreadCount(unread);
  }, [notifications]);

  const transformToNotification = (activityItem: any): Notification => {
    return {
      id: activityItem.id,
      type: getNotificationType(activityItem.activity_type),
      title: activityItem.title,
      description: activityItem.description || '',
      timestamp: activityItem.created_at,
      isRead: false,
      priority: activityItem.metadata?.priority || 'medium',
    };
  };

  const getNotificationType = (activityType: string): Notification['type'] => {
    switch (activityType) {
      case 'alert': return 'error';
      case 'compliance_violation': return 'warning';
      case 'call_completed': return 'success';
      case 'agent_created': return 'info';
      default: return 'info';
    }
  };

  const generateMockNotifications = () => {
    console.log('[NotificationDrawer] Generating mock notifications...');
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'error',
        title: 'API Rate Limit Exceeded',
        description: 'Your application has exceeded the API rate limit. Some calls may fail.',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        isRead: false,
        actionUrl: '/portal/settings',
        actionLabel: 'Upgrade Plan',
        priority: 'critical',
      },
      {
        id: '2',
        type: 'warning',
        title: 'Agent Performance Alert',
        description: 'Customer Support Agent has a lower success rate than usual.',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        isRead: false,
        actionUrl: '/portal/agents',
        actionLabel: 'Review Agent',
        priority: 'high',
      },
      {
        id: '3',
        type: 'success',
        title: 'Monthly Goal Achieved',
        description: 'Congratulations! You\'ve reached your monthly call target.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        isRead: true,
        priority: 'medium',
      },
      {
        id: '4',
        type: 'info',
        title: 'New Feature Available',
        description: 'Voice Analytics is now available in your dashboard.',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        isRead: false,
        actionUrl: '/portal/voice-analytics',
        actionLabel: 'Try Now',
        priority: 'low',
      },
      {
        id: '5',
        type: 'task',
        title: 'Compliance Review Due',
        description: 'Your monthly compliance review is due in 3 days.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isRead: false,
        actionUrl: '/portal/compliance',
        actionLabel: 'Start Review',
        priority: 'medium',
      },
    ];

    setNotifications(mockNotifications);
    console.log('[NotificationDrawer] Mock notifications generated:', mockNotifications.length);
  };

  const markAsRead = (notificationId: string) => {
    console.log('[NotificationDrawer] Marking notification as read:', notificationId);
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    console.log('[NotificationDrawer] Marking all notifications as read');
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const handleAction = (notification: Notification) => {
    console.log('[NotificationDrawer] Handling notification action:', notification.id);
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    markAsRead(notification.id);
  };

  const getFilteredNotifications = (type: string) => {
    if (type === 'all') return notifications;
    if (type === 'unread') return notifications.filter(n => !n.isRead);
    return notifications.filter(n => n.type === type);
  };

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
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
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
      </SheetTrigger>
      
      <SheetContent className="w-96 sm:w-[400px] bg-[#121212] border-gray-800">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-900">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="unread" className="text-xs">
                Unread
                {unreadCount > 0 && (
                  <Badge variant="secondary\" className="ml-1 h-4 w-4 p-0 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="error" className="text-xs">Errors</TabsTrigger>
              <TabsTrigger value="task" className="text-xs">Tasks</TabsTrigger>
            </TabsList>
            
            <div className="mt-4 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
              <AnimatePresence>
                {getFilteredNotifications(activeTab).map((notification) => {
                  const Icon = notificationIcons[notification.type];
                  const colorClass = notificationColors[notification.type];
                  const priorityColor = priorityColors[notification.priority];
                  
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card 
                        className={`border-gray-800 cursor-pointer transition-colors ${
                          !notification.isRead ? 'bg-blue-950/20 border-blue-800/50' : 'bg-gray-900/50'
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="relative">
                              <div className={`p-2 rounded-full bg-gray-900 ${colorClass}`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${priorityColor}`} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-sm font-medium truncate">
                                  {notification.title}
                                </h4>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                )}
                              </div>
                              
                              <p className="text-xs text-gray-400 mb-2">
                                {notification.description}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                  {formatTimestamp(notification.timestamp)}
                                </span>
                                
                                {notification.actionLabel && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAction(notification);
                                    }}
                                    className="text-xs h-6"
                                  >
                                    {notification.actionLabel}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              
              {getFilteredNotifications(activeTab).length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  <Bell className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">
                    {activeTab === 'unread' ? 'No unread notifications' : 'No notifications'}
                  </p>
                </div>
              )}
            </div>
          </Tabs>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}