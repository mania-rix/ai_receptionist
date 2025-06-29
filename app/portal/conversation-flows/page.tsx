'use client';

import { useStorage } from '@/contexts/storage-context';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Loader2, GitBranch, Play, Edit, Trash2, Save } from 'lucide-react';
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

// Ensure we're using the storage context
import { useStorage } from '@/contexts/storage-context';

type FormData = {
  name: string;
  description: string;
};

interface FlowNode {
  id: string;
  type: 'start' | 'message' | 'condition' | 'action' | 'end';
  content: string;
  position: { x: number; y: number };
  connections: string[];
}

export default function ConversationFlowsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { conversationFlows, addItem, updateItem, deleteItem, isAuthenticated } = useStorage();
  const [open, setOpen] = useState(false);
  const [editingFlow, setEditingFlow] = useState<any>(null);
  const [designerOpen, setDesignerOpen] = useState(false);
  const [currentFlow, setCurrentFlow] = useState<any>(null);
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const { toast } = useToast();
  const form = useForm<FormData>();

  useEffect(() => {
    console.log('[FlowDesigner] Component mounted');
  }, [isAuthenticated]);

  const createOrUpdateFlow = async (data: FormData) => {
    console.log('[FlowDesigner] Creating/updating flow:', data);
    setIsLoading(true);
    try {
      if (editingFlow) {
        await updateItem('conversationFlows', editingFlow.id, {
          name: data.name,
          description: data.description,
          flow_data: editingFlow.flow_data,
          is_active: editingFlow.is_active,
        });
      } else {
        await addItem('conversationFlows', {
          name: data.name,
          description: data.description,
          flow_data: { nodes: [], connections: [] },
          is_active: true,
          version: 1,
        });
      }
      
      setOpen(false);
      setEditingFlow(null);
      form.reset();
      
      console.log('[FlowDesigner] Flow saved successfully');
      toast({
        title: 'Success',
        description: `Flow ${editingFlow ? 'updated' : 'created'} successfully`,
      });
    } catch (error) {
      console.error('[FlowDesigner] Error saving flow:', error);
      toast({
        title: 'Error',
        description: 'Failed to save flow',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFlow = async (id: string) => {
    console.log('[FlowDesigner] Deleting flow:', id);
    try {
      await deleteItem('conversationFlows', id);
      
      console.log('[FlowDesigner] Flow deleted successfully:', id);
      toast({
        title: 'Success',
        description: 'Flow deleted successfully',
      });
    } catch (error) {
      console.error('[FlowDesigner] Error deleting flow:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete flow',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (flow: any) => {
    console.log('[FlowDesigner] Editing flow:', flow.id);
    setEditingFlow(flow);
    form.reset({
      name: flow.name,
      description: flow.description,
    });
    setOpen(true);
  };

  const openDesigner = (flow: any) => {
    console.log('[FlowDesigner] Opening designer for flow:', flow.id);
    setCurrentFlow(flow);
    setNodes(flow.flow_data?.nodes || [
      {
        id: 'start',
        type: 'start',
        content: 'Conversation Start',
        position: { x: 100, y: 100 },
        connections: [],
      }
    ]);
    setDesignerOpen(true);
  };

  const addNode = (type: FlowNode['type']) => {
    console.log('[FlowDesigner] Adding node of type:', type);
    const newNode: FlowNode = {
      id: `node_${Date.now()}`,
      type,
      content: getDefaultContent(type),
      position: { x: 200 + nodes.length * 50, y: 200 + nodes.length * 50 },
      connections: [],
    };
    setNodes(prev => [...prev, newNode]);
  };

  const getDefaultContent = (type: FlowNode['type']): string => {
    switch (type) {
      case 'message': return 'Hello! How can I help you today?';
      case 'condition': return 'If user says "yes"';
      case 'action': return 'Transfer to human agent';
      case 'end': return 'Conversation End';
      default: return '';
    }
  };

  const saveFlowDesign = async () => {
    if (!currentFlow) return;

    console.log('[FlowDesigner] Saving flow design for:', currentFlow.id);
    try {
      await updateItem('conversationFlows', currentFlow.id, {
        flow_data: { nodes, connections: [] },
      });

      console.log('[FlowDesigner] Flow design saved successfully');
      toast({
        title: 'Success',
        description: 'Flow design saved successfully',
      });
      
      setDesignerOpen(false);
    } catch (error) {
      console.error('[FlowDesigner] Error saving flow design:', error);
      toast({
        title: 'Error',
        description: 'Failed to save flow design',
        variant: 'destructive',
      });
    }
  };

  const simulateFlow = () => {
    console.log('[FlowDesigner] Simulating flow');
    toast({
      title: 'Flow Simulation',
      description: 'Flow simulation would run here with test scenarios',
    });
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Conversation Flow Designer</h1>
        <Dialog open={open} onOpenChange={(open) => {
          setOpen(open);
          if (!open) {
            setEditingFlow(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Flow
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingFlow ? 'Edit Flow' : 'Create New Flow'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(createOrUpdateFlow)} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium">Flow Name</label>
                <Input
                  placeholder="Customer Support Flow"
                  {...form.register('name', { required: true })}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Describe the purpose and logic of this conversation flow..."
                  {...form.register('description')}
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingFlow ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingFlow ? 'Update Flow' : 'Create Flow'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {conversationFlows.map((flow) => (
          <Card key={flow.id} className="border-gray-800 bg-[#121212]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{flow.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={flow.is_active ? 'default' : 'secondary'}>
                    {flow.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(flow)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteFlow(flow.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-400">{flow.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Nodes:</span>
                <span>{flow.flow_data?.nodes?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Version:</span>
                <span>{flow.version}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDesigner(flow)}
                  className="flex-1"
                >
                  <GitBranch className="mr-2 h-4 w-4" />
                  Design
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={simulateFlow}
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {conversationFlows.length === 0 && (
        <Card className="border-gray-800 bg-[#121212]">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GitBranch className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No conversation flows yet</h3>
            <p className="text-gray-400 text-center mb-4">
              Create your first conversation flow to design agent dialog logic
            </p>
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Flow
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Flow Designer Modal */}
      <Dialog open={designerOpen} onOpenChange={setDesignerOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Flow Designer - {currentFlow?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex h-[70vh]">
            {/* Toolbar */}
            <div className="w-48 border-r border-gray-800 p-4 space-y-2">
              <h4 className="font-medium mb-3">Add Nodes</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addNode('message')}
                className="w-full justify-start"
              >
                💬 Message
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addNode('condition')}
                className="w-full justify-start"
              >
                ❓ Condition
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addNode('action')}
                className="w-full justify-start"
              >
                ⚡ Action
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addNode('end')}
                className="w-full justify-start"
              >
                🏁 End
              </Button>
              
              <div className="pt-4 border-t border-gray-800">
                <Button onClick={simulateFlow} variant="outline" size="sm" className="w-full">
                  <Play className="mr-2 h-4 w-4" />
                  Test Flow
                </Button>
                <Button onClick={saveFlowDesign} size="sm" className="w-full mt-2">
                  <Save className="mr-2 h-4 w-4" />
                  Save Design
                </Button>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 bg-gray-950 relative overflow-auto">
              <div className="absolute inset-0 p-4">
                {nodes.map((node) => (
                  <div
                    key={node.id}
                    className="absolute bg-gray-800 border border-gray-700 rounded-lg p-3 min-w-32 cursor-move"
                    style={{
                      left: node.position.x,
                      top: node.position.y,
                    }}
                  >
                    <div className="text-xs text-gray-400 mb-1">{node.type}</div>
                    <div className="text-sm">{node.content}</div>
                  </div>
                ))}
                
                {nodes.length === 0 && (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <GitBranch className="h-12 w-12 mx-auto mb-4" />
                      <p>Drag nodes from the toolbar to start designing</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}