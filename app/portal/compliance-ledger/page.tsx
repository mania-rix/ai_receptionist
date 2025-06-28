'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, ExternalLink, Search, Filter, Calendar, Hash, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase-browser';
import { algorandAPI, type AlgorandTransaction } from '@/lib/algorand';

export default function ComplianceLedgerPage() {
  const [transactions, setTransactions] = useState<AlgorandTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<AlgorandTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [stats, setStats] = useState({
    totalTransactions: 0,
    callAudits: 0,
    videoAudits: 0,
    cardAudits: 0,
    complianceAudits: 0,
    hrAudits: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    console.log('[ComplianceLedger] Component mounted');
    loadDemoTransactions();
    calculateStats();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [searchTerm, typeFilter, transactions]);

  const loadDemoTransactions = () => {
    console.log('[ComplianceLedger] Loading demo transactions...');
    
    const demoTransactions: AlgorandTransaction[] = [
      {
        id: 'TXN7RJIK2IXOOKH2YGQXWQZLXNO',
        type: 'call',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        hash: 'TXN7RJIK...XLXNO',
        block: 30123456,
        explorer_url: 'https://testnet.algoexplorer.io/tx/TXN7RJIK2IXOOKH2YGQXWQZLXNO',
        metadata: {
          action: 'call_completed',
          user_id: 'user_123',
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
          user_id: 'user_123',
          resource_id: 'video_789',
          details: {
            patient_name: 'Sarah Johnson',
            doctor_name: 'Dr. Smith',
            template: 'medical'
          }
        }
      },
      {
        id: 'TXN9TKMN4KZQQMJ4AISZYQ1NZPQ',
        type: 'card',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        hash: 'TXN9TKMN...NZPQ',
        block: 30123434,
        explorer_url: 'https://testnet.algoexplorer.io/tx/TXN9TKMN4KZQQMJ4AISZYQ1NZPQ',
        metadata: {
          action: 'card_created',
          user_id: 'user_123',
          resource_id: 'card_101',
          details: {
            name: 'Dr. Sarah Johnson',
            company: 'BlvckWall Medical AI',
            ipfs_hash: 'QmDemo123456789SarahJohnson'
          }
        }
      },
      {
        id: 'TXN0ULNO5L0RRNK5BJTA0R2O0QR',
        type: 'compliance',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        hash: 'TXN0ULNO...O0QR',
        block: 30123423,
        explorer_url: 'https://testnet.algoexplorer.io/tx/TXN0ULNO5L0RRNK5BJTA0R2O0QR',
        metadata: {
          action: 'compliance_check',
          user_id: 'user_123',
          resource_id: 'script_202',
          details: {
            script_name: 'HIPAA Compliance',
            compliance_rate: 94.5,
            violations: 2
          }
        }
      },
      {
        id: 'TXN1VMOP6M1SSOL6CKUB1S3P1RS',
        type: 'hr_request',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        hash: 'TXN1VMOP...P1RS',
        block: 30123412,
        explorer_url: 'https://testnet.algoexplorer.io/tx/TXN1VMOP6M1SSOL6CKUB1S3P1RS',
        metadata: {
          action: 'hr_request_processed',
          user_id: 'user_123',
          resource_id: 'hr_303',
          details: {
            employee_name: 'John Doe',
            request_type: 'sick_leave',
            status: 'approved'
          }
        }
      }
    ];

    setTransactions(demoTransactions);
    setIsLoading(false);
    console.log('[ComplianceLedger] Demo transactions loaded:', demoTransactions.length);
  };

  const calculateStats = () => {
    console.log('[ComplianceLedger] Calculating stats...');
    const stats = {
      totalTransactions: transactions.length,
      callAudits: transactions.filter(t => t.type === 'call').length,
      videoAudits: transactions.filter(t => t.type === 'video').length,
      cardAudits: transactions.filter(t => t.type === 'card').length,
      complianceAudits: transactions.filter(t => t.type === 'compliance').length,
      hrAudits: transactions.filter(t => t.type === 'hr_request').length,
    };
    setStats(stats);
  };

  const filterTransactions = () => {
    console.log('[ComplianceLedger] Filtering transactions:', { searchTerm, typeFilter });
    let filtered = transactions;

    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => t.type === typeFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.metadata.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.metadata.resource_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  };

  const openExplorer = (url: string) => {
    console.log('[ComplianceLedger] Opening explorer:', url);
    window.open(url, '_blank');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'call': return '📞';
      case 'video': return '🎥';
      case 'card': return '💳';
      case 'compliance': return '🛡️';
      case 'hr_request': return '👥';
      default: return '📄';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'call': return 'bg-blue-500';
      case 'video': return 'bg-purple-500';
      case 'card': return 'bg-green-500';
      case 'compliance': return 'bg-orange-500';
      case 'hr_request': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compliance Ledger</h1>
          <p className="text-gray-400 mt-1">Blockchain audit trail powered by Algorand</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Algorand Testnet
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-gray-800 bg-[#121212]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Total Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalTransactions}</div>
            <p className="text-xs text-gray-400">Recorded on blockchain</p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-[#121212]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Call Audits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">{stats.callAudits}</div>
            <p className="text-xs text-gray-400">Call completions logged</p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-[#121212]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Compliance Checks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-400">{stats.complianceAudits}</div>
            <p className="text-xs text-gray-400">Compliance audits</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-gray-800 bg-[#121212]">
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="call">Call Audits</SelectItem>
                <SelectItem value="video">Video Generation</SelectItem>
                <SelectItem value="card">Digital Cards</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="hr_request">HR Requests</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 border border-gray-800 rounded-lg hover:bg-gray-900/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${getTypeColor(transaction.type)}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getTypeIcon(transaction.type)}</span>
                      <span className="font-medium">{transaction.metadata.action.replace(/_/g, ' ')}</span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {transaction.type}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      <span>Block #{transaction.block}</span>
                      <span className="mx-2">•</span>
                      <span>{formatTimestamp(transaction.timestamp)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-mono text-sm">{transaction.hash}</div>
                    <div className="text-xs text-gray-400">
                      Resource: {transaction.metadata.resource_id}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openExplorer(transaction.explorer_url)}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}

            {filteredTransactions.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <Shield className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">No transactions found matching your criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Blockchain Info */}
      <Card className="border-gray-800 bg-[#121212]">
        <CardHeader>
          <CardTitle>Blockchain Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Network Details</h4>
              <div className="space-y-1 text-sm text-gray-400">
                <div>Network: Algorand Testnet</div>
                <div>Explorer: AlgoExplorer</div>
                <div>API: Nodely.io</div>
                <div>Consensus: Pure Proof-of-Stake</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Audit Features</h4>
              <div className="space-y-1 text-sm text-gray-400">
                <div>• Immutable transaction records</div>
                <div>• Cryptographic proof of integrity</div>
                <div>• Transparent audit trail</div>
                <div>• Real-time verification</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}