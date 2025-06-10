'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Users, Phone, DollarSign, Heart, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase-browser';


type CallAnalyticsRow = {
  sentiment_score?: number;
  quality_score?: number;
  upsell_likelihood?: number;
  compliance_flags?: any[];
  anomaly_flags?: string[];
  call?: {
    cost?: number;
    callee?: string;
    started_at?: string;
    agent?: { name?: string };
  };
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState({
    totalCalls: 0,
    avgSentiment: 0,
    avgQuality: 0,
    upsellOpportunities: 0,
    complianceIssues: 0,
    revenueAttribution: 0,
  });
  const [sentimentHeatmap, setSentimentHeatmap] = useState<any[]>([]);
  const [recentAnomalies, setRecentAnomalies] = useState<any[]>([]);

  useEffect(() => {
    console.log('[AnalyticsUI] Component mounted');
    fetchAnalytics();
    fetchSentimentHeatmap();
    fetchAnomalies();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data: callAnalytics, error } = await (supabase as any)
        .from('call_analytics')
        .select(`
          sentiment_score,
          quality_score,
          upsell_likelihood,
          compliance_flags,
          call:calls(cost)
        `);

      if (error) throw error;

      const totalCalls = callAnalytics?.length || 0;
      const avgSentiment = callAnalytics?.reduce(
        (sum: number, a: CallAnalyticsRow) => sum + (a.sentiment_score || 0), 0
      ) / totalCalls || 0;
      const avgQuality = callAnalytics?.reduce(
        (sum: number, a: CallAnalyticsRow) => sum + (a.quality_score || 0), 0
      ) / totalCalls || 0;
      const upsellOpportunities = callAnalytics?.filter(
        (a: CallAnalyticsRow) => (a.upsell_likelihood || 0) > 0.7
      ).length || 0;
      const complianceIssues = callAnalytics?.filter(
        (a: CallAnalyticsRow) => (a.compliance_flags ?? []).length > 0
      ).length || 0;
      const revenueAttribution = callAnalytics?.reduce(
        (sum: number, a: CallAnalyticsRow) => sum + (a.call?.cost || 0), 0
      ) || 0;

      setAnalytics({
        totalCalls,
        avgSentiment,
        avgQuality,
        upsellOpportunities,
        complianceIssues,
        revenueAttribution,
      });
    } catch (error) {
      console.error('[AnalyticsUI] Error fetching analytics:', error);
    }
  };

  const fetchSentimentHeatmap = async () => {
    console.log('[AnalyticsUI] Fetching sentiment heatmap...');
    try {
      // Fetch sentiment data for the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('call_analytics')
        .select(`
          sentiment_score,
          call:calls(started_at, callee)
        `)
        .gte('calls.started_at', sevenDaysAgo.toISOString());

      if (error) throw error;

      // Group by day and calculate average sentiment
      const heatmapData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));

const dayData = data?.filter(item => {
  const callDate = item.call?.started_at ? new Date(item.call?.started_at) : null;
  return callDate && callDate >= dayStart && callDate <= dayEnd;
}) || [];

        const avgSentiment = dayData.length > 0 
          ? dayData.reduce((sum, item) => sum + (item.sentiment_score || 0), 0) / dayData.length
          : 0;

        heatmapData.push({
          date: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
          sentiment: avgSentiment,
          calls: dayData.length,
        });
      }

      setSentimentHeatmap(heatmapData);
    } catch (error) {
      console.error('[AnalyticsUI] Error fetching sentiment heatmap:', error);
    }
  };

  const fetchAnomalies = async () => {
    console.log('[AnalyticsUI] Fetching anomalies...');
    try {
      const { data, error } = await supabase
        .from('call_analytics')
        .select(`
          anomaly_flags,
          call:calls(id, callee, started_at, agent:agents(name))
        `)
        .not('anomaly_flags', 'eq', '[]')
        .order('calls.started_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentAnomalies(data || []);
      console.log('[AnalyticsUI] Anomalies fetched:', data?.length || 0);
    } catch (error) {
      console.error('[AnalyticsUI] Error fetching anomalies:', error);
    }
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.3) return 'bg-green-500';
    if (sentiment > -0.3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSentimentEmoji = (sentiment: number) => {
    if (sentiment > 0.3) return '😊';
    if (sentiment > -0.3) return '😐';
    return '😞';
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-gray-800 bg-[#121212]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Total Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.totalCalls}</div>
            <p className="text-xs text-gray-400">All time</p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-[#121212]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Avg Sentiment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              {getSentimentEmoji(analytics.avgSentiment)}
              {analytics.avgSentiment.toFixed(2)}
            </div>
            <p className="text-xs text-gray-400">-1 to +1 scale</p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-[#121212]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Upsell Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{analytics.upsellOpportunities}</div>
            <p className="text-xs text-gray-400">{">"}70% likelihood</p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-[#121212]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Quality Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.avgQuality.toFixed(1)}/10</div>
            <p className="text-xs text-gray-400">Average call quality</p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-[#121212]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Compliance Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{analytics.complianceIssues}</div>
            <p className="text-xs text-gray-400">Flagged calls</p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-[#121212]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Attribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${analytics.revenueAttribution.toFixed(2)}</div>
            <p className="text-xs text-gray-400">AI-driven revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Sentiment Heatmap */}
      <Card className="border-gray-800 bg-[#121212]">
        <CardHeader>
          <CardTitle>Weekly Sentiment Heat Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {sentimentHeatmap.map((day, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-gray-400 mb-1">{day.date}</div>
                <div 
                  className={`h-16 rounded-lg flex items-center justify-center text-white font-bold ${getSentimentColor(day.sentiment)}`}
                >
                  {getSentimentEmoji(day.sentiment)}
                </div>
                <div className="text-xs text-gray-400 mt-1">{day.calls} calls</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Anomalies */}
      <Card className="border-gray-800 bg-[#121212]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Recent Anomalies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAnomalies.map((anomaly, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-800 rounded-lg">
                <div>
                  <div className="font-medium">{anomaly.call?.callee}</div>
                  <div className="text-sm text-gray-400">
                    {anomaly.call?.agent?.name} • {new Date(anomaly.call?.started_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-1">
                  {anomaly.anomaly_flags?.map((flag: string, flagIndex: number) => (
                    <Badge key={flagIndex} variant="destructive" className="text-xs">
                      {flag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
            {recentAnomalies.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                No anomalies detected recently
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}