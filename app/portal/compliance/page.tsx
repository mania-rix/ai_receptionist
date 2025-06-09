'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Loader2, Shield, AlertTriangle, Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase-browser';

type FormData = {
  name: string;
  description: string;
  required_phrases: string[];
};

export default function CompliancePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [scripts, setScripts] = useState<any[]>([]);
  const [violations, setViolations] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<FormData>();

  useEffect(() => {
    fetchComplianceScripts();
    fetchViolations();
  }, []);

  const fetchComplianceScripts = async () => {
    try {
      const { data, error } = await supabase
        .from('compliance_scripts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScripts(data || []);
    } catch (error) {
      console.error('Error fetching compliance scripts:', error);
    }
  };

  const fetchViolations = async () => {
    try {
      // Fetch calls with compliance violations
      const { data, error } = await supabase
        .from('call_analytics')
        .select(`
          compliance_flags,
          call:calls(id, callee, started_at, agent:agents(name), recording_url)
        `)
        .not('compliance_flags', 'eq', '[]')
        .order('calls.started_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setViolations(data || []);
    } catch (error) {
      console.error('Error fetching violations:', error);
    }
  };

  const createComplianceScript = async (data: FormData) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('compliance_scripts')
        .insert([{
          user_id: user.id,
          name: data.name,
          description: data.description,
          required_phrases: data.required_phrases,
        }]);

      if (error) throw error;

      await fetchComplianceScripts();
      setOpen(false);
      form.reset();
      
      toast({
        title: 'Success',
        description: 'Compliance script created successfully',
      });
    } catch (error) {
      console.error('Error creating compliance script:', error);
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteScript = async (id: string) => {
    try {
      const { error } = await supabase
        .from('compliance_scripts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setScripts(prev => prev.filter(script => script.id !== id));
      toast({
        title: 'Success',
        description: 'Compliance script deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting script:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete script',
        variant: 'destructive',
      });
    }
  };

  const calculateComplianceRate = () => {
    // This would be calculated based on actual call analysis
    // For now, we'll use a mock calculation
    const totalCalls = 100; // This should come from actual data
    const violatingCalls = violations.length;
    return Math.round(((totalCalls - violatingCalls) / totalCalls) * 100);
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Compliance Dashboard</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Compliance Script
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Compliance Script</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(createComplianceScript)} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium">Script Name</label>
                <Input
                  placeholder="HIPAA Compliance"
                  {...form.register('name', { required: true })}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Healthcare privacy compliance requirements..."
                  {...form.register('description')}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Required Phrases</label>
                <Textarea
                  placeholder="Enter required phrases, one per line:
This call may be recorded for quality assurance
Your information is protected under HIPAA
Do you consent to this recording?"
                  {...form.register('required_phrases')}
                  onChange={(e) => {
                    const phrases = e.target.value.split('\n').filter(p => p.trim());
                    form.setValue('required_phrases', phrases);
                  }}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Enter each required phrase on a new line
                </p>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Script'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Compliance Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-gray-800 bg-[#121212]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Compliance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {calculateComplianceRate()}%
            </div>
            <p className="text-xs text-gray-400">Last 30 days</p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-[#121212]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Violations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">
              {violations.length}
            </div>
            <p className="text-xs text-gray-400">Flagged calls</p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-[#121212]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Active Scripts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {scripts.filter(s => s.is_active).length}
            </div>
            <p className="text-xs text-gray-400">Monitoring compliance</p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Scripts */}
      <Card className="border-gray-800 bg-[#121212]">
        <CardHeader>
          <CardTitle>Compliance Scripts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {scripts.map((script) => (
              <div key={script.id} className="border border-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{script.name}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant={script.is_active ? 'default' : 'secondary'}>
                      {script.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteScript(script.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-3">{script.description}</p>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Required phrases:</p>
                  {script.required_phrases?.slice(0, 2).map((phrase: string, index: number) => (
                    <div key={index} className="text-xs bg-gray-900 rounded px-2 py-1">
                      "{phrase}"
                    </div>
                  ))}
                  {script.required_phrases?.length > 2 && (
                    <div className="text-xs text-gray-400">
                      +{script.required_phrases.length - 2} more phrases
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Violations */}
      <Card className="border-gray-800 bg-[#121212]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Recent Violations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {violations.map((violation, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-red-800 rounded-lg bg-red-950/20">
                <div>
                  <div className="font-medium">{violation.call?.callee}</div>
                  <div className="text-sm text-gray-400">
                    {violation.call?.agent?.name} • {new Date(violation.call?.started_at).toLocaleDateString()}
                  </div>
                  <div className="flex gap-1 mt-2">
                    {violation.compliance_flags?.map((flag: string, flagIndex: number) => (
                      <Badge key={flagIndex} variant="destructive" className="text-xs">
                        {flag}
                      </Badge>
                    ))}
                  </div>
                </div>
                {violation.call?.recording_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={violation.call.recording_url} target="_blank" rel="noopener noreferrer">
                      <Play className="mr-2 h-4 w-4" />
                      Play Recording
                    </a>
                  </Button>
                )}
              </div>
            ))}
            {violations.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                No compliance violations detected
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}