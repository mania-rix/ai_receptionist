import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function getUser() {
  const cookieStore = cookies();
  const supabase = createServerSupabaseClient(cookieStore);

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return null;
    }
    return user;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}
