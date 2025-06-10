'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Phone, User, AlertTriangle, Settings, FileText, Calendar, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase-browser';

interface ActivityItem {
  id: string;
  type: 'call' | 'agent' | 'alert' | 'api' | 'hr' | 'compliance' | 'event';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  metadata?: any;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

const activityIcons = {
  call: Phone,
  agent: User,
  alert: AlertTriangle,
  api: Settings,
  hr: FileText,
  compliance: Shield,
  event: Calendar,
};

const activityColors = {
  call: 'text-blue-400',
  agent: 'text-green-400',
  alert: 'text-red-400',
  api: 'text-purple-400',
  hr: 'text-yellow-400',
  compliance: 'text-orange-400',
  event: 'text-pink-400',
};

export function ActivityTimeline() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('[ActivityTimeline] Component mounted');
    fetchActivities();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('activity_timeline')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'activity_feed' },
        (payload) => {
          console.log('[ActivityTimeline] New activity received:', payload.new);
          const newActivity = transformActivityData(payload.new);
          setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      console.log('[ActivityTimeline] Component unmounted');
    };
  }, []);

  const fetchActivities = async () => {
    console.log('[ActivityTimeline] Fetching activities...');
    try {
      const { data, error } = await supabase
        .from('activity_feed')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const transformedActivities = data?.map(transformActivityData) || [];
      setActivities(transformedActivities);
      console.log('[ActivityTimeline] Activities fetched:', transformedActivities.length);
    } catch (error) {
      console.error('[ActivityTimeline] Error fetching activities:', error);
      // Add mock data for demo
      setActivities(getMockActivities());
    } finally {
      setIsLoading(false);
    }
  };

  const transformActivityData = (item: any): ActivityItem => {
    return {
      id: item.id,
      type: item.activity_type,
      title: item.title,
      description: item.description || '',
      timestamp: item.created_at,
      metadata: item.metadata,
      severity: item.metadata?.severity || 'medium',
    };
  };

  const getMockActivities = (): ActivityItem[] => [
    {
      id: '1',
      type: 'call',
      title: 'Outbound call completed',
      description: 'Call to +1234567890 completed successfully',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      user: 'AI Agent Sarah',
      severity: 'low',
    },
    {
      id: '2',
      type: 'agent',
      title: 'New agent created',
      description: 'Customer Support Agent v2 has been configured',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      user: 'Admin User',
      severity: 'medium',
    },
    {
      id: '3',
      type: 'alert',
      title: 'High call volume detected',
      description: 'Unusual spike in inbound calls - 150% above average',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      severity: 'high',
    },
    {
      id: '4',
      type: 'compliance',
      title: 'Compliance check passed',
      description: 'All calls in the last hour passed HIPAA compliance',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      severity: 'low',
    },
    {
      id: '5',
      type: 'hr',
      title: 'Time-off request approved',
      description: 'John Doe\'s sick leave request has been approved',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      user: 'HR Manager',
      severity: 'medium',
    },
  ];

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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <Card className="border-gray-800 bg-[#121212]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-700 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-gray-800 bg-[#121212]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {activities.map((activity, index) => {
                const Icon = activityIcons[activity.type] || Settings;
                const colorClass = activityColors[activity.type] || 'text-gray-400';
                
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-900/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedActivity(activity)}
                  >
                    <div className="relative">
                      <div className={`p-2 rounded-full bg-gray-900 ${colorClass}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getSeverityColor(activity.severity || 'medium')}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">{activity.title}</p>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {formatTimestamp(activity.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 truncate">
                        {activity.description}
                      </p>
                      {activity.user && (
                        <Badge variant="outline" className="text-xs mt-2">
                          {activity.user}
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {activities.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <Clock className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activity Detail Modal */}
      <Dialog open={!!selectedActivity} onOpenChange={() => setSelectedActivity(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedActivity && (
                <>
                  {(() => {
                    const Icon = activityIcons[selectedActivity.type] || Settings;
                    return <Icon className={`h-5 w-5 ${activityColors[selectedActivity.type]}`} />;
                  })()}
                  Activity Details
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedActivity && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">{selectedActivity.title}</h4>
                <p className="text-sm text-gray-400 mt-1">{selectedActivity.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Type:</span>
                  <p className="capitalize">{selectedActivity.type}</p>
                </div>
                <div>
                  <span className="text-gray-400">Severity:</span>
                  <Badge className={`${getSeverityColor(selectedActivity.severity || 'medium')} text-white`}>
                    {selectedActivity.severity}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-400">Time:</span>
                  <p>{new Date(selectedActivity.timestamp).toLocaleString()}</p>
                </div>
                {selectedActivity.user && (
                  <div>
                    <span className="text-gray-400">User:</span>
                    <p>{selectedActivity.user}</p>
                  </div>
                )}
              </div>

              {selectedActivity.metadata && (
                <div>
                  <span className="text-gray-400 text-sm">Metadata:</span>
                  <pre className="text-xs bg-gray-900 rounded p-2 mt-1 overflow-auto">
                    {JSON.stringify(selectedActivity.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}