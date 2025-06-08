///home/project/app/portal/calls-out/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Phone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase-browser';

type FormData = {
  agentId: string;
  phoneNumber: string;
};

export default function OutboundCallsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const { toast } = useToast();
  const form = useForm<FormData>();

  useEffect(() => {
    const fetchAgents = async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching agents:', error);
        toast({
          title: 'Error',
          description: 'Failed to load agents',
          variant: 'destructive',
        });
        return;
      }

      setAgents(data || []);
    };

    fetchAgents();
  }, [toast]);

  const startCall = async (data: FormData) => {
    setIsLoading(true);
    try {
      const agent = agents.find((a) => a.id === data.agentId);
      if (!agent) throw new Error('Agent not found');

      // Start call using the agent_id from Supabase
const response = await fetch('/api/start-call', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    agent_id: agent.retell_agent_id, // make sure it's not agent.agent_id
    phone_number: data.phoneNumber,  // match API param naming
  }),
});

if (!response.ok) {
  const error = await response.text();
  console.error("🔥 Retell call failed:", error);
  throw new Error(error || "Failed to start call");
}


import { v4 as uuidv4 } from "uuid";
      // Save call to Supabase
      const { error } = await supabase.from('calls').insert({
        id: uuidv4(),
        agent_id: data.agentId,
        callee: data.phoneNumber,
        direction: 'outbound',
        status: 'started',
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Call initiated successfully',
      });
      form.reset();
    } catch (error) {
      console.error('Error starting call:', error);
      toast({
        title: 'Error',
        description: 'Failed to start call',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Outbound Calls</h1>
      </div>

      <div className="mx-auto max-w-md">
        <form onSubmit={form.handleSubmit(startCall)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Agent</label>
            <Select
              onValueChange={(value) => form.setValue('agentId', value)}
              defaultValue={form.getValues('agentId')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose an agent" />
              </SelectTrigger>
              <SelectContent>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <Input
              placeholder="+1234567890"
              {...form.register('phoneNumber', {
                required: true,
                pattern: /^\+[1-9]\d{1,14}$/,
              })}
            />
            <p className="text-xs text-gray-500">
              Enter phone number in E.164 format (e.g., +1234567890)
            </p>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting Call...
              </>
            ) : (
              <>
                <Phone className="mr-2 h-4 w-4" />
                Start AI Call
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}