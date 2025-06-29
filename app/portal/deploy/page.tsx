'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Rocket, Globe, Settings, ExternalLink } from 'lucide-react';

export default function DeployPage() {
  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeploy = async () => {
    setIsDeploying(true);
    // Simulate deployment process
    setTimeout(() => {
      setIsDeploying(false);
    }, 3000);
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Deploy Application</h1>
        <Badge variant="outline">Demo Mode</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-gray-800 bg-[#121212]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              Quick Deploy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-400">
              Deploy your AI voice application to production with one click.
            </p>
            <Button 
              onClick={handleDeploy}
              disabled={isDeploying}
              className="w-full"
            >
              {isDeploying ? 'Deploying...' : 'Deploy Now'}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-[#121212]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Domain Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-400">
              Configure your custom domain and SSL settings.
            </p>
            <Button variant="outline" className="w-full">
              <Settings className="mr-2 h-4 w-4" />
              Configure Domain
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}