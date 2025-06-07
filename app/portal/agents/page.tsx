'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { Plus, Loader2 } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase-browser';

const voices = [
  { id: 'serena', name: 'Serena' },
  { id: 'morgan', name: 'Morgan' },
  { id: 'ava', name: 'Ava' },
  { id: 'ryan', name: 'Ryan' },
];

type FormData = {
  name: string;
  voice: string;
  greeting: string;
  temperature: number;
  interruption_sensitivity: number;
};

export default function AgentsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<FormData>({
    defaultValues: {
      temperature: 0.5,
      interruption_sensitivity: 0.5,
    },
  });

const createRetellAgent = async (data: FormData) => {
  setIsLoading(true);
  try {
    const response = await fetch('/api/create-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to create agent');
    }

    setAgents((prev) => [result.agent, ...prev]);
    setOpen(false);
    form.reset();
    toast({
      title: 'Success',
      description: 'Agent created successfully',
    });
  } catch (error: any) {
    console.error('Error creating agent:', error);
    toast({
      title: 'Error',
      description: error.message || 'Failed to create agent',
      variant: 'destructive',
    });
  } finally {
    setIsLoading(false);
  }
};




  useEffect(() => {
    const fetchAgents = async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching agents:', error);
        return;
      }

      setAgents(data || []);
    };

    fetchAgents();
  }, []);

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">AI Call Agents</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Agent
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Agent</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(createRetellAgent)} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Input
                    placeholder="Agent Name"
                    {...form.register('name', { required: true })}
                  />
                </div>
                <div>
                  <Select
                    onValueChange={(value) => form.setValue('voice', value)}
                    defaultValue={form.getValues('voice')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {voices.map((voice) => (
                        <SelectItem key={voice.id} value={voice.id}>
                          {voice.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Textarea
                    placeholder="Greeting Message"
                    {...form.register('greeting', { required: true })}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm">Temperature</label>
                  <Slider
                    min={0}
                    max={1}
                    step={0.1}
                    value={[form.getValues('temperature')]}
                    onValueChange={([value]) =>
                      form.setValue('temperature', value)
                    }
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm">
                    Interruption Sensitivity
                  </label>
                  <Slider
                    min={0}
                    max={1}
                    step={0.1}
                    value={[form.getValues('interruption_sensitivity')]}
                    onValueChange={([value]) =>
                      form.setValue('interruption_sensitivity', value)
                    }
                  />
                </div>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Agent'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <Card key={agent.id}>
            <CardHeader>
              <CardTitle>{agent.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Voice:</span> {agent.voice}
                </div>
                <div>
                  <span className="font-medium">Greeting:</span> {agent.greeting}
                </div>
                <div>
                  <span className="font-medium">Temperature:</span>{' '}
                  {agent.temperature}
                </div>
                <div>
                  <span className="font-medium">Interruption Sensitivity:</span>{' '}
                  {agent.interruption_sensitivity}
                </div>
                <div>
                  <span className="font-medium">Created:</span>{' '}
                  {format(new Date(agent.created_at), 'PPP')}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}