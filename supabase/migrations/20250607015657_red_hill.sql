/*
  # Update agents table structure

  1. Changes
    - Remove agent_id column (was incorrectly named)
    - Ensure retell_agent_id and retell_llm_id columns exist
    - Update constraints

  2. Security
    - Maintain existing RLS policies
*/

-- Add retell_agent_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agents' AND column_name = 'retell_agent_id'
  ) THEN
    ALTER TABLE agents ADD COLUMN retell_agent_id text;
  END IF;
END $$;

-- Add retell_llm_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agents' AND column_name = 'retell_llm_id'
  ) THEN
    ALTER TABLE agents ADD COLUMN retell_llm_id text;
  END IF;
END $$;

-- Remove agent_id column if it exists (incorrect naming)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agents' AND column_name = 'agent_id'
  ) THEN
    ALTER TABLE agents DROP COLUMN agent_id;
  END IF;
END $$;