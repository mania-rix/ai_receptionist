'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Server, Globe, CheckCircle, AlertTriangle, Loader2, GitBranch, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

interface Deployment {
  id: string;
  target: string;
  status: 'success' | 'failed' | 'in_progress';
  url?: string;
  timestamp: string;
}

export default function DeployPage() {
  const [deployments, setDeployments] = useState<Deployment[]>([
    {
      id: 'deploy_1685432100000',
      target: 'production',
      status: 'success',
      url: 'https://blvckwall-ai.vercel.app',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'deploy_1685345700000',
      target: 'staging',
      status: 'success',
      url: 'https://blvckwall-ai-staging.vercel.app',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployTarget, setDeployTarget] = useState('production');
  const { toast } = useToast();

  const deployToTarget = async () => {
    console.log('[DeployUI] Deploying to:', deployTarget);
    setIsDeploying(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create new deployment
      const newDeployment: Deployment = {
        id: `deploy_${Date.now()}`,
        target: deployTarget,
        status: 'in_progress',
        timestamp: new Date().toISOString()
      };

      setDeployments(prev => [newDeployment, ...prev]);

      // Simulate deployment process
      toast({
        title: 'Deployment Started',
        description: `Deploying to ${deployTarget}...`,
      });

      // Simulate API call
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: deployTarget }),
      });

      if (!response.ok) throw new Error('Deployment failed');
      
      const result = await response.json();

      // Update deployment status after "completion"
      setTimeout(() => {
        setDeployments(prev => prev.map(d => 
          d.id === newDeployment.id 
            ? { 
                ...d, 
                status: 'success', 
                url: result.url || `https://blvckwall-ai${deployTarget === 'staging' ? '-staging' : ''}.vercel.app`
              } 
            : d
        ));

        toast({
          title: 'Deployment Successful',
          description: `Successfully deployed to ${deployTarget}`,
        });
      }, 5000);
    } catch (error) {
      console.error('[DeployUI] Deployment error:', error);
      
      // Update deployment status to failed
      setDeployments(prev => prev.map(d => 
        d.id === `deploy_${Date.now()}` ? { ...d, status: 'failed' } : d
      ));

      toast({
        title: 'Deployment Failed',
        description: 'Failed to deploy. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'in_progress': return <Loader2 className="h-4 w-4 animate-spin text-blue-400" />;
      default: return <Server className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'in_progress': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deployment</h1>
          <p className="text-gray-400 mt-1">Deploy your BlvckWall AI application</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Rocket className="h-4 w-4" />
          Vercel
        </Badge>
      </div>

      {/* Deploy Card */}
      <Card className="border-gray-800 bg-[#121212]">
        <CardHeader>
          <CardTitle>Deploy Application</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-4">Deployment Target</h4>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Environment</label>
                  <Select value={deployTarget} onValueChange={setDeployTarget}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="staging">Staging</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={deployToTarget} 
                  disabled={isDeploying}
                  className="w-full"
                >
                  {isDeploying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Rocket className="mr-2 h-4 w-4" />
                      Deploy to {deployTarget}
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium mb-4">Deployment Info</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Framework:</span>
                  <span>Next.js 14</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Node Version:</span>
                  <span>18.x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Build Command:</span>
                  <span>next build</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Output Directory:</span>
                  <span>.next</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deployment History */}
      <Card className="border-gray-800 bg-[#121212]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Deployment History</CardTitle>
            <Button variant="outline" size="sm" onClick={() => {}}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deployments.map((deployment, index) => (
              <motion.div
                key={deployment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 border border-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(deployment.status)}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">{deployment.target}</span>
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        {getStatusIcon(deployment.status)}
                        {deployment.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      {new Date(deployment.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {deployment.url && deployment.status === 'success' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(deployment.url, '_blank')}
                    >
                      <Globe className="mr-2 h-4 w-4" />
                      Visit
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}

            {deployments.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <Rocket className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">No deployments yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}