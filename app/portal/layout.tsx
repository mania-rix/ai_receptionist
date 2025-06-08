/*import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';
import { SidebarNav } from '@/components/sidebar-nav';
import type { ReactNode } from 'react';

export default async function PortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = cookies();
  const supabase = createServerSupabaseClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  return (
    <div className="flex h-screen bg-[#0E0E0E] text-white">
      <SidebarNav />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
*/


import { SidebarNav } from '@/components/sidebar-nav'
import type { ReactNode } from 'react'

export default function PortalLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex h-screen bg-[#0E0E0E] text-white">
      <SidebarNav />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
