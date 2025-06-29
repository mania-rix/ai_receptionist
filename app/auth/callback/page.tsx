'use client';

import { useStorage } from '@/contexts/storage-context';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { isAuthenticated } = useStorage();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/portal/overview');
    } else {
      router.replace('/auth/sign-in');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex min-h-screen items-center justify-center text-white">
      <p className="opacity-70">Finalizing authentication…</p>
    </div>
  );
}
