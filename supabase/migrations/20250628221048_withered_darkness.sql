/*
  # Hackathon MVP Tables

  1. New Tables
    - `digital_cards` - Store blockchain business cards
    - `video_summaries` - Store Tavus video summaries
    - `blockchain_audits` - Store Algorand audit records
    - `error_logs` - Store Sentry error logs

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to manage their data
*/

-- Digital Business Cards
CREATE TABLE IF NOT EXISTS digital_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  title text,
  company text,
  email text NOT NULL,
  phone text,
  image_url text,
  ipfs_hash text NOT NULL,
  qr_code_url text,
  verification_url text,
  created_at timestamptz DEFAULT now()
);

-- Video Summaries
CREATE TABLE IF NOT EXISTS video_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  call_id uuid REFERENCES calls(id),
  patient_name text NOT NULL,
  doctor_name text NOT NULL,
  video_url text,
  status text DEFAULT 'generating' CHECK (status IN ('generating', 'completed', 'failed')),
  qr_code_url text,
  share_url text,
  created_at timestamptz DEFAULT now()
);

-- Blockchain Audit Records
CREATE TABLE IF NOT EXISTS blockchain_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  transaction_id text NOT NULL,
  transaction_hash text NOT NULL,
  block_number integer,
  type text NOT NULL CHECK (type IN ('call', 'video', 'card', 'compliance', 'hr_request')),
  action text NOT NULL,
  resource_id text NOT NULL,
  details jsonb DEFAULT '{}',
  explorer_url text,
  created_at timestamptz DEFAULT now()
);

-- Error Logs
CREATE TABLE IF NOT EXISTS error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users,
  level text NOT NULL CHECK (level IN ('error', 'warning', 'info')),
  message text NOT NULL,
  stack text,
  url text,
  browser text,
  sentry_id text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE digital_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE blockchain_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Digital Cards Policies
CREATE POLICY "Users can manage their digital cards"
  ON digital_cards FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Video Summaries Policies
CREATE POLICY "Users can manage their video summaries"
  ON video_summaries FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Blockchain Audits Policies
CREATE POLICY "Users can view their blockchain audits"
  ON blockchain_audits FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert blockchain audits"
  ON blockchain_audits FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Error Logs Policies
CREATE POLICY "Users can view their error logs"
  ON error_logs FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "System can insert error logs"
  ON error_logs FOR INSERT TO authenticated
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_digital_cards_user_id ON digital_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_video_summaries_user_id ON video_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_video_summaries_call_id ON video_summaries(call_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_audits_user_id ON blockchain_audits(user_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_audits_type ON blockchain_audits(type);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_level ON error_logs(level);