// Algorand blockchain integration for audit ledger and proof-of-action
const ALGORAND_API_BASE = 'https://testnet-api.algonode.cloud';
const ALGORAND_INDEXER_BASE = 'https://testnet-idx.algonode.cloud';

export interface AlgorandTransaction {
  id: string;
  type: 'call' | 'video' | 'card' | 'compliance' | 'hr_request';
  timestamp: string;
  hash: string;
  block: number;
  explorer_url: string;
  metadata: {
    action: string;
    user_id: string;
    resource_id: string;
    details: any;
  };
}

export interface AlgorandAccount {
  address: string;
  balance: number;
  created_at_round: number;
}

class AlgorandAPI {
  private apiKey: string;
  private demoMode: boolean;

  constructor() {
    this.apiKey = process.env.ALGORAND_API_KEY || '';
    this.demoMode = !this.apiKey;
    if (this.demoMode) {
      console.warn('[AlgorandLib] ALGORAND_API_KEY not found - using demo mode');
    }
    console.log('[AlgorandLib] Algorand API initialized');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    console.log('[AlgorandLib] Making request to:', endpoint);
    
    // Demo mode - return mock data if no API key
    if (this.demoMode) {
      return this.getMockResponse(endpoint, options);
    }

    const url = `${ALGORAND_API_BASE}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AlgorandLib] API error:', response.status, errorText);
      throw new Error(`Algorand API error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('[AlgorandLib] Request successful');
    return result;
  }

  private getMockResponse(endpoint: string, options: RequestInit) {
    console.log('[AlgorandLib] Using mock response for demo');
    
    if (endpoint.includes('/transactions')) {
      const mockTxId = `TXN${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
      const mockBlock = Math.floor(Math.random() * 1000000) + 30000000;
      
      return {
        id: mockTxId,
        confirmed_round: mockBlock,
        txn: {
          type: 'appl',
          note: Buffer.from(JSON.stringify({
            action: 'audit_log',
            timestamp: new Date().toISOString(),
            type: 'demo'
          })).toString('base64')
        }
      };
    }

    if (endpoint.includes('/accounts')) {
      return {
        address: 'DEMO7RJIK2IXOOKH2YGQXWQZLXNOKH2YGQXWQZLXNOKH2YGQXWQZLXNO',
        amount: 1000000, // 1 ALGO in microAlgos
        'created-at-round': 30000000
      };
    }

    return {};
  }

  // Record audit log on blockchain (demo implementation)
  async recordAuditLog(data: {
    type: 'call' | 'video' | 'card' | 'compliance' | 'hr_request';
    action: string;
    user_id: string;
    resource_id: string;
    details: any;
  }): Promise<AlgorandTransaction> {
    console.log('[AlgorandLib] Recording audit log:', data.type, data.action);
    
    const auditData = {
      ...data,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };

    // In demo mode, create mock transaction
    if (this.demoMode) {
      const mockTxId = `TXN${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
      const mockBlock = Math.floor(Math.random() * 1000000) + 30000000;
      
      return {
        id: mockTxId,
        type: data.type,
        timestamp: auditData.timestamp,
        hash: `${mockTxId.substring(0, 8)}...${mockTxId.substring(-8)}`,
        block: mockBlock,
        explorer_url: `https://testnet.algoexplorer.io/tx/${mockTxId}`,
        metadata: {
          action: data.action,
          user_id: data.user_id,
          resource_id: data.resource_id,
          details: data.details
        }
      };
    }

    // Real implementation would create and submit transaction
    const txnData = await this.request('/v2/transactions', {
      method: 'POST',
      body: JSON.stringify({
        note: Buffer.from(JSON.stringify(auditData)).toString('base64'),
        type: 'appl'
      })
    });

    return {
      id: txnData.id,
      type: data.type,
      timestamp: auditData.timestamp,
      hash: `${txnData.id.substring(0, 8)}...${txnData.id.substring(-8)}`,
      block: txnData.confirmed_round,
      explorer_url: `https://testnet.algoexplorer.io/tx/${txnData.id}`,
      metadata: {
        action: data.action,
        user_id: data.user_id,
        resource_id: data.resource_id,
        details: data.details
      }
    };
  }

  // Get transaction by ID
  async getTransaction(txnId: string): Promise<AlgorandTransaction | null> {
    console.log('[AlgorandLib] Getting transaction:', txnId);
    
    if (this.demoMode) {
      return {
        id: txnId,
        type: 'call',
        timestamp: new Date().toISOString(),
        hash: `${txnId.substring(0, 8)}...${txnId.substring(-8)}`,
        block: Math.floor(Math.random() * 1000000) + 30000000,
        explorer_url: `https://testnet.algoexplorer.io/tx/${txnId}`,
        metadata: {
          action: 'demo_action',
          user_id: 'demo_user',
          resource_id: 'demo_resource',
          details: { demo: true }
        }
      };
    }

    try {
      const txnData = await this.request(`/v2/transactions/${txnId}`);
      
      let metadata = {};
      if (txnData.txn.note) {
        try {
          const noteData = Buffer.from(txnData.txn.note, 'base64').toString();
          metadata = JSON.parse(noteData);
        } catch (e) {
          console.warn('[AlgorandLib] Could not parse transaction note');
        }
      }

      return {
        id: txnData.id,
        type: (metadata as any).type || 'unknown',
        timestamp: (metadata as any).timestamp || new Date().toISOString(),
        hash: `${txnData.id.substring(0, 8)}...${txnData.id.substring(-8)}`,
        block: txnData.confirmed_round,
        explorer_url: `https://testnet.algoexplorer.io/tx/${txnData.id}`,
        metadata: metadata as any
      };
    } catch (error) {
      console.error('[AlgorandLib] Error fetching transaction:', error);
      return null;
    }
  }

  // Get account info
  async getAccountInfo(address: string): Promise<AlgorandAccount> {
    console.log('[AlgorandLib] Getting account info:', address);
    
    if (this.demoMode) {
      return {
        address,
        balance: 1.5, // ALGO
        created_at_round: 30000000
      };
    }

    const accountData = await this.request(`/v2/accounts/${address}`);
    
    return {
      address: accountData.address,
      balance: accountData.amount / 1000000, // Convert microAlgos to Algos
      created_at_round: accountData['created-at-round']
    };
  }
}

export const algorandAPI = new AlgorandAPI();

// Helper functions for common audit operations
export async function recordCallAudit(callId: string, userId: string, details: any) {
  console.log('[AlgorandLib] Recording call audit:', callId);
  return algorandAPI.recordAuditLog({
    type: 'call',
    action: 'call_completed',
    user_id: userId,
    resource_id: callId,
    details
  });
}

export async function recordVideoAudit(videoId: string, userId: string, details: any) {
  console.log('[AlgorandLib] Recording video audit:', videoId);
  return algorandAPI.recordAuditLog({
    type: 'video',
    action: 'video_generated',
    user_id: userId,
    resource_id: videoId,
    details
  });
}

export async function recordCardAudit(cardId: string, userId: string, details: any) {
  console.log('[AlgorandLib] Recording card audit:', cardId);
  return algorandAPI.recordAuditLog({
    type: 'card',
    action: 'card_created',
    user_id: userId,
    resource_id: cardId,
    details
  });
}

export async function recordComplianceAudit(scriptId: string, userId: string, details: any) {
  console.log('[AlgorandLib] Recording compliance audit:', scriptId);
  return algorandAPI.recordAuditLog({
    type: 'compliance',
    action: 'compliance_check',
    user_id: userId,
    resource_id: scriptId,
    details
  });
}

export async function recordHRAudit(requestId: string, userId: string, details: any) {
  console.log('[AlgorandLib] Recording HR audit:', requestId);
  return algorandAPI.recordAuditLog({
    type: 'hr_request',
    action: 'hr_request_processed',
    user_id: userId,
    resource_id: requestId,
    details
  });
}

export async function getAuditTransaction(txnId: string) {
  console.log('[AlgorandLib] Getting audit transaction:', txnId);
  return algorandAPI.getTransaction(txnId);
}