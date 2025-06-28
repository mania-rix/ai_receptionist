import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseServer } from '@/lib/supabase';
import { 
  recordCallAudit, 
  recordVideoAudit, 
  recordCardAudit, 
  recordComplianceAudit, 
  recordHRAudit,
  getAuditTransaction
} from '@/lib/algorand';

export async function POST(req: Request) {
  console.log('[API:blockchain-audit] POST request');
  try {
    const { type, resource_id, details } = await req.json();
    console.log('[API:blockchain-audit] POST payload:', { type, resource_id });
    
    const cookieStore = cookies();
    const supabase = supabaseServer(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[API:blockchain-audit] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let transaction;
    
    // Record audit based on type
    switch (type) {
      case 'call':
        transaction = await recordCallAudit(resource_id, user.id, details);
        break;
      case 'video':
        transaction = await recordVideoAudit(resource_id, user.id, details);
        break;
      case 'card':
        transaction = await recordCardAudit(resource_id, user.id, details);
        break;
      case 'compliance':
        transaction = await recordComplianceAudit(resource_id, user.id, details);
        break;
      case 'hr_request':
        transaction = await recordHRAudit(resource_id, user.id, details);
        break;
      default:
        throw new Error(`Invalid audit type: ${type}`);
    }

    console.log('[API:blockchain-audit] Audit recorded:', transaction.id);
    return NextResponse.json({ transaction });
  } catch (error) {
    console.error('[API:blockchain-audit] POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to record audit' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  console.log('[API:blockchain-audit] GET request');
  try {
    const { searchParams } = new URL(req.url);
    const txnId = searchParams.get('txn_id');
    
    const cookieStore = cookies();
    const supabase = supabaseServer(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[API:blockchain-audit] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!txnId) {
      // Return mock transactions for demo
      const transactions = [
        {
          id: 'TXN7RJIK2IXOOKH2YGQXWQZLXNO',
          type: 'call',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          hash: 'TXN7RJIK...XLXNO',
          block: 30123456,
          explorer_url: 'https://testnet.algoexplorer.io/tx/TXN7RJIK2IXOOKH2YGQXWQZLXNO',
          metadata: {
            action: 'call_completed',
            user_id: user.id,
            resource_id: 'call_456',
            details: {
              callee: '+1234567890',
              duration: 180,
              status: 'completed'
            }
          }
        },
        {
          id: 'TXN8SJLM3JYPPLI3ZHRYXR0MYOP',
          type: 'video',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          hash: 'TXN8SJLM...MYOP',
          block: 30123445,
          explorer_url: 'https://testnet.algoexplorer.io/tx/TXN8SJLM3JYPPLI3ZHRYXR0MYOP',
          metadata: {
            action: 'video_generated',
            user_id: user.id,
            resource_id: 'video_789',
            details: {
              patient_name: 'Sarah Johnson',
              doctor_name: 'Dr. Smith',
              template: 'medical'
            }
          }
        }
      ];

      console.log('[API:blockchain-audit] GET response:', transactions.length);
      return NextResponse.json({ transactions });
    }

    // Get specific transaction
    const transaction = await getAuditTransaction(txnId);
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    console.log('[API:blockchain-audit] GET transaction:', transaction.id);
    return NextResponse.json({ transaction });
  } catch (error) {
    console.error('[API:blockchain-audit] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit transactions' },
      { status: 500 }
    );
  }
}