'use client';

import { useState, useEffect } from 'react';
import { useStorage } from '@/contexts/storage-context';
import { Bell, X, Check, AlertTriangle, User, Phone, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase-browser';

interface ActivityItem {
  id: string;
  activity_type: string;
  title: string;
  description: string;
  metadata: any;
  is_read: boolean;
  created_at: string;
}

export function NotificationDrawer() {
  const { currentUser } = useStorage();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (currentUser?.id) {
      console.log('[NotificationDrawer] Component mounted for user:', currentUser.id);
      fetchActivities();
    }
    
    return () => {
      console.log('[NotificationDrawer] Component unmounted');
    };
  }, [currentUser]);

  const fetchActivities = async () => {
    if (!currentUser?.id) return;
    
    console.log('[NotificationDrawer] Fetching activities...');
    try {
      const { data, error } = await supabase
        .from('activity_feed')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setActivities(data || []);
      setUnreadCount((data || []).filter(item => !item.is_read).length);
      console.log('[NotificationDrawer] Activities fetched:', data?.length || 0);
    } catch (error) {
      console.error('[NotificationDrawer] Error fetching activities:', error);
      // For demo, provide mock data if API fails
      const mockActivities = getMockActivities();
      setActivities(mockActivities);
      setUnreadCount(mockActivities.filter(item => !item.is_read).length);
    }
  };

  const getMockActivities = (): ActivityItem[] => [
    {
      id: '1',
      activity_type: 'call_completed',
      title: 'Outbound call completed',
      description: 'Call to +1234567890 completed successfully',
      metadata: {},
      is_read: false,
      created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      activity_type: 'agent_created',
      title: 'New agent created',
      description: 'Customer Support Agent v2 has been configured',
      metadata: {},
      is_read: false,
      created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      activity_type: 'alert',
      title: 'High call volume detected',
      description: 'Unusual spike in inbound calls - 150% above average',
      metadata: {},
      is_read: true,
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
  ];

  const markAsRead = async (id: string) => {
    if (!currentUser?.id) return;
    
    console.log('[NotificationDrawer] Marking as read:', id);
    try {
      const { error } = await supabase
        .from('activity_feed')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', currentUser.id);

      if (error) throw error;

      setActivities(prev => 
        prev.map(item => 
          item.id === id ? { ...item, is_read: true } : item
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('[NotificationDrawer] Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!currentUser?.id) return;
    
    console.log('[NotificationDrawer] Marking all as read');
    try {
      const { error } = await supabase
        .from('activity_feed')
        .update({ is_read: true })
        .eq('is_read', false)
        .eq('user_id', currentUser.id);

      if (error) throw error;

      setActivities(prev => 
        prev.map(item => ({ ...item, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('[NotificationDrawer] Error marking all as read:', error);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call_completed': return <Phone className="h-4 w-4" />;
      case 'agent_created': return <User className="h-4 w-4" />;
      case 'event_rsvp': return <Calendar className="h-4 w-4" />;
      case 'compliance_violation': return <AlertTriangle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'call_completed': return 'text-green-400';
      case 'agent_created': return 'text-blue-400';
      case 'event_rsvp': return 'text-purple-400';
      case 'compliance_violation': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-12 w-80 max-h-96 overflow-hidden border-gray-800 bg-[#121212] z-50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Activity Feed</CardTitle>
              <div className="flex items-center gap-2">
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-80 overflow-y-auto">
              {activities.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <Bell className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">No recent activity</p>
                </div>
              ) : (
                activities.map((activity) => (
                  <div
                    key={activity.id}
                    className={`p-3 border-b border-gray-800 cursor-pointer hover:bg-gray-900/50 ${
                      !activity.is_read ? 'bg-blue-950/20' : ''
                    }`}
                    onClick={() => !activity.is_read && markAsRead(activity.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 ${getActivityColor(activity.activity_type)}`}>
                        {getActivityIcon(activity.activity_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">
                            {activity.title}
                          </p>
                          {!activity.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}