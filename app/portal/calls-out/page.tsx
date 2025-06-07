'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Phone, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase-browser';

type FormData = {
  agentId: string;
  phoneNumber: string;
  fromNumber: string;
};

export default function OutboundCallsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [numbers, setNumbers] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<FormData>();
  const numberForm = useForm<{ label: string; phoneNumber: string }>();

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

  useEffect(() => {
    const fetchNumbers = async () => {
      const { data, error } = await supabase
        .from('retell_numbers')
        .select('*')
        .order('label');

      if (error) {
        console.error('Error fetching numbers:', error);
        toast({
          title: 'Error',
          description: 'Failed to load phone numbers',
          variant: 'destructive',
        });
        return;
      }

      setNumbers(data || []);

      // Auto-select if only one number exists
      if (data?.length === 1) {
        form.setValue('fromNumber', data[0].id);
      }
    };

    fetchNumbers();
  }, [toast, form]);

  const addPhoneNumber = async (data: { label: string; phoneNumber: string }) => {
    try {
      const { error } = await supabase.from('retell_numbers').insert({
        label: data.label,
        phone_number: data.phoneNumber,
      });

      if (error) throw error;

      // Refresh numbers list
      const { data: newNumbers } = await supabase
        .from('retell_numbers')
        .select('*')
        .order('label');

      setNumbers(newNumbers || []);
      setDialogOpen(false);
      numberForm.reset();
      
      toast({
        title: 'Success',
        description: 'Phone number added successfully',
      });
    } catch (error) {
      console.error('Error adding phone number:', error);
      toast({
        title: 'Error',
        description: 'Failed to add phone number',
        variant: 'destructive',
      });
    }
  };

  const startCall = async (data: FormData) => {
    setIsLoading(true);
    try {
      const agent = agents.find((a) => a.id === data.agentId);
      if (!agent) throw new Error('Agent not found');

      const fromNumber = numbers.find((n) => n.id === data.fromNumber);
      if (!fromNumber) throw new Error('From number not selected');

      // Start call using the agent_id from Supabase
      const response = await fetch('/api/start-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: agent.retell_agent_id,
          to_number: data.phoneNumber,
          from_number: fromNumber.phone_number,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("🔥 Retell call failed:", error);
        throw new Error(error || "Failed to start call");
      }

      // Save call to Supabase
      const { error } = await supabase.from('calls').insert({
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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Phone Number
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Phone Number</DialogTitle>
            </DialogHeader>
            <form onSubmit={numberForm.handleSubmit(addPhoneNumber)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Label</label>
                <Input
                  placeholder="e.g., Main Office Line"
                  {...numberForm.register('label', { required: true })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <Input
                  placeholder="+1234567890"
                  {...numberForm.register('phoneNumber', {
                    required: true,
                    pattern: /^\+[1-9]\d{1,14}$/,
                  })}
                />
                <p className="text-xs text-gray-500">
                  Enter phone number in E.164 format (e.g., +1234567890)
                </p>
              </div>
              <Button type="submit" className="w-full">Add Number</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mx-auto max-w-md">
        <form onSubmit={form.handleSubmit(startCall)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">From Number</label>
            <Select
              onValueChange={(value) => form.setValue('fromNumber', value)}
              defaultValue={form.getValues('fromNumber')}
              {...form.register('fromNumber', { required: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a phone number" />
              </SelectTrigger>
              <SelectContent>
                {numbers.map((number) => (
                  <SelectItem key={number.id} value={number.id}>
                    {number.label} ({number.phone_number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Agent</label>
            <Select
              onValueChange={(value) => form.setValue('agentId', value)}
              defaultValue={form.getValues('agentId')}
              {...form.register('agentId', { required: true })}
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