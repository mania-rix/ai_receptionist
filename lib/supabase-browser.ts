'use client'
// This file is kept for backward compatibility but its functionality is disabled

/**
 * DEMO MODE: Supabase client is disabled.
 * All data is stored in sessionStorage and will be lost on refresh or sign out.
 */
export const supabase = {
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ data: { user: null }, error: null }),
    signUp: async () => ({ data: { user: null }, error: null }),
    signOut: async () => ({ error: null }),
    refreshSession: async () => ({ data: { session: null }, error: null })
  },
  from: (table: string) => ({
    select: () => ({
      eq: () => ({
        order: () => ({
          limit: () => ({ data: [], error: null })
        }),
        single: () => ({ data: null, error: null }),
        data: [], 
        error: null
      }),
      order: () => ({
        data: [],
        error: null
      }),
      data: [],
      error: null
    }),
    insert: () => ({
      select: () => ({
        single: () => ({ data: null, error: null })
      }),
      data: null,
      error: null
    }),
    update: () => ({
      eq: () => ({
        select: () => ({
          single: () => ({ data: null, error: null })
        }),
        data: null,
        error: null
      }),
      data: null,
      error: null
    }),
    delete: () => ({
      eq: () => ({ data: null, error: null }),
      data: null,
      error: null
    })
  })
};