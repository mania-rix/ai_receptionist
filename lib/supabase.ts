// This file is kept for backward compatibility but its functionality is disabled

// Mock Supabase client for demo mode
const mockClient = {
  auth: {
    getUser: async () => {
      if (typeof window !== "undefined") {
        const userStr = sessionStorage.getItem("currentUser");
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            return { data: { user }, error: null };
          } catch {
            // If parsing fails, treat as not logged in
          }
        }
      }
      return { data: { user: null }, error: null };
    },
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ data: { user: null }, error: null }),
    signUp: async () => ({ data: { user: null }, error: null }),
    signOut: async () => ({ error: null }),
    refreshSession: async () => ({ data: { session: null }, error: null }),
    exchangeCodeForSession: async () => ({ data: { session: null }, error: null })
  },
  from: (table: string) => ({
    select: (_fields?: string) => ({
      eq: (_column: string, _value: any) => ({
        order: (_column: string, _options?: any) => ({
          data: [],
          error: null,
          limit: () => ({ data: [], error: null })
        }),
        single: () => ({ data: { id: 'mock_export_id' }, error: {} as any }),
        data: [],
        error: null
      }),
      order: (_column: string, _options?: { ascending?: boolean; nullsFirst?: boolean }) => ({
        data: [],
        error: null
      }),
      data: [],
      error: null
    }),
    insert: (_rows: any) => ({
      select: (_fields?: string) => ({
        single: () => ({ data: { id: 'mock_export_id' }, error: {} as any })
      }),
      data: null,
      error: null
    }),
    update: (_data: any) => ({
      eq: (_column: string, _value: any) => ({
        select: (_fields?: string) => ({
          single: () => ({ data: { id: 'mock_export_id' }, error: {} as any })
        }),
        data: null,
        error: null
      }),
      data: null,
      error: null
    }),
    delete: () => ({
      eq: (_column: string, _value: any) => ({ data: null, error: null }),
      data: null,
      error: null
    })
  })
};


/**
 * DEMO MODE: Supabase server client is disabled.
 * All data is stored in sessionStorage and will be lost on refresh or sign out.
 */
export function supabaseServer() {
  return mockClient;
}

/**
 * DEMO MODE: Supabase browser client is disabled.
 * All data is stored in sessionStorage and will be lost on refresh or sign out.
 */
export const supabaseBrowser = mockClient;

// Keep these type definitions for backward compatibility
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
