/*/import { cookies } from 'next/headers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
//import { createServerSupabaseClient } from '@/lib/supabase';

export default async function OverviewPage() {
  const cookieStore = cookies();
  const supabase = createServerSupabaseClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  const email = user?.email || 'User';

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600" />
          <span className="text-sm">{email}</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-gray-800 bg-[#121212]">
          <CardHeader className="pb-2">
            <CardTitle>AI Credits</CardTitle>
            <CardDescription className="text-gray-400">
              Available processing power
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,500</div>
            <p className="text-xs text-gray-400">+250 credits added this month</p>
          </CardContent>
        </Card>
        
        <Card className="border-gray-800 bg-[#121212]">
          <CardHeader className="pb-2">
            <CardTitle>Active Projects</CardTitle>
            <CardDescription className="text-gray-400">
              Current workloads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3</div>
            <p className="text-xs text-gray-400">2 running • 1 paused</p>
          </CardContent>
        </Card>
        
        <Card className="border-gray-800 bg-[#121212]">
          <CardHeader className="pb-2">
            <CardTitle>API Calls</CardTitle>
            <CardDescription className="text-gray-400">
              Last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8,942</div>
            <p className="text-xs text-gray-400">↑ 23% from last period</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-gray-800 bg-[#121212]">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription className="text-gray-400">
            Your latest interactions with the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 rounded-lg border border-gray-800 bg-[#1A1A1A] p-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 flex items-center justify-center">
                  <div className="h-5 w-5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium">Project {i} processed</p>
                  <p className="text-sm text-gray-400">
                    {i * 12} MB of data processed successfully
                  </p>
                </div>
                <div className="text-right text-sm text-gray-400">
                  {i * 2}h ago
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
*/ //disable auth for dev purpose


'use client'

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
    </div>
  )
}
