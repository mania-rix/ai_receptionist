'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Plus, Download, Mic, Settings, Users, BarChart3, Zap, Video, CreditCard, Hash, Bug, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface QuickAction {
  id: string;
  title: string; 
  description: string; 
  icon: any;
  color: string;
  action: () => void;
  disabled?: boolean;
}

export function QuickActions() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showAllActions, setShowAllActions] = useState(false);

  const handleStartCall = () => {
    console.log('[QuickActions] Starting call action');
    setIsLoading('start-call');
    setTimeout(() => {
      setIsLoading(null);
      router.push('/portal/calls-out');
    }, 1000);
  };

  const handleAddAgent = () => {
    console.log('[QuickActions] Adding agent action');
    setIsLoading('add-agent');
    setTimeout(() => {
      setIsLoading(null);
      router.push('/portal/agents');
    }, 1000);
  };

  const handleVideoSummary = () => {
    console.log('[QuickActions] Video summary action');
    setIsLoading('video-summary');
    setTimeout(() => {
      setIsLoading(null);
      router.push('/portal/video-summaries');
    }, 1000);
  };

  const handleDigitalCards = () => {
    console.log('[QuickActions] Digital cards action');
    setIsLoading('digital-cards');
    setTimeout(() => {
      setIsLoading(null);
      router.push('/portal/digital-cards');
    }, 1000);
  };

  const handleComplianceLedger = () => {
    console.log('[QuickActions] Compliance ledger action');
    setIsLoading('compliance-ledger');
    setTimeout(() => {
      setIsLoading(null);
      router.push('/portal/compliance-ledger');
    }, 1000);
  };

  const handleDebugConsole = () => {
    console.log('[QuickActions] Debug console action');
    setIsLoading('debug-console');
    setTimeout(() => {
      setIsLoading(null);
      router.push('/portal/debug-console');
    }, 1000);
  };

  const handleExportData = async () => {
    console.log('[QuickActions] Exporting data action');
    setIsLoading('export-data');
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

      toast({
        title: 'Export Complete',
        description: 'Your data has been exported successfully',
      });
    } catch (error) {
      console.error('[QuickActions] Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleVoiceCommand = () => {
    console.log('[QuickActions] Voice command action');
    setIsLoading('voice-command');
    setTimeout(() => {
      setIsLoading(null);
      router.push('/portal/voice-analytics');
    }, 1000);
  };

  const handleQuickSettings = () => {
    console.log('[QuickActions] Quick settings action');
    setIsLoading('settings');
    setTimeout(() => {
      setIsLoading(null);
      router.push('/portal/settings');
    }, 1000);
  };

  const handleViewAnalytics = () => {
    console.log('[QuickActions] View analytics action');
    setIsLoading('analytics');
    setTimeout(() => {
      setIsLoading(null);
      router.push('/portal/analytics');
    }, 1000);
  };

  const mainActions: QuickAction[] = [
    {
      id: 'start-call',
      title: 'Start Call',
      description: 'Initiate an outbound AI call',
      icon: Phone,
      color: 'text-green-400 bg-green-500/10 border-green-500/20',
      action: handleStartCall,
    },
    {
      id: 'add-agent',
      title: 'Add Agent',
      description: 'Create a new AI agent',
      icon: Plus,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      action: handleAddAgent,
    },
    {
      id: 'export-data',
      title: 'Export Data',
      description: 'Download your data',
      icon: Download,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      action: handleExportData,
    },
    {
      id: 'voice-command',
      title: 'Voice Assistant',
      description: 'Ask questions with voice',
      icon: Mic,
      color: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      action: handleVoiceCommand,
    },
    {
      id: 'settings',
      title: 'Quick Settings',
      description: 'Manage preferences',
      icon: Settings,
      color: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
      action: handleQuickSettings,
    },
    {
      id: 'analytics',
      title: 'View Analytics',
      description: 'Check performance metrics',
      icon: BarChart3,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      action: handleViewAnalytics,
    },
  ];

  const additionalActions: QuickAction[] = [
    {
      id: 'video-summary',
      title: 'Video Summary',
      description: 'Generate doctor\'s note videos',
      icon: Video,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      action: handleVideoSummary,
    },
    {
      id: 'digital-cards',
      title: 'Digital Cards',
      description: 'Create blockchain business cards',
      icon: CreditCard,
      color: 'text-green-400 bg-green-500/10 border-green-500/20',
      action: handleDigitalCards,
    },
    {
      id: 'compliance-ledger',
      title: 'Audit Ledger',
      description: 'View blockchain audit trail',
      icon: Hash,
      color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
      action: handleComplianceLedger,
    },
    {
      id: 'debug-console',
      title: 'Debug Console',
      description: 'Monitor errors and logs',
      icon: Bug,
      color: 'text-red-400 bg-red-500/10 border-red-500/20',
      action: handleDebugConsole,
    },
  ];

  const allActions = [
    ...mainActions,
    ...additionalActions
  ];

  return (
    <Card className="border-gray-800 bg-[#121212]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 mb-1">
          <Zap className="h-5 w-5 text-yellow-400" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 min-w-0 relative pb-6">
          {(showAllActions ? allActions : mainActions).map((action, index) => {
            const Icon = action.icon;
            const isCurrentlyLoading = isLoading === action.id;
            
            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant="outline"
                  onClick={action.action}
                  disabled={isCurrentlyLoading || action.disabled}
                  className={`h-auto py-4 px-3 flex flex-col items-center gap-2 w-full border ${action.color} hover:scale-105 transition-all duration-200 min-w-0`}
                >
                  <div className="relative">
                    <Icon className="h-6 w-6" />
                    {isCurrentlyLoading && (
                      <motion.div
                        className="absolute inset-0 border-2 border-current border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    )}
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-sm line-clamp-1 break-all">{action.title}</div>
                    <div className="text-xs text-gray-400 mt-1 line-clamp-2 break-all leading-tight h-8 overflow-hidden">{action.description}</div>
                  </div> 
                </Button>
              </motion.div>
            );
          })}
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute bottom-0 right-0"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllActions(!showAllActions)}
              className="text-xs"
            >
              {showAllActions ? (
                <>
                  <X className="h-3 w-3 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3 mr-1" />
                  Show More
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}