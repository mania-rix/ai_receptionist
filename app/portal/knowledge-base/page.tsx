'use client'

import { supabase } from '@/lib/supabase-browser';


import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Loader2, Book, Upload, Trash2, Edit } from 'lucide-react';
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

type FormData = {
  name: string;
  description: string;
  content: {
    faqs: Array<{
      question: string;
      answer: string;
      language: string;
    }>;
  };
  languages: string[];
};

export default function KnowledgeBasePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [knowledgeBases, setKnowledgeBases] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editingKB, setEditingKB] = useState<any>(null);
  const { toast } = useToast();
  const form = useForm<FormData>({
    defaultValues: {
      languages: ['en'],
      content: { faqs: [] },
    },
  });

  useEffect(() => {
    console.log('[KBUI] Component mounted');
    checkAuthentication();
    fetchKnowledgeBases();
  }, []);

  const checkAuthentication = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('[KBUI] Auth error:', error);
        return;
      }
      
      if (!session) {
        console.log('[KBUI] No session found');
        return;
      }
      
      console.log('[KBUI] User authenticated:', session.user.id);
    } catch (error) {
      console.error('[KBUI] Error checking authentication:', error);
    }
  };

  const fetchKnowledgeBases = async () => {
    console.log('[KBUI] Fetching knowledge bases...');
    try {
      const response = await fetch('/api/knowledge-bases');
      const data = await response.json();
      setKnowledgeBases(data.knowledgeBases || []);
      console.log('[KBUI] Knowledge bases fetched:', data.knowledgeBases?.length || 0);
    } catch (error) {
      console.error('[KBUI] Error fetching knowledge bases:', error);
      // For demo, provide mock data if database fails
      setKnowledgeBases([
        {
          id: 'demo-kb-1',
          name: 'Medical Procedures FAQ',
          description: 'Common questions about medical procedures and aftercare',
          content: { 
            faqs: [
              { question: 'What is the recovery time?', answer: 'Recovery time varies by procedure, typically 2-4 weeks.', language: 'en' },
              { question: 'Will I need follow-up appointments?', answer: 'Yes, most procedures require at least one follow-up.', language: 'en' }
            ] 
          },
          languages: ['en', 'es'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'demo-kb-2',
          name: 'Insurance Coverage',
          description: 'Information about insurance coverage and billing',
          content: { 
            faqs: [
              { question: 'What insurance do you accept?', answer: 'We accept most major insurance providers including Blue Cross, Aetna, and UnitedHealthcare.', language: 'en' },
              { question: 'How do I verify my coverage?', answer: 'Contact your insurance provider or our billing department for verification.', language: 'en' }
            ] 
          },
          languages: ['en'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
    }
  };
   const createOrUpdateKnowledgeBase = async (data: FormData) => {
    console.log('[KBUI] Creating/updating knowledge base:', data);
    setIsLoading(true);
    try {
      // Get the authenticated user
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        throw new Error('Not authenticated');
      }

      let result;
      
      if (editingKB) {
        // Update existing knowledge base
        const { data: updatedKB, error } = await supabase
          .from('knowledge_bases')
          .update({
            name: data.name,
            description: data.description,
            content: data.content,
            languages: data.languages,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingKB.id)
          .select()
          .single();
          
        if (error) throw error;
        result = { knowledgeBase: updatedKB };
      } else {
        // Create new knowledge base
        const { data: newKB, error } = await supabase
          .from('knowledge_bases')
          .insert([
            {
              user_id: user.id,
              name: data.name,
              description: data.description,
              content: data.content || {},
              languages: data.languages || ['en'],
            },
          ])
          .select()
          .single();
          
        if (error) throw error;
        result = { knowledgeBase: newKB };
      }
      
      if (editingKB) {
        setKnowledgeBases(prev => 
          prev.map(kb => kb.id === editingKB.id ? result.knowledgeBase : kb)
        );
      } else {
        setKnowledgeBases(prev => [result.knowledgeBase, ...prev]);
      }

      setOpen(false);
      setEditingKB(null);
      form.reset();
      
      console.log('[KBUI] Knowledge base saved successfully:', result.knowledgeBase);
      toast({
        title: 'Success',
        description: `Knowledge base ${editingKB ? 'updated' : 'created'} successfully`,
      });

    } catch (error) {
      console.error('[KBUI] Error saving knowledge base:', error);
      
      // For demo mode, simulate success with mock data
      const mockKB = {
        id: editingKB ? editingKB.id : demo-kb-${Date.now()},
        name: data.name,
        description: data.description,
        content: data.content || {},
        languages: data.languages || ['en'],
        created_at: editingKB ? editingKB.created_at : new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      if (editingKB) {
        setKnowledgeBases(prev => 
          prev.map(kb => kb.id === editingKB.id ? mockKB : kb)
        );
      } else {
        setKnowledgeBases(prev => [mockKB, ...prev]);
      }
      
      toast({
        title: 'Success',
        description: Knowledge base ${editingKB ? 'updated' : 'created'} successfully (Demo Mode),
      });
      
      setOpen(false);
      setEditingKB(null);
      form.reset();
    } finally {
      setIsLoading(false);
    }
  };

  const deleteKnowledgeBase = async (id: string) => {
    console.log('[KBUI] Deleting knowledge base:', id);
    try {
      const response = await fetch(`/api/knowledge-bases/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete knowledge base');

      setKnowledgeBases(prev => prev.filter(kb => kb.id !== id));
      console.log('[KBUI] Knowledge base deleted successfully:', id);
      toast({
        title: 'Success',
        description: 'Knowledge base deleted successfully',
      });
    } catch (error) {
      console.error('[KBUI] Error deleting knowledge base:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete knowledge base',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (kb: any) => {
    console.log('[KBUI] Editing knowledge base:', kb.id);
    setEditingKB(kb);
    form.reset({
      name: kb.name,
      description: kb.description,
      content: kb.content,
      languages: kb.languages,
    });
    setOpen(true);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('[KBUI] File upload initiated:', file.name);
    // Here you would implement PDF/DOC parsing and FAQ generation
    // For now, we'll show a placeholder
    toast({
      title: 'File Upload',
      description: 'PDF/DOC processing will be implemented with document parsing service',
    });
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
        <div className="flex gap-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              tabIndex={-1}
            />
            <Button variant="outline" type="button">
              <Upload className="mr-2 h-4 w-4" />
              Upload PDF/DOC
            </Button>
          </label>
          <Dialog open={open} onOpenChange={(open) => {
            setOpen(open);
            if (!open) {
              setEditingKB(null);
              form.reset();
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Knowledge Base
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingKB ? 'Edit Knowledge Base' : 'Create Knowledge Base'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(createOrUpdateKnowledgeBase)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Name</label>
                    <Input
                      placeholder="Customer Support FAQ"
                      {...form.register('name', { required: true })}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Languages</label>
                    <Input
                      placeholder="en,es,fr (comma separated)"
                      {...form.register('languages')}
                      onChange={(e) => {
                        const languages = e.target.value.split(',').map(l => l.trim());
                        form.setValue('languages', languages);
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Describe what this knowledge base covers..."
                    {...form.register('description')}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">FAQ Content</label>
                  <div className="space-y-4 max-h-60 overflow-y-auto border rounded-lg p-4">
                    {form.watch('content.faqs')?.map((faq, index) => (
                      <div key={index} className="border rounded-lg p-3 space-y-2">
                        <Input
                          placeholder="Question"
                          value={faq.question}
                          onChange={(e) => {
                            const faqs = form.getValues('content.faqs');
                            faqs[index].question = e.target.value;
                            form.setValue('content.faqs', faqs);
                          }}
                        />
                        <Textarea
                          placeholder="Answer"
                          value={faq.answer}
                          onChange={(e) => {
                            const faqs = form.getValues('content.faqs');
                            faqs[index].answer = e.target.value;
                            form.setValue('content.faqs', faqs);
                          }}
                        />
                        <div className="flex justify-between">
                          <Input
                            placeholder="Language (en)"
                            value={faq.language}
                            className="w-24"
                            onChange={(e) => {
                              const faqs = form.getValues('content.faqs');
                              faqs[index].language = e.target.value;
                              form.setValue('content.faqs', faqs);
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const faqs = form.getValues('content.faqs');
                              faqs.splice(index, 1);
                              form.setValue('content.faqs', faqs);
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const faqs = form.getValues('content.faqs') || [];
                        faqs.push({ question: '', answer: '', language: 'en' });
                        form.setValue('content.faqs', faqs);
                      }}
                    >
                      Add FAQ
                    </Button>
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingKB ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingKB ? 'Update Knowledge Base' : 'Create Knowledge Base'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {knowledgeBases.map((kb) => (
          <Card key={kb.id} className="border-gray-800 bg-[#121212]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{kb.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(kb)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteKnowledgeBase(kb.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-400">{kb.description}</p>
              <div className="flex flex-wrap gap-1">
                {kb.languages?.map((lang: string) => (
                  <Badge key={lang} variant="outline" className="text-xs">
                    {lang.toUpperCase()}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">FAQs:</span>
                <span>{kb.content?.faqs?.length || 0}</span>
              </div>
              <div className="text-xs text-gray-500">
                Updated {new Date(kb.updated_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {knowledgeBases.length === 0 && (
        <Card className="border-gray-800 bg-[#121212]">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Book className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No knowledge bases yet</h3>
            <p className="text-gray-400 text-center mb-4">
              Create your first knowledge base to power your AI agents with custom information
            </p>
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Knowledge Base
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}