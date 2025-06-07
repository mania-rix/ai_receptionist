'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { LayoutDashboard, PhoneOutgoing, PhoneIncoming, FileText, Video, Settings, LogOut } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const navItems = [
  {
    title: 'Overview',
    href: '/portal/overview',
    icon: LayoutDashboard,
  },
  {
    title: 'Agents',
    href: '/portal/agents',
    icon: LayoutDashboard,
  },
  {
    title: 'Outbound Calls',
    href: '/portal/calls-out',
    icon: PhoneOutgoing,
  },
  {
    title: 'Inbound',
    href: '/portal/inbound',
    icon: PhoneIncoming,
  },
  {
    title: 'Ledger',
    href: '/portal/ledger',
    icon: FileText,
  },
  {
    title: 'Video',
    href: '/portal/video',
    icon: Video,
  },
  {
    title: 'Settings',
    href: '/portal/settings',
    icon: Settings,
  },
];

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="flex h-full w-[72px] flex-col items-center border-r border-gray-800 bg-[#121212] py-4">
      <div className="mb-8 h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600" />

      <div className="flex flex-1 flex-col items-center gap-4">
        <TooltipProvider>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'group relative flex h-10 w-10 items-center justify-center rounded-md text-gray-400 transition-colors hover:text-white',
                      isActive && 'text-white'
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute left-0 h-full w-1 rounded-r-md bg-gradient-to-b from-purple-600 to-blue-600"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                    <item.icon className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="border-gray-800 bg-[#1A1A1A] text-white">
                  {item.title}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>

      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              onClick={handleSignOut}
              className="mt-auto flex h-10 w-10 items-center justify-center rounded-md text-gray-400 transition-colors hover:text-white"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="border-gray-800 bg-[#1A1A1A] text-white">
            Sign Out
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}