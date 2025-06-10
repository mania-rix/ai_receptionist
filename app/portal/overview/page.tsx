'use client'

import { useEffect } from 'react';
import { ActivityTimeline } from '@/components/overview/activity-timeline';
import { AIInsights } from '@/components/overview/ai-insights';
import { QuickActions } from '@/components/overview/quick-actions';
import { VoiceAssistant } from '@/components/overview/voice-assistant';
import { BusinessHealthScore } from '@/components/overview/business-health-score';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function OverviewPage() {
  const email = 'demo@blvckwall.ai'

  useEffect(() => {
      console.log('[OverviewUI] Component mounted');
      console.log('[OverviewUI] Loading dashboard for user:', email);
    return () => {
      console.log('[OverviewUI] Component unmounted');
    };
  }, []);
  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600" />
          <span className="text-sm">{email}</span>
        </div>
      </div>

      {/* AI Insights Banner */}
      <AIInsights />

      {/* Card grid (static placeholder) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {['AI Credits', 'Active Projects', 'API Calls'].map((title, i) => (
          <Card key={i} className="border-gray-800 bg-[#121212]">
            <CardHeader className="pb-2">
              <CardTitle>{title}</CardTitle>
              <CardDescription className="text-gray-400">
                Sample stat card
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{[1500, 3, 8942][i]}</div>
              <p className="text-xs text-gray-400">Static placeholder</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Widgets Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <QuickActions />
        <VoiceAssistant />
        <BusinessHealthScore />
      </div>

      {/* Activity Timeline */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityTimeline />
        </div>
        <div className="space-y-6">
          {/* Weather Widget Placeholder */}
          <Card className="border-gray-800 bg-[#121212]">
            <CardHeader>
              <CardTitle>Weather</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-4xl mb-2">☀️</div>
                <div className="text-2xl font-bold">72°F</div>
                <div className="text-sm text-gray-400">Sunny in San Francisco</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
