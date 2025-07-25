'use client';

import { useStorage } from '@/contexts/storage-context';
import { User } from "lucide-react";
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { Plus, Loader2, Play, Edit, Trash2 } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

type FormData = {
  name: string;
  voice_engine: 'retell' | 'elevenlabs';
  voice: string;
  greeting: string;
  temperature: number;
  interruption_sensitivity: number;
  knowledge_base_id?: string;
  custom_instructions?: string;
};

export default function AgentsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { agents, knowledgeBases, addItem, updateItem, deleteItem, isAuthenticated } = useStorage();
  const [voices, setVoices] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<any>(null);
  const { toast } = useToast();
  const form = useForm<FormData>({
    defaultValues: {
      voice_engine: 'retell',
      temperature: 0.5,
      interruption_sensitivity: 0.5,
    },
  });

  useEffect(() => {
    console.log('[AgentUI] AgentsPage mounted');
    fetchElevenLabsVoices();
    return () => {
      console.log('[AgentUI] AgentsPage unmounted');
    };
  }, []);

  const watchVoiceEngine = form.watch('voice_engine');

  const fetchElevenLabsVoices = useCallback(async () => {
    console.log('[AgentUI] Fetching ElevenLabs voices...');
    try {
      const response = await fetch('/api/elevenlabs-voices', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[AgentUI] Voices fetched:', data.voices || []);
      
      // Combine with Retell voices
      const retellVoices = [
        { id: 'serena', name: 'Serena', provider: 'retell' },
        { id: 'morgan', name: 'Morgan', provider: 'retell' },
        { id: 'ava', name: 'Ava', provider: 'retell' },
        { id: 'ryan', name: 'Ryan', provider: 'retell' },
        { id: 'sophia', name: 'Sophia', provider: 'retell' },
        { id: 'james', name: 'James', provider: 'retell' },
      ];
      
      setVoices([...retellVoices, ...(data.voices || [])]);
    } catch (error) {
      console.error('[AgentUI] Error fetching voices:', error);
      
      // Fallback to default voices
      const defaultVoices = [
        { id: 'serena', name: 'Serena', provider: 'retell' },
        { id: 'morgan', name: 'Morgan', provider: 'retell' },
        { id: 'ava', name: 'Ava', provider: 'retell' },
        { id: 'ryan', name: 'Ryan', provider: 'retell' },
        { id: 'sophia', name: 'Sophia', provider: 'retell' },
        { id: 'james', name: 'James', provider: 'retell' },
        { id: 'voice_1', name: 'Rachel', provider: 'elevenlabs' },
        { id: 'voice_2', name: 'Thomas', provider: 'elevenlabs' },
        { id: 'voice_3', name: 'Emily', provider: 'elevenlabs' },
      ];
      
      setVoices(defaultVoices);
    }
  }, []);

  const filteredVoices = voices.filter(voice => voice.provider === watchVoiceEngine);

  const createOrUpdateAgent = async (data: FormData) => {
    setIsLoading(true);
    console.log(
      `[AgentUI] ${editingAgent ? 'Updating' : 'Creating'} agent with data:`,
      data
    ); 
    try {
      if (editingAgent) {
        await updateItem('agents', editingAgent.id, {
          ...data
        });
      } else {
        await addItem('agents', {
          ...data,
        });
      }

      setOpen(false);
      setEditingAgent(null);
      form.reset();
      toast({
        title: 'Success',
        description: `Agent ${editingAgent ? 'updated' : 'created'} successfully`,
      });
    } catch (error) {
      console.error('Error saving agent:', error);
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to save agent',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAgent = async (id: string) => {
    console.log('[AgentUI] Deleting agent:', id);
    try {
      await deleteItem('agents', id);
      
      console.log('[AgentUI] Agent deleted:', id);
      toast({
        title: 'Success',
        description: 'Agent deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete agent',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (agent: any) => {
    console.log('[AgentUI] Editing agent:', agent.id);
    setEditingAgent(agent);
    form.reset({
      name: agent.name,
      voice_engine: agent.voice_engine || 'retell',
      voice: agent.voice,
      greeting: agent.greeting,
      temperature: agent.temperature,
      interruption_sensitivity: agent.interruption_sensitivity,
      knowledge_base_id: agent.knowledge_base_id,
      custom_instructions: agent.custom_instructions,
    });
    setOpen(true);
  };

  const playVoicePreview = async (voiceId: string, provider: string) => {
    if (provider === 'elevenlabs') {
      // This would integrate with ElevenLabs TTS API for preview
      toast({
        title: 'Voice Preview',
        description: 'Voice preview would play here',
      });
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">AI Call Agents</h1>
        <Dialog open={open} onOpenChange={(open) => {
          setOpen(open);
          if (!open) {
            setEditingAgent(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAgent ? 'Edit Agent' : 'Create New Agent'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(createOrUpdateAgent)} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Agent Name</label>
                  <Input
                    placeholder="Agent Name"
                    {...form.register('name', { required: true })}
                  />
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-medium">Voice Engine</label>
                  <Select
                    onValueChange={(value) => form.setValue('voice_engine', value as any)}
                    defaultValue={form.getValues('voice_engine')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Voice Engine" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retell">Retell AI</SelectItem>
                      <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Voice</label>
                  <Select
                    onValueChange={(value) => form.setValue('voice', value)}
                    defaultValue={form.getValues('voice')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredVoices.map((voice) => (
                        <SelectItem key={voice.id} value={voice.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{voice.name}</span>
                            {voice.provider === 'elevenlabs' && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => playVoicePreview(voice.id, voice.provider)}
                              >
                                <Play className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Greeting Message</label>
                  <Textarea
                    placeholder="Greeting Message"
                    {...form.register('greeting', { required: true })}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Knowledge Base (Optional)</label>
                  <Select
                    onValueChange={(value) => form.setValue('knowledge_base_id', value)}
                    defaultValue={form.getValues('knowledge_base_id')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Knowledge Base" />
                    </SelectTrigger>
                    <SelectContent>
                      {knowledgeBases.map((kb) => (
                        <SelectItem key={kb.id} value={kb.id}>
                          {kb.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Custom Instructions (Optional)</label>
                  <Textarea
                    placeholder="Additional instructions for the agent..."
                    {...form.register('custom_instructions')}
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
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Conservative</span>
                    <span>Creative</span>
                  </div>
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
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingAgent ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingAgent ? 'Update Agent' : 'Create Agent'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <Card key={agent.id} className="border-gray-800 bg-[#121212]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{agent.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {agent.voice_engine === 'elevenlabs' ? 'ElevenLabs' : 'Retell'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(agent)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteAgent(agent.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Voice:</span> {agent.voice}
                </div>
                <div>
                  <span className="font-medium">Greeting:</span> {agent.greeting}
                </div>
                {agent.knowledge_base && (
                  <div>
                    <span className="font-medium">Knowledge Base:</span> {agent.knowledge_base.name}
                  </div>
                )}
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

      {agents.length === 0 && (
        <Card className="border-gray-800 bg-[#121212]">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No agents yet</h3>
            <p className="text-gray-400 text-center mb-4">
              Create your first AI agent to start making calls
            </p>
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Agent
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}