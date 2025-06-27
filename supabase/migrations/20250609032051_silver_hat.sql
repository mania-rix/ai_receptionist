
-- User Roles and RBAC
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'manager', 'staff', 'hr', 'compliance', 'viewer')),
  permissions jsonb DEFAULT '{}',
  assigned_by uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Conversation Flow Designer
CREATE TABLE IF NOT EXISTS conversation_flows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  description text,
  flow_data jsonb NOT NULL DEFAULT '{}',
  is_active boolean DEFAULT true,
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activity Feed
CREATE TABLE IF NOT EXISTS activity_feed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  activity_type text NOT NULL,
  title text NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Anomaly Alerts
CREATE TABLE IF NOT EXISTS anomaly_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  alert_type text NOT NULL,
  severity text DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title text NOT NULL,
  description text,
  data jsonb DEFAULT '{}',
  is_resolved boolean DEFAULT false,
  notification_channels text[] DEFAULT ARRAY['dashboard'],
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- Calendar Integrations
CREATE TABLE IF NOT EXISTS calendar_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  provider text NOT NULL CHECK (provider IN ('google', 'outlook')),
  calendar_id text NOT NULL,
  access_token text NOT NULL,
  refresh_token text,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  sync_settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Voice Cloning
CREATE TABLE IF NOT EXISTS voice_clones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  voice_id text NOT NULL,
  provider text DEFAULT 'elevenlabs',
  sample_url text,
  status text DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'failed')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Brand Settings
CREATE TABLE IF NOT EXISTS brand_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  logo_url text,
  primary_color text DEFAULT '#6366f1',
  secondary_color text DEFAULT '#8b5cf6',
  company_name text,
  email_templates jsonb DEFAULT '{}',
  custom_css text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Data Exports
CREATE TABLE IF NOT EXISTS data_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  export_type text NOT NULL,
  status text DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  file_url text,
  file_size_bytes bigint,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Feedback Submissions
CREATE TABLE IF NOT EXISTS feedback_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users,
  type text NOT NULL CHECK (type IN ('bug', 'feature', 'general')),
  title text NOT NULL,
  description text NOT NULL,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Live Relay Sessions
CREATE TABLE IF NOT EXISTS live_relay_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  call_id text,
  operator_id uuid REFERENCES auth.users NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
  transcript jsonb DEFAULT '[]',
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz
);

-- Enable RLS on all new tables
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomaly_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_clones ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_relay_sessions ENABLE ROW LEVEL SECURITY;
-- User Roles Policies
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
CREATE POLICY "Users can view their own roles"
  ON user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;
CREATE POLICY "Admins can manage all roles"
  ON user_roles FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  ));

-- Conversation Flows Policies
DROP POLICY IF EXISTS "Users can manage their conversation flows" ON conversation_flows;
CREATE POLICY "Users can manage their conversation flows"
  ON conversation_flows FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Activity Feed Policies
DROP POLICY IF EXISTS "Users can view their activity feed" ON activity_feed;
CREATE POLICY "Users can view their activity feed"
  ON activity_feed FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert activity" ON activity_feed;
CREATE POLICY "System can insert activity"
  ON activity_feed FOR INSERT TO authenticated
  WITH CHECK (true);

-- Anomaly Alerts Policies
DROP POLICY IF EXISTS "Users can view their alerts" ON anomaly_alerts;
CREATE POLICY "Users can view their alerts"
  ON anomaly_alerts FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Calendar Integrations Policies
DROP POLICY IF EXISTS "Users can manage their calendar integrations" ON calendar_integrations;
CREATE POLICY "Users can manage their calendar integrations"
  ON calendar_integrations FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Voice Clones Policies
DROP POLICY IF EXISTS "Users can manage their voice clones" ON voice_clones;
CREATE POLICY "Users can manage their voice clones"
  ON voice_clones FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Brand Settings Policies
DROP POLICY IF EXISTS "Users can manage their brand settings" ON brand_settings;
CREATE POLICY "Users can manage their brand settings"
  ON brand_settings FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Data Exports Policies
DROP POLICY IF EXISTS "Users can view their exports" ON data_exports;
CREATE POLICY "Users can view their exports"
  ON data_exports FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Feedback Policies
DROP POLICY IF EXISTS "Anyone can submit feedback" ON feedback_submissions;
CREATE POLICY "Anyone can submit feedback"
  ON feedback_submissions FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their feedback" ON feedback_submissions;
CREATE POLICY "Users can view their feedback"
  ON feedback_submissions FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Live Relay Policies
DROP POLICY IF EXISTS "Users can manage their relay sessions" ON live_relay_sessions;
CREATE POLICY "Users can manage their relay sessions"
  ON live_relay_sessions FOR ALL TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = operator_id)
  WITH CHECK (auth.uid() = user_id OR auth.uid() = operator_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_flows_user_id ON conversation_flows(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_user_id ON activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created_at ON activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_anomaly_alerts_user_id ON anomaly_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_integrations_user_id ON calendar_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_clones_user_id ON voice_clones(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_settings_user_id ON brand_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_data_exports_user_id ON data_exports(user_id);
CREATE INDEX IF NOT EXISTS idx_live_relay_sessions_user_id ON live_relay_sessions(user_id);