import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase'
//import { cookies } from 'next/headers';

export async function POST(req: Request) {
  console.log('[API:data-export] POST request');
  try {
    const { export_type, filters } = await req.json();
    console.log('[API:data-export] POST payload:', { export_type, filters });
    //const cookieStore = cookies();
    const supabase = supabaseServer();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[API:data-export] POST Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create export record
    const { data: exportRecord, error: exportError } = await supabase
      .from('data_exports')
      .insert([{
        user_id: user.id,
        export_type,
        status: 'processing',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      }])
      .select()
      .single();

    if (exportError) throw exportError;

    // Process export based on type
    let data;
    let filename;

    switch (export_type) {
      case 'calls':
        data = await exportCalls(supabase, user.id, filters);
        filename = `calls-export-${Date.now()}.csv`;
        break;
      case 'agents':
        data = await exportAgents(supabase, user.id);
        filename = `agents-export-${Date.now()}.csv`;
        break;
      case 'analytics':
        data = await exportAnalytics(supabase, user.id, filters);
        filename = `analytics-export-${Date.now()}.csv`;
        break;
      case 'hr_requests':
        data = await exportHRRequests(supabase, user.id, filters);
        filename = `hr-requests-export-${Date.now()}.csv`;
        break;
      case 'all':
        data = await exportAllData(supabase, user.id);
        filename = `complete-export-${Date.now()}.json`;
        break;
      default:
        throw new Error('Invalid export type');
    }

    // In a real implementation, you would upload this to cloud storage
    // For now, we'll create a data URL
    const dataUrl = `data:${export_type === 'all' ? 'application/json' : 'text/csv'};base64,${Buffer.from(data).toString('base64')}`;

    // Update export record with file info
    const { error: updateError } = await supabase
      .from('data_exports')
      .update({
        status: 'completed',
        file_url: dataUrl,
        file_size_bytes: Buffer.byteLength(data),
      })
      .eq('id', exportRecord.id);

    if (updateError) throw updateError;

    console.log('[API:data-export] POST response:', { export_id: exportRecord.id, filename });
    return NextResponse.json({ 
      export_id: exportRecord.id,
      download_url: dataUrl,
      filename,
    });
  } catch (error) {
    console.error('[API:data-export] POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to create export' },
      { status: 500 }
    );
  }
}

async function exportCalls(supabase: any, userId: string, filters: any) {
  const { data, error } = await supabase
    .from('calls')
    .select(`
      *,
      agent:agents(name),
      analytics:call_analytics(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Convert to CSV
  const headers = ['Date', 'Agent', 'Callee', 'Direction', 'Status', 'Duration', 'Cost', 'Sentiment'];
  const rows = data.map((call: any) => [
    new Date(call.created_at).toISOString(),
    call.agent?.name || '',
    call.callee,
    call.direction,
    call.status,
    call.duration_seconds || '',
    call.cost || '',
    call.analytics?.[0]?.sentiment_score || '',
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

async function exportAgents(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;

  const headers = ['Name', 'Voice', 'Voice Engine', 'Temperature', 'Interruption Sensitivity', 'Created'];
  const rows = data.map((agent: any) => [
    agent.name,
    agent.voice,
    agent.voice_engine || 'retell',
    agent.temperature,
    agent.interruption_sensitivity,
    new Date(agent.created_at).toISOString(),
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

async function exportAnalytics(supabase: any, userId: string, filters: any) {
  const { data, error } = await supabase
    .from('call_analytics')
    .select(`
      *,
      call:calls(callee, started_at, agent:agents(name))
    `)
    .eq('call.user_id', userId);

  if (error) throw error;

  const headers = ['Date', 'Agent', 'Callee', 'Sentiment', 'Quality', 'Upsell Likelihood', 'Compliance Flags'];
  const rows = data.map((analytics: any) => [
    new Date(analytics.call?.started_at).toISOString(),
    analytics.call?.agent?.name || '',
    analytics.call?.callee || '',
    analytics.sentiment_score || '',
    analytics.quality_score || '',
    analytics.upsell_likelihood || '',
    (analytics.compliance_flags || []).join(';'),
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

async function exportHRRequests(supabase: any, userId: string, filters: any) {
  const { data, error } = await supabase
    .from('hr_requests')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;

  const headers = ['Date', 'Employee Name', 'Employee Phone', 'Request Type', 'Reason', 'Status'];
  const rows = data.map((request: any) => [
    new Date(request.created_at).toISOString(),
    request.employee_name || '',
    request.employee_phone,
    request.request_type,
    request.reason || '',
    request.status,
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

async function exportAllData(supabase: any, userId: string) {
  const [calls, agents, analytics, hrRequests, events, knowledgeBases] = await Promise.all([
    supabase.from('calls').select('*').eq('user_id', userId),
    supabase.from('agents').select('*').eq('user_id', userId),
    supabase.from('call_analytics').select('*'),
    supabase.from('hr_requests').select('*').eq('user_id', userId),
    supabase.from('events').select('*').eq('user_id', userId),
    supabase.from('knowledge_bases').select('*').eq('user_id', userId),
  ]);

  const exportData = {
    export_date: new Date().toISOString(),
    user_id: userId,
    data: {
      calls: calls.data || [],
      agents: agents.data || [],
      analytics: analytics.data || [],
      hr_requests: hrRequests.data || [],
      events: events.data || [],
      knowledge_bases: knowledgeBases.data || [],
    },
  };

  return JSON.stringify(exportData, null, 2);
}

export async function GET() {
  console.log('[API:data-export] GET request');
  try {
   // const cookieStore = cookies();
    const supabase = supabaseServer();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[API:data-export] GET Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: exports, error } = await supabase
      .from('data_exports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log('[API:data-export] GET response:', exports);
    return NextResponse.json({ exports });
  } catch (error) {
    console.error('[API:data-export] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exports' },
      { status: 500 }
    );
  }
}