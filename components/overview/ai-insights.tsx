'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, X, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AIInsight {
  id: string;
  type: 'warning' | 'success' | 'info' | 'critical';
  title: string;
  description: string;
  action?: string;
  actionUrl?: string;
  threshold?: number;
  currentValue?: number;
  dismissed?: boolean;
}

const insightIcons = {
  warning: AlertTriangle,
  success: CheckCircle,
  info: Brain,
  critical: Zap,
};

const insightColors = {
  warning: 'border-yellow-500 bg-yellow-500/10',
  success: 'border-green-500 bg-green-500/10',
  info: 'border-blue-500 bg-blue-500/10',
  critical: 'border-red-500 bg-red-500/10',
};

const iconColors = {
  warning: 'text-yellow-400',
  success: 'text-green-400',
  info: 'text-blue-400',
  critical: 'text-red-400',
};

export function AIInsights() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [dismissedInsights, setDismissedInsights] = useState<Set<string>>(new Set());

  useEffect(() => {
    console.log('[AIInsights] Component mounted');
    generateInsights();
    
    // Simulate real-time insights
    const interval = setInterval(() => {
      generateInsights();
    }, 30000); // Update every 30 seconds

    return () => {
      clearInterval(interval);
      console.log('[AIInsights] Component unmounted');
    };
  }, []);

  const generateInsights = () => {
    console.log('[AIInsights] Generating AI insights...');
    
    // Simulate API usage monitoring
    const apiUsage = Math.random() * 100;
    const callVolume = Math.random() * 200;
    const errorRate = Math.random() * 10;
    const sentimentScore = Math.random() * 2 - 1; // -1 to 1

    const newInsights: AIInsight[] = [];

    // API Usage Insight
    if (apiUsage > 80) {
      newInsights.push({
        id: 'api-usage',
        type: apiUsage > 95 ? 'critical' : 'warning',
        title: 'High API Usage Detected',
        description: `API usage is at ${apiUsage.toFixed(1)}% of your monthly limit`,
        action: 'View Usage Details',
        actionUrl: '/portal/settings',
        threshold: 80,
        currentValue: apiUsage,
      });
    }

    // Call Volume Insight
    if (callVolume > 150) {
      newInsights.push({
        id: 'call-volume',
        type: 'info',
        title: 'Increased Call Activity',
        description: `Call volume is ${((callVolume / 100 - 1) * 100).toFixed(0)}% above average`,
        action: 'View Analytics',
        actionUrl: '/portal/analytics',
        currentValue: callVolume,
      });
    }

    // Error Rate Insight
    if (errorRate > 5) {
      newInsights.push({
        id: 'error-rate',
        type: errorRate > 8 ? 'critical' : 'warning',
        title: 'Elevated Error Rate',
        description: `${errorRate.toFixed(1)}% of calls are experiencing errors`,
        action: 'Check Logs',
        actionUrl: '/portal/analytics',
        threshold: 5,
        currentValue: errorRate,
      });
    }

    // Sentiment Insight
    if (sentimentScore < -0.3) {
      newInsights.push({
        id: 'sentiment',
        type: 'warning',
        title: 'Declining Customer Sentiment',
        description: 'Recent calls show negative sentiment trends',
        action: 'Review Calls',
        actionUrl: '/portal/calls-in',
        currentValue: sentimentScore,
      });
    } else if (sentimentScore > 0.5) {
      newInsights.push({
        id: 'sentiment-positive',
        type: 'success',
        title: 'Excellent Customer Satisfaction',
        description: 'Customer sentiment is trending very positive',
        currentValue: sentimentScore,
      });
    }

    // Performance Insight
    if (Math.random() > 0.7) {
      newInsights.push({
        id: 'performance',
        type: 'success',
        title: 'AI Performance Optimized',
        description: 'Your agents are performing 23% better than last week',
        action: 'View Report',
        actionUrl: '/portal/analytics',
      });
    }

    // Filter out dismissed insights
    const filteredInsights = newInsights.filter(insight => !dismissedInsights.has(insight.id));
    setInsights(filteredInsights);
    console.log('[AIInsights] Generated insights:', filteredInsights.length);
  };

  const dismissInsight = (insightId: string) => {
    console.log('[AIInsights] Dismissing insight:', insightId);
    setDismissedInsights(prev => new Set([...prev, insightId]));
    setInsights(prev => prev.filter(insight => insight.id !== insightId));
  };

  const handleAction = (insight: AIInsight) => {
    console.log('[AIInsights] Handling action for insight:', insight.id);
    if (insight.actionUrl) {
      window.location.href = insight.actionUrl;
    }
  };

  if (insights.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {insights.map((insight) => {
          const Icon = insightIcons[insight.type];
          const colorClass = insightColors[insight.type];
          const iconColorClass = iconColors[insight.type];

          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`border ${colorClass} backdrop-blur-sm`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-full bg-gray-900/50 ${iconColorClass}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{insight.title}</h4>
                          <Badge variant="outline" className="text-xs capitalize">
                            {insight.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400 mb-3">
                          {insight.description}
                        </p>
                        
                        {insight.currentValue !== undefined && (
                          <div className="mb-3">
                            {insight.threshold && (
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-gray-400">Current:</span>
                                <span className={insight.currentValue > insight.threshold ? 'text-red-400' : 'text-green-400'}>
                                  {insight.currentValue.toFixed(1)}
                                  {insight.id === 'api-usage' || insight.id === 'error-rate' ? '%' : ''}
                                </span>
                                {insight.threshold && (
                                  <>
                                    <span className="text-gray-400">/ Threshold:</span>
                                    <span className="text-gray-300">{insight.threshold}%</span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {insight.action && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction(insight)}
                            className="text-xs h-7"
                          >
                            {insight.action}
                          </Button>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissInsight(insight.id)}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}