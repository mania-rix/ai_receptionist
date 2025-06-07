/*
  # Add Retell Numbers Table

  1. New Tables
    - `retell_numbers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `label` (text)
      - `phone_number` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `retell_numbers` table
    - Add policies for authenticated users to manage their numbers
*/

CREATE TABLE IF NOT EXISTS retell_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  label text NOT NULL,
  phone_number text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_phone_number CHECK (phone_number ~ '^\+[1-9]\d{1,14}$')
);

ALTER TABLE retell_numbers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own numbers"
  ON retell_numbers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own numbers"
  ON retell_numbers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own numbers"
  ON retell_numbers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own numbers"
  ON retell_numbers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);