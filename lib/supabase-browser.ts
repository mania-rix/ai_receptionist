'use client'
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '../database.types'

/**
 * Singleton browser Supabase client (for use in components, hooks, etc)
 * Safe to use in 'use client' code.
 */
export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)