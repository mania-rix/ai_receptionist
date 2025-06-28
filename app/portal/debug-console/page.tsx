'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bug, AlertTriangle, Info, CheckCircle, ExternalLink, Trash2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import * as Sentry from '@sentry/nextjs';

interface ErrorLog {
  id: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  stack?: string;
  user_id?: string;
  url?: string;
  browser?: string;
}

export default function DebugConsolePage() {
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    console.log('[DebugConsole] Component mounted');
    loadDemoLogs();
  }, []);

  const loadDemoLogs = () => {
    console.log('[DebugConsole] Loading demo error logs...');
    const demoLogs: ErrorLog[] = [
      {
        id: 'error_1',
        level: 'error',
        message: 'Failed to fetch voice data from ElevenLabs API',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        stack: 'Error: Network timeout\n    at fetch (/api/voices)\n    at VoicesPage.fetchVoices',
        user_id: 'user_123',
        url: '/portal/agents',
        browser: 'Chrome 120.0.0'
      },
      {
        id: 'error_2',
        level: 'warning',
        message: 'Tavus API rate limit approaching',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        user_id: 'user_123',
        url: '/portal/video-summaries',
        browser: 'Chrome 120.0.0'
      },
      {
        id: 'error_3',
        level: 'info',
        message: 'User successfully authenticated',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        user_id: 'user_123',
        url: '/auth/blvckwall',
        browser: 'Chrome 120.0.0'
      },
      {
        id: 'error_4',
        level: 'error',
        message: 'Supabase connection timeout',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        stack: 'Error: Connection timeout\n    at supabase.from()\n    at fetchAgents',
        user_id: 'user_456',
        url: '/portal/agents',
        browser: 'Firefox 121.0'
      },
      {
        id: 'error_5',
        level: 'warning',
        message: 'IPFS upload took longer than expected',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        user_id: 'user_789',
        url: '/portal/digital-cards',
        browser: 'Safari 17.2'
      }
    ];

    setErrorLogs(demoLogs);
  };

  const triggerTestError = () => {
    console.log('[DebugConsole] Triggering test error...');
    setIsLoading(true);

    try {
      // Capture a test error with Sentry
      Sentry.captureException(new Error('Test error from Debug Console'));
      
      // Add to local logs
      const testError: ErrorLog = {
        id: `error_${Date.now()}`,
        level: 'error',
        message: 'Test error triggered from Debug Console',
        timestamp: new Date().toISOString(),
        stack: 'Error: Test error\n    at triggerTestError\n    at DebugConsole.onClick',
        user_id: 'current_user',
        url: '/portal/debug-console',
        browser: navigator.userAgent.split(' ').pop() || 'Unknown'
      };

      setErrorLogs(prev => [testError, ...prev]);

      toast({
        title: 'Test Error Triggered',
        description: 'Error has been captured and sent to Sentry',
      });
    } catch (error) {
      console.error('[DebugConsole] Error triggering test error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = () => {
    console.log('[DebugConsole] Clearing error logs...');
    setErrorLogs([]);
    toast({
      title: 'Logs Cleared',
      description: 'All error logs have been cleared',
    });
  };

  const refreshLogs = () => {
    console.log('[DebugConsole] Refreshing error logs...');
    loadDemoLogs();
    toast({
      title: 'Logs Refreshed',
      description: 'Error logs have been refreshed',
    });
  };

  const openSentryDashboard = () => {
    console.log('[DebugConsole] Opening Sentry dashboard...');
    window.open('https://blvckwall.sentry.io/issues/?project=4509577920184320', '_blank');
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'info': return <Info className="h-4 w-4 text-blue-400" />;
      default: return <Bug className="h-4 w-4 text-gray-400" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'border-red-500/20 bg-red-950/20';
      case 'warning': return 'border-yellow-500/20 bg-yellow-950/20';
      case 'info': return 'border-blue-500/20 bg-blue-950/20';
      default: return 'border-gray-500/20 bg-gray-950/20';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Debug Console</h1>
          <p className="text-gray-400 mt-1">Error monitoring and debugging powered by Sentry</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshLogs}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={openSentryDashboard}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Sentry Dashboard
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-gray-800 bg-[#121212]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-400">
              {errorLogs.filter(log => log.level === 'error').length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-[#121212]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-400">
              {errorLogs.filter(log => log.level === 'warning').length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-[#121212]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-400" />
              Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">
              {errorLogs.filter(log => log.level === 'info').length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-[#121212]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{errorLogs.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card className="border-gray-800 bg-[#121212]">
        <CardHeader>
          <CardTitle>Debug Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button 
              onClick={triggerTestError} 
              disabled={isLoading}
              variant="destructive"
            >
              <Bug className="mr-2 h-4 w-4" />
              {isLoading ? 'Triggering...' : 'Trigger Test Error'}
            </Button>
            <Button variant="outline" onClick={clearLogs}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Logs
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Use the test error button to verify Sentry integration is working correctly.
          </p>
        </CardContent>
      </Card>

      {/* Error Logs */}
      <Card className="border-gray-800 bg-[#121212]">
        <CardHeader>
          <CardTitle>Recent Error Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {errorLogs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 border rounded-lg ${getLevelColor(log.level)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getLevelIcon(log.level)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{log.message}</span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {log.level}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-400 space-y-1">
                        <div>
                          <span>Time: {formatTimestamp(log.timestamp)}</span>
                          {log.url && <span className="ml-4">URL: {log.url}</span>}
                        </div>
                        {log.browser && (
                          <div>Browser: {log.browser}</div>
                        )}
                        {log.user_id && (
                          <div>User: {log.user_id}</div>
                        )}
                      </div>
                      {log.stack && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
                            Stack Trace
                          </summary>
                          <pre className="text-xs bg-gray-900 rounded p-2 mt-1 overflow-auto">
                            {log.stack}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {errorLogs.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">No error logs found</p>
                <p className="text-xs mt-1">Trigger a test error to see how monitoring works</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sentry Integration Info */}
      <Card className="border-gray-800 bg-[#121212]">
        <CardHeader>
          <CardTitle>Sentry Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Configuration</h4>
              <div className="space-y-1 text-sm text-gray-400">
                <div>Organization: BlvckWall</div>
                <div>Project: AI Receptionist</div>
                <div>Environment: Development</div>
                <div>Sample Rate: 100%</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Features</h4>
              <div className="space-y-1 text-sm text-gray-400">
                <div>• Real-time error tracking</div>
                <div>• Performance monitoring</div>
                <div>• Session replay</div>
                <div>• Release tracking</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}