// Calendar integration utilities for Google Calendar and Outlook
import { google } from 'googleapis';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  attendees?: string[];
  location?: string;
}

export interface CalendarIntegration {
  id: string;
  provider: 'google' | 'outlook';
  calendar_id: string;
  access_token: string;
  refresh_token?: string;
  expires_at?: string;
}

class CalendarManager {
  // Google Calendar Integration
  async createGoogleEvent(integration: CalendarIntegration, event: Omit<CalendarEvent, 'id'>) {
    console.log('[CalendarLib] Creating Google event:', event.title);
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    auth.setCredentials({
      access_token: integration.access_token,
      refresh_token: integration.refresh_token,
    });

    const calendar = google.calendar({ version: 'v3', auth });

    // TODO: Review error handling for Google Calendar API calls
    const response = await calendar.events.insert({
      calendarId: integration.calendar_id,
      requestBody: {
        summary: event.title,
        description: event.description,
        start: {
          dateTime: event.start,
          timeZone: 'America/New_York', // Should be configurable
        },
        end: {
          dateTime: event.end,
          timeZone: 'America/New_York',
        },
        attendees: event.attendees?.map(email => ({ email })),
        location: event.location,
      },
    });

    console.log('[CalendarLib] Google event created:', response.data.id);
    return response.data;
  }

  async updateGoogleEvent(integration: CalendarIntegration, eventId: string, updates: Partial<CalendarEvent>) {
    console.log('[CalendarLib] Updating Google event:', eventId);
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    auth.setCredentials({
      access_token: integration.access_token,
      refresh_token: integration.refresh_token,
    });

    const calendar = google.calendar({ version: 'v3', auth });

    // TODO: Review error handling for Google Calendar API calls
    const response = await calendar.events.update({
      calendarId: integration.calendar_id,
      eventId,
      requestBody: {
        summary: updates.title,
        description: updates.description,
        start: updates.start ? {
          dateTime: updates.start,
          timeZone: 'America/New_York',
        } : undefined,
        end: updates.end ? {
          dateTime: updates.end,
          timeZone: 'America/New_York',
        } : undefined,
        attendees: updates.attendees?.map(email => ({ email })),
        location: updates.location,
      },
    });

    console.log('[CalendarLib] Google event updated:', response.data.id);
    return response.data;
  }

  async deleteGoogleEvent(integration: CalendarIntegration, eventId: string) {
    console.log('[CalendarLib] Deleting Google event:', eventId);
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    auth.setCredentials({
      access_token: integration.access_token,
      refresh_token: integration.refresh_token,
    });

    const calendar = google.calendar({ version: 'v3', auth });

    // TODO: Review error handling for Google Calendar API calls
    await calendar.events.delete({
      calendarId: integration.calendar_id,
      eventId,
    });
    console.log('[CalendarLib] Google event deleted:', eventId);
  }

  // Outlook Calendar Integration
  async createOutlookEvent(integration: CalendarIntegration, event: Omit<CalendarEvent, 'id'>) {
    console.log('[CalendarLib] Creating Outlook event:', event.title);
    // TODO: Review error handling for Outlook API calls
    const response = await fetch(`https://graph.microsoft.com/v1.0/me/calendars/${integration.calendar_id}/events`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${integration.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject: event.title,
        body: {
          contentType: 'HTML',
          content: event.description || '',
        },
        start: {
          dateTime: event.start,
          timeZone: 'Eastern Standard Time',
        },
        end: {
          dateTime: event.end,
          timeZone: 'Eastern Standard Time',
        },
        attendees: event.attendees?.map(email => ({
          emailAddress: { address: email, name: email },
        })),
        location: {
          displayName: event.location || '',
        },
      }),
    });

    if (!response.ok) {
      console.error('[CalendarLib] Outlook API error:', response.status);
      throw new Error(`Outlook API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('[CalendarLib] Outlook event created:', result.id);
    return result;
  }

  async updateOutlookEvent(integration: CalendarIntegration, eventId: string, updates: Partial<CalendarEvent>) {
    console.log('[CalendarLib] Updating Outlook event:', eventId);
    // TODO: Review error handling for Outlook API calls
    const response = await fetch(`https://graph.microsoft.com/v1.0/me/events/${eventId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${integration.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject: updates.title,
        body: updates.description ? {
          contentType: 'HTML',
          content: updates.description,
        } : undefined,
        start: updates.start ? {
          dateTime: updates.start,
          timeZone: 'Eastern Standard Time',
        } : undefined,
        end: updates.end ? {
          dateTime: updates.end,
          timeZone: 'Eastern Standard Time',
        } : undefined,
        attendees: updates.attendees?.map(email => ({
          emailAddress: { address: email, name: email },
        })),
        location: updates.location ? {
          displayName: updates.location,
        } : undefined,
      }),
    });

    if (!response.ok) {
      console.error('[CalendarLib] Outlook API error:', response.status);
      throw new Error(`Outlook API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('[CalendarLib] Outlook event updated:', result.id);
    return result;
  }

  async deleteOutlookEvent(integration: CalendarIntegration, eventId: string) {
    console.log('[CalendarLib] Deleting Outlook event:', eventId);
    // TODO: Review error handling for Outlook API calls
    const response = await fetch(`https://graph.microsoft.com/v1.0/me/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${integration.access_token}`,
      },
    });

    if (!response.ok) {
      console.error('[CalendarLib] Outlook API error:', response.status);
      throw new Error(`Outlook API error: ${response.status}`);
    }
    console.log('[CalendarLib] Outlook event deleted:', eventId);
  }

  // Universal methods
  async createEvent(integration: CalendarIntegration, event: Omit<CalendarEvent, 'id'>) {
    console.log('[CalendarLib] Creating event via provider:', integration.provider);
    if (integration.provider === 'google') {
      return this.createGoogleEvent(integration, event);
    } else {
      return this.createOutlookEvent(integration, event);
    }
  }

  async updateEvent(integration: CalendarIntegration, eventId: string, updates: Partial<CalendarEvent>) {
    console.log('[CalendarLib] Updating event via provider:', integration.provider);
    if (integration.provider === 'google') {
      return this.updateGoogleEvent(integration, eventId, updates);
    } else {
      return this.updateOutlookEvent(integration, eventId, updates);
    }
  }

  async deleteEvent(integration: CalendarIntegration, eventId: string) {
    console.log('[CalendarLib] Deleting event via provider:', integration.provider);
    if (integration.provider === 'google') {
      return this.deleteGoogleEvent(integration, eventId);
    } else {
      return this.deleteOutlookEvent(integration, eventId);
    }
  }
}

export const calendarManager = new CalendarManager();

// Helper functions for AI scheduling
export async function scheduleAppointmentFromCall(
  callTranscript: string,
  integration: CalendarIntegration
) {
  console.log('[CalendarLib] Scheduling appointment from call transcript');
  // This would use an LLM to extract appointment details from the call transcript
  // For now, we'll return a mock implementation
  
  const appointmentDetails = {
    title: 'Patient Appointment',
    description: `Appointment scheduled via AI call. Transcript: ${callTranscript.substring(0, 200)}...`,
    start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    end: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(), // 30 min duration
    attendees: [], // Would extract from transcript
  };

  console.log('[CalendarLib] Appointment details extracted:', appointmentDetails);
  return calendarManager.createEvent(integration, appointmentDetails);
}