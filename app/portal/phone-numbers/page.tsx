'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Loader2, Phone, Settings, Trash2 } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase-browser';

type FormData = {
  phone_number: string;
  provider: 'retell' | 'elevenlabs';
  type: 'provisioned' | 'sip';
  label: string;
  area_code?: string;
  country_code?: string;
  assigned_agent_id?: string;
  sip_config?: {
    username?: string;
    password?: string;
    domain?: string;
    port?: number;
  };
};

export default function PhoneNumbersPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumbers, setPhoneNumbers] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<FormData>();

  const watchType = form.watch('type');
  const watchProvider = form.watch('provider');

  useEffect(() => {
    console.log('[PhoneNumbersUI] Component mounted');
    fetchPhoneNumbers();
    fetchAgents();
  }, []);

  const fetchPhoneNumbers = async () => {
    console.log('[PhoneNumbersUI] Fetching phone numbers...');
    try {
      const response = await fetch('/api/phone-numbers');
      const data = await response.json();
      setPhoneNumbers(data.phoneNumbers || []);
      console.log('[PhoneNumbersUI] Phone numbers fetched:', data.phoneNumbers?.length || 0);
    } catch (error) {
      console.error('[PhoneNumbersUI] Error fetching phone numbers:', error);
    }
  };

  const fetchAgents = async () => {
    console.log('[PhoneNumbersUI] Fetching agents...');
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setAgents(data || []);
      console.log('[PhoneNumbersUI] Agents fetched:', data?.length || 0);
    } catch (error) {
      console.error('[PhoneNumbersUI] Error fetching agents:', error);
    }
  };

  const createPhoneNumber = async (data: FormData) => {
    console.log('[PhoneNumbersUI] Creating phone number:', data);
    setIsLoading(true);
    try {
      const response = await fetch('/api/phone-numbers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create phone number');
      }

      const result = await response.json();
      setPhoneNumbers(prev => [result.phoneNumber, ...prev]);
      setOpen(false);
      form.reset();
      
      console.log('[PhoneNumbersUI] Phone number created successfully:', result.phoneNumber);
      toast({
        title: 'Success',
        description: 'Phone number added successfully',
      });
    } catch (error) {
      console.error('[PhoneNumbersUI] Error creating phone number:', error);
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deletePhoneNumber = async (id: string) => {
    console.log('[PhoneNumbersUI] Deleting phone number:', id);
    try {
      const response = await fetch(`/api/phone-numbers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete phone number');

      setPhoneNumbers(prev => prev.filter(num => num.id !== id));
      console.log('[PhoneNumbersUI] Phone number deleted successfully:', id);
      toast({
        title: 'Success',
        description: 'Phone number deleted successfully',
      });
    } catch (error) {
      console.error('[PhoneNumbersUI] Error deleting phone number:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete phone number',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Phone Numbers</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Number
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Phone Number</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(createPhoneNumber)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Provider</label>
                  <Select
                    onValueChange={(value) => form.setValue('provider', value as any)}
                    defaultValue={form.getValues('provider')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retell">Retell AI</SelectItem>
                      <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Type</label>
                  <Select
                    onValueChange={(value) => form.setValue('type', value as any)}
                    defaultValue={form.getValues('type')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="provisioned">Provisioned</SelectItem>
                      <SelectItem value="sip">SIP Trunk / BYON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Label</label>
                <Input
                  placeholder="Main Office Line"
                  {...form.register('label', { required: true })}
                />
              </div>

              {watchType === 'provisioned' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Area Code</label>
                    <Input
                      placeholder="415"
                      {...form.register('area_code')}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Country</label>
                    <Select
                      onValueChange={(value) => form.setValue('country_code', value)}
                      defaultValue="US"
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="GB">United Kingdom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {watchType === 'sip' && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Phone Number</label>
                    <Input
                      placeholder="+1234567890"
                      {...form.register('phone_number', { required: watchType === 'sip' })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium">SIP Username</label>
                      <Input
                        placeholder="username"
                        {...form.register('sip_config.username')}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">SIP Password</label>
                      <Input
                        type="password"
                        placeholder="password"
                        {...form.register('sip_config.password')}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium">SIP Domain</label>
                      <Input
                        placeholder="sip.provider.com"
                        {...form.register('sip_config.domain')}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Port</label>
                      <Input
                        type="number"
                        placeholder="5060"
                        {...form.register('sip_config.port', { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium">Assign to Agent (Optional)</label>
                <Select
                  onValueChange={(value) => form.setValue('assigned_agent_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Agent" />
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

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Phone Number'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {phoneNumbers.map((number) => (
          <Card key={number.id} className="border-gray-800 bg-[#121212]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{number.label}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={number.is_active ? 'default' : 'secondary'}>
                    {number.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deletePhoneNumber(number.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="font-mono">{number.phone_number}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Provider:</span>
                <Badge variant="outline">
                  {number.provider === 'retell' ? 'Retell AI' : 'ElevenLabs'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Type:</span>
                <Badge variant="outline">
                  {number.type === 'provisioned' ? 'Provisioned' : 'SIP Trunk'}
                </Badge>
              </div>
              {number.assigned_agent && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Agent:</span>
                  <span>{number.assigned_agent.name}</span>
                </div>
              )}
              {number.type === 'sip' && number.sip_config?.domain && (
                <div className="flex items-center gap-2 text-sm">
                  <Settings className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-400">{number.sip_config.domain}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {phoneNumbers.length === 0 && (
        <Card className="border-gray-800 bg-[#121212]">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Phone className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No phone numbers yet</h3>
            <p className="text-gray-400 text-center mb-4">
              Add your first phone number to start receiving and making calls
            </p>
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Phone Number
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}