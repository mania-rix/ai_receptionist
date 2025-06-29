'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/auth/blvckwall');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center text-white">
      <p className="opacity-70">Redirecting to login…</p>
    </div>
  );
}