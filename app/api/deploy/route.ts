import { NextResponse } from 'next/server';
//import { cookies } from 'next/headers';
import { supabaseServer } from '@/lib/supabase';

export async function POST(req: Request) {
  console.log('[API:deploy] POST request');
  try {
    const { target } = await req.json();
    console.log('[API:deploy] POST payload:', { target });
    
    const cookieStore = cookies();
    const supabase = supabaseServer(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[API:deploy] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In a real implementation, this would trigger a deployment
    // For demo, we return mock data
    const deploymentId = `deploy_${Date.now()}`;
    const deployUrl = `https://${target === 'production' ? 'blvckwall-ai.vercel.app' : 'blvckwall-ai-staging.vercel.app'}`;

    // Record deployment in activity feed
    await supabase
      .from('activity_feed')
      .insert([{
        user_id: user.id,
        activity_type: 'deployment',
        title: `Deployment to ${target}`,
        description: `Successfully deployed to ${target} environment`,
        metadata: {
          deployment_id: deploymentId,
          target,
          url: deployUrl
        },
        is_read: false
      }]);

    console.log('[API:deploy] Deployment recorded:', deploymentId);
    return NextResponse.json({ 
      deployment_id: deploymentId,
      url: deployUrl,
      status: 'success',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[API:deploy] POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to deploy' },
      { status: 500 }
    );
  }
}