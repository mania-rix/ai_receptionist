'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HealthMetric {
  name: string;
  value: number;
  weight: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

export function BusinessHealthScore() {
  const [score, setScore] = useState(0);
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('[BusinessHealthScore] Component mounted');
    calculateHealthScore();
    
    // Update score every 30 seconds
    const interval = setInterval(calculateHealthScore, 30000);
    
    return () => {
      clearInterval(interval);
      console.log('[BusinessHealthScore] Component unmounted');
    };
  }, []);

  const calculateHealthScore = () => {
    console.log('[BusinessHealthScore] Calculating health score...');
    
    // Simulate real metrics
    const newMetrics: HealthMetric[] = [
      {
        name: 'Call Success Rate',
        value: 92 + Math.random() * 6, // 92-98%
        weight: 0.25,
        trend: Math.random() > 0.5 ? 'up' : 'stable',
        change: Math.random() * 5,
      },
      {
        name: 'Customer Sentiment',
        value: 75 + Math.random() * 20, // 75-95%
        weight: 0.20,
        trend: Math.random() > 0.3 ? 'up' : 'down',
        change: Math.random() * 8,
      },
      {
        name: 'Agent Performance',
        value: 85 + Math.random() * 10, // 85-95%
        weight: 0.20,
        trend: Math.random() > 0.4 ? 'up' : 'stable',
        change: Math.random() * 6,
      },
      {
        name: 'System Uptime',
        value: 98 + Math.random() * 2, // 98-100%
        weight: 0.15,
        trend: 'stable',
        change: Math.random() * 2,
      },
      {
        name: 'Compliance Rate',
        value: 88 + Math.random() * 10, // 88-98%
        weight: 0.10,
        trend: Math.random() > 0.6 ? 'up' : 'stable',
        change: Math.random() * 4,
      },
      {
        name: 'Revenue Growth',
        value: 70 + Math.random() * 25, // 70-95%
        weight: 0.10,
        trend: Math.random() > 0.4 ? 'up' : 'down',
        change: Math.random() * 12,
      },
    ];

    // Calculate weighted score
    const totalScore = newMetrics.reduce((sum, metric) => {
      return sum + (metric.value * metric.weight);
    }, 0);

    setMetrics(newMetrics);
    setScore(Math.round(totalScore));
    setIsLoading(false);
    
    console.log('[BusinessHealthScore] Health score calculated:', Math.round(totalScore));
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 75) return 'text-yellow-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 90) return 'from-green-500 to-emerald-500';
    if (score >= 75) return 'from-yellow-500 to-orange-500';
    if (score >= 60) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Attention';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-400" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-400" />;
      default: return <Activity className="h-3 w-3 text-gray-400" />;
    }
  };

  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  if (isLoading) {
    return (
      <Card className="border-gray-800 bg-[#121212]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Business Health Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-purple-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-800 bg-[#121212]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Business Health Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Animated Score Ring */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-800"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="transparent"
                  strokeLinecap="round"
                  strokeDasharray={strokeDasharray}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" className={`stop-color-${getScoreGradient(score).split(' ')[0].replace('from-', '')}`} />
                    <stop offset="100%" className={`stop-color-${getScoreGradient(score).split(' ')[1].replace('to-', '')}`} />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Score display */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className={`text-3xl font-bold ${getScoreColor(score)}`}
                  >
                    {score}
                  </motion.div>
                  <div className="text-xs text-gray-400">
                    {getScoreLabel(score)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Health Metrics</span>
              <Badge variant="outline" className={getScoreColor(score)}>
                {getScoreLabel(score)}
              </Badge>
            </div>
            
            <div className="space-y-2">
              {metrics.map((metric, index) => (
                <motion.div
                  key={metric.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300">{metric.name}</span>
                    {getTrendIcon(metric.trend)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={getScoreColor(metric.value)}>
                      {metric.value.toFixed(0)}%
                    </span>
                    {metric.trend !== 'stable' && (
                      <span className={`text-xs ${metric.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                        {metric.trend === 'up' ? '+' : '-'}{metric.change.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Insights */}
          <div className="pt-4 border-t border-gray-800">
            <div className="text-xs text-gray-400 space-y-1">
              <div>• Last updated: {new Date().toLocaleTimeString()}</div>
              <div>• Based on {metrics.length} key performance indicators</div>
              <div>• Updates every 30 seconds</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}