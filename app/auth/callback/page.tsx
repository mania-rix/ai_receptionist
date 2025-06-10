'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser'; // <--- this import

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/portal/overview');
      } else {
        router.replace('/sign-in');
      }
    });
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center text-white">
      <p className="opacity-70">Finalizing authentication…</p>
    </div>
  );
}
