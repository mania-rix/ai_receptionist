'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Loader2, Calendar, Users, Trash2, Edit } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase-browser';

type FormData = {
  title: string;
  description: string;
  event_date: string;
  max_attendees: number;
  auto_promote: boolean;
};

export default function EventsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const { toast } = useToast();
  const form = useForm<FormData>();

  useEffect(() => {
    console.log('[EventsUI] Component mounted');
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    console.log('[EventsUI] Fetching events...');
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          rsvps:event_rsvps(count)
        `)
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
      console.log('[EventsUI] Events fetched:', data?.length || 0);
    } catch (error) {
      console.error('[EventsUI] Error fetching events:', error);
    }
  };

  const createOrUpdateEvent = async (data: FormData) => {
    console.log('[EventsUI] Creating/updating event:', data);
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (editingEvent) {
        const { error } = await supabase
          .from('events')
          .update(data)
          .eq('id', editingEvent.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('events')
          .insert([{ ...data, user_id: user.id }]);

        if (error) throw error;
      }

      await fetchEvents();
      setOpen(false);
      setEditingEvent(null);
      form.reset();
      
      console.log('[EventsUI] Event saved successfully');
      toast({
        title: 'Success',
        description: `Event ${editingEvent ? 'updated' : 'created'} successfully`,
      });
    } catch (error) {
      console.error('[EventsUI] Error saving event:', error);
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEvent = async (id: string) => {
    console.log('[EventsUI] Deleting event:', id);
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEvents(prev => prev.filter(event => event.id !== id));
      console.log('[EventsUI] Event deleted successfully:', id);
      toast({
        title: 'Success',
        description: 'Event deleted successfully',
      });
    } catch (error) {
      console.error('[EventsUI] Error deleting event:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete event',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (event: any) => {
    console.log('[EventsUI] Editing event:', event.id);
    setEditingEvent(event);
    form.reset({
      title: event.title,
      description: event.description,
      event_date: new Date(event.event_date).toISOString().slice(0, 16),
      max_attendees: event.max_attendees,
      auto_promote: event.auto_promote,
    });
    setOpen(true);
  };

  const getEventStatus = (eventDate: string) => {
    const now = new Date();
    const date = new Date(eventDate);
    
    if (date < now) return { status: 'past', color: 'bg-gray-500' };
    if (date.getTime() - now.getTime() < 24 * 60 * 60 * 1000) return { status: 'today', color: 'bg-blue-500' };
    return { status: 'upcoming', color: 'bg-green-500' };
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Community Events</h1>
        <Dialog open={open} onOpenChange={(open) => {
          setOpen(open);
          if (!open) {
            setEditingEvent(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(createOrUpdateEvent)} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium">Event Title</label>
                <Input
                  placeholder="Invisalign Information Day"
                  {...form.register('title', { required: true })}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Join us for an informative session about Invisalign treatment options..."
                  {...form.register('description')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Event Date & Time</label>
                  <Input
                    type="datetime-local"
                    {...form.register('event_date', { required: true })}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Max Attendees</label>
                  <Input
                    type="number"
                    placeholder="50"
                    {...form.register('max_attendees', { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Auto-promote to callers</label>
                  <p className="text-xs text-gray-400">
                    Automatically offer this event to patients after booking calls
                  </p>
                </div>
                <Switch
                  checked={form.watch('auto_promote')}
                  onCheckedChange={(checked) => form.setValue('auto_promote', checked)}
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingEvent ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingEvent ? 'Update Event' : 'Create Event'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => {
          const eventStatus = getEventStatus(event.event_date);
          const rsvpCount = event.rsvps?.[0]?.count || 0;
          
          return (
            <Card key={event.id} className="border-gray-800 bg-[#121212]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${eventStatus.color}`} />
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {event.auto_promote && (
                      <Badge variant="outline\" className=\"text-xs">
                        Auto-promote
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(event)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteEvent(event.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-400">{event.description}</p>
                
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{new Date(event.event_date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span>{rsvpCount}/{event.max_attendees || '∞'} RSVPs</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {eventStatus.status}
                  </Badge>
                </div>

                {rsvpCount > 0 && (
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min((rsvpCount / (event.max_attendees || rsvpCount)) * 100, 100)}%` 
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {events.length === 0 && (
        <Card className="border-gray-800 bg-[#121212]">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No events yet</h3>
            <p className="text-gray-400 text-center mb-4">
              Create your first community event to engage with patients
            </p>
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}