/*
  # Create agents table

  1. New Tables
    - `agents`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `agent_id` (text, from Retell API)
      - `name` (text)
      - `voice` (text)
      - `greeting` (text)
      - `temperature` (float)
      - `interruption_sensitivity` (float)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `agents` table
    - Add policies for authenticated users to manage their own agents
*/

CREATE TABLE IF NOT EXISTS agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  agent_id text NOT NULL,
  name text NOT NULL,
  voice text NOT NULL,
  greeting text NOT NULL,
  temperature float NOT NULL,
  interruption_sensitivity float NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT temperature_range CHECK (temperature >= 0 AND temperature <= 1),
  CONSTRAINT sensitivity_range CHECK (interruption_sensitivity >= 0 AND interruption_sensitivity <= 1)
);

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own agents"
  ON agents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own agents"
  ON agents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own agents"
  ON agents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agents"
  ON agents
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);