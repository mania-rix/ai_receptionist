import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function getUser() {
  console.log('[AuthLib] Getting user...');
  const cookieStore = cookies();
  const supabase = createServerSupabaseClient(cookieStore);

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('[AuthLib] No user found');
      return null;
    }
    console.log('[AuthLib] User found:', user.id);
    return user;
  } catch (error) {
    console.error('[AuthLib] Error getting user:', error);
    return null;
  }
}
