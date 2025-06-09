/*
  # Voice AI Platform Enhancement

  1. New Tables
    - `phone_numbers` - Manage provisioned and SIP trunk numbers
    - `knowledge_bases` - Store agent knowledge and FAQ data
    - `call_recordings` - Store call recordings and transcripts
    - `call_analytics` - Store sentiment, upsell predictions, compliance data
    - `events` - Community events for auto-promotion
    - `event_rsvps` - Track event RSVPs
    - `hr_requests` - Time-off and HR requests
    - `compliance_scripts` - Regulatory compliance templates
    - `conversation_flows` - Visual conversation flow designs

  2. Enhanced Tables
    - Update `agents` table with new fields for voice engine, knowledge base
    - Update `calls` table with enhanced tracking fields

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for user data access
*/

-- Phone Numbers Management
CREATE TABLE IF NOT EXISTS phone_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  phone_number text NOT NULL,
  provider text NOT NULL CHECK (provider IN ('retell', 'elevenlabs')),
  type text NOT NULL CHECK (type IN ('provisioned', 'sip')),
  label text NOT NULL,
  sip_config jsonb DEFAULT '{}',
  assigned_agent_id uuid REFERENCES agents(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_phone_number CHECK (phone_number ~ '^\+[1-9]\d{1,14}$')
);

-- Knowledge Bases
CREATE TABLE IF NOT EXISTS knowledge_bases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  description text,
  content jsonb DEFAULT '{}',
  languages text[] DEFAULT ARRAY['en'],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Call Recordings and Transcripts
CREATE TABLE IF NOT EXISTS call_recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id uuid REFERENCES calls(id) NOT NULL,
  recording_url text,
  transcript text,
  duration_seconds integer,
  file_size_bytes bigint,
  created_at timestamptz DEFAULT now()
);

-- Call Analytics
CREATE TABLE IF NOT EXISTS call_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id uuid REFERENCES calls(id) NOT NULL,
  sentiment_score real CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  sentiment_timeline jsonb DEFAULT '[]',
  upsell_likelihood real CHECK (upsell_likelihood >= 0 AND upsell_likelihood <= 1),
  quality_score real CHECK (quality_score >= 0 AND quality_score <= 10),
  compliance_flags jsonb DEFAULT '[]',
  anomaly_flags jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- Events Management
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  description text,
  event_date timestamptz NOT NULL,
  max_attendees integer,
  auto_promote boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Event RSVPs
CREATE TABLE IF NOT EXISTS event_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) NOT NULL,
  caller_phone text NOT NULL,
  caller_name text,
  rsvp_method text CHECK (rsvp_method IN ('voice', 'sms')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, caller_phone)
);

-- HR Requests
CREATE TABLE IF NOT EXISTS hr_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  employee_phone text NOT NULL,
  employee_name text,
  request_type text NOT NULL,
  reason text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  call_recording_url text,
  created_at timestamptz DEFAULT now()
);

-- Compliance Scripts
CREATE TABLE IF NOT EXISTS compliance_scripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  required_phrases text[] NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Conversation Flows
CREATE TABLE IF NOT EXISTS conversation_flows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  flow_data jsonb NOT NULL DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add new columns to existing agents table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agents' AND column_name = 'voice_engine'
  ) THEN
    ALTER TABLE agents ADD COLUMN voice_engine text DEFAULT 'retell' CHECK (voice_engine IN ('retell', 'elevenlabs'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agents' AND column_name = 'knowledge_base_id'
  ) THEN
    ALTER TABLE agents ADD COLUMN knowledge_base_id uuid REFERENCES knowledge_bases(id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agents' AND column_name = 'conversation_flow_id'
  ) THEN
    ALTER TABLE agents ADD COLUMN conversation_flow_id uuid REFERENCES conversation_flows(id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agents' AND column_name = 'tone_settings'
  ) THEN
    ALTER TABLE agents ADD COLUMN tone_settings jsonb DEFAULT '{}';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agents' AND column_name = 'custom_instructions'
  ) THEN
    ALTER TABLE agents ADD COLUMN custom_instructions text;
  END IF;
END $$;

-- Add new columns to existing calls table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calls' AND column_name = 'from_number'
  ) THEN
    ALTER TABLE calls ADD COLUMN from_number text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calls' AND column_name = 'provider'
  ) THEN
    ALTER TABLE calls ADD COLUMN provider text DEFAULT 'retell' CHECK (provider IN ('retell', 'elevenlabs'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calls' AND column_name = 'duration_seconds'
  ) THEN
    ALTER TABLE calls ADD COLUMN duration_seconds integer;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calls' AND column_name = 'cost'
  ) THEN
    ALTER TABLE calls ADD COLUMN cost decimal(10,4);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calls' AND column_name = 'transcript'
  ) THEN
    ALTER TABLE calls ADD COLUMN transcript text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calls' AND column_name = 'recording_url'
  ) THEN
    ALTER TABLE calls ADD COLUMN recording_url text;
  END IF;
END $$;

-- Enable RLS on all new tables
ALTER TABLE phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_flows ENABLE ROW LEVEL SECURITY;

-- Phone Numbers Policies
CREATE POLICY "Users can manage their phone numbers"
  ON phone_numbers FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Knowledge Bases Policies
CREATE POLICY "Users can manage their knowledge bases"
  ON knowledge_bases FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Call Recordings Policies
CREATE POLICY "Users can view call recordings for their calls"
  ON call_recordings FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM calls 
    WHERE calls.id = call_recordings.call_id 
    AND calls.user_id = auth.uid()
  ));

CREATE POLICY "System can insert call recordings"
  ON call_recordings FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM calls 
    WHERE calls.id = call_recordings.call_id 
    AND calls.user_id = auth.uid()
  ));

-- Call Analytics Policies
CREATE POLICY "Users can view analytics for their calls"
  ON call_analytics FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM calls 
    WHERE calls.id = call_analytics.call_id 
    AND calls.user_id = auth.uid()
  ));

-- Events Policies
CREATE POLICY "Users can manage their events"
  ON events FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Event RSVPs Policies
CREATE POLICY "Users can view RSVPs for their events"
  ON event_rsvps FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM events 
    WHERE events.id = event_rsvps.event_id 
    AND events.user_id = auth.uid()
  ));

CREATE POLICY "System can insert RSVPs"
  ON event_rsvps FOR INSERT TO authenticated
  WITH CHECK (true);

-- HR Requests Policies
CREATE POLICY "Users can manage their HR requests"
  ON hr_requests FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Compliance Scripts Policies
CREATE POLICY "Users can manage their compliance scripts"
  ON compliance_scripts FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Conversation Flows Policies
CREATE POLICY "Users can manage their conversation flows"
  ON conversation_flows FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_phone_numbers_user_id ON phone_numbers(user_id);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_assigned_agent ON phone_numbers(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_bases_user_id ON knowledge_bases(user_id);
CREATE INDEX IF NOT EXISTS idx_call_recordings_call_id ON call_recordings(call_id);
CREATE INDEX IF NOT EXISTS idx_call_analytics_call_id ON call_analytics(call_id);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event_id ON event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_hr_requests_user_id ON hr_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_compliance_scripts_user_id ON compliance_scripts(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_flows_user_id ON conversation_flows(user_id);