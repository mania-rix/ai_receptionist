/*
  # Create calls table

  1. New Tables
    - `calls`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `agent_id` (uuid, references agents)
      - `callee` (text, phone number)
      - `direction` (text, either 'outbound' or 'inbound')
      - `status` (text)
      - `started_at` (timestamptz)
      - `ended_at` (timestamptz, nullable)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `calls` table
    - Add policies for authenticated users to manage their calls
*/

CREATE TABLE IF NOT EXISTS calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  agent_id uuid REFERENCES agents NOT NULL,
  callee text NOT NULL,
  direction text NOT NULL CHECK (direction IN ('outbound', 'inbound')),
  status text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_phone_number CHECK (callee ~ '^\+[1-9]\d{1,14}$')
);

ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own calls"
  ON calls
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own calls"
  ON calls
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own calls"
  ON calls
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);