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
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    auth.setCredentials({
      access_token: integration.access_token,
      refresh_token: integration.refresh_token,
    });

    const calendar = google.calendar({ version: 'v3', auth });

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

    return response.data;
  }

  async updateGoogleEvent(integration: CalendarIntegration, eventId: string, updates: Partial<CalendarEvent>) {
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    auth.setCredentials({
      access_token: integration.access_token,
      refresh_token: integration.refresh_token,
    });

    const calendar = google.calendar({ version: 'v3', auth });

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

    return response.data;
  }

  async deleteGoogleEvent(integration: CalendarIntegration, eventId: string) {
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    auth.setCredentials({
      access_token: integration.access_token,
      refresh_token: integration.refresh_token,
    });

    const calendar = google.calendar({ version: 'v3', auth });

    await calendar.events.delete({
      calendarId: integration.calendar_id,
      eventId,
    });
  }

  // Outlook Calendar Integration
  async createOutlookEvent(integration: CalendarIntegration, event: Omit<CalendarEvent, 'id'>) {
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
      throw new Error(`Outlook API error: ${response.status}`);
    }

    return response.json();
  }

  async updateOutlookEvent(integration: CalendarIntegration, eventId: string, updates: Partial<CalendarEvent>) {
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
      throw new Error(`Outlook API error: ${response.status}`);
    }

    return response.json();
  }

  async deleteOutlookEvent(integration: CalendarIntegration, eventId: string) {
    const response = await fetch(`https://graph.microsoft.com/v1.0/me/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${integration.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Outlook API error: ${response.status}`);
    }
  }

  // Universal methods
  async createEvent(integration: CalendarIntegration, event: Omit<CalendarEvent, 'id'>) {
    if (integration.provider === 'google') {
      return this.createGoogleEvent(integration, event);
    } else {
      return this.createOutlookEvent(integration, event);
    }
  }

  async updateEvent(integration: CalendarIntegration, eventId: string, updates: Partial<CalendarEvent>) {
    if (integration.provider === 'google') {
      return this.updateGoogleEvent(integration, eventId, updates);
    } else {
      return this.updateOutlookEvent(integration, eventId, updates);
    }
  }

  async deleteEvent(integration: CalendarIntegration, eventId: string) {
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
  // This would use an LLM to extract appointment details from the call transcript
  // For now, we'll return a mock implementation
  
  const appointmentDetails = {
    title: 'Patient Appointment',
    description: `Appointment scheduled via AI call. Transcript: ${callTranscript.substring(0, 200)}...`,
    start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    end: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(), // 30 min duration
    attendees: [], // Would extract from transcript
  };

  return calendarManager.createEvent(integration, appointmentDetails);
}