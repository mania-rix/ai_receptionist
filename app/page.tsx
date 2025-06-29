'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStorage } from '@/contexts/storage-context';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useStorage();

  useEffect(() => {
    // If user is authenticated, redirect to portal
    // Otherwise, redirect to login page
    if (isAuthenticated) {
      router.push('/portal/overview');
    } else {
      router.push('/auth/blvckwall');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex min-h-screen items-center justify-center text-white">
      <p className="opacity-70">Redirecting…</p>
    </div>
  );
}