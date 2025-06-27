'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { LayoutDashboard, User, PhoneOutgoing, PhoneIncoming, FileText, Video, Settings, LogOut, Phone, Book, BarChart3, Calendar, Users, Shield, GitBranch, MessageSquare, Mic } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation';
import { ActivityFeed } from './activity-feed';
import { FeedbackWidget } from './feedback-widget';

const navItems = [
  {
    title: 'Overview',
    href: '/portal/overview',
    icon: LayoutDashboard,
  },
  {
    title: 'Agents',
    href: '/portal/agents',
    icon: User,
  },
  {
    title: 'Outbound Calls',
    href: '/portal/calls-out',
    icon: PhoneOutgoing,
  },
  {
    title: 'Inbound Calls',
    href: '/portal/calls-in',
    icon: PhoneIncoming,
  },
  {
    title: 'Phone Numbers',
    href: '/portal/phone-numbers',
    icon: Phone,
  },
  {
    title: 'Knowledge Base',
    href: '/portal/knowledge-base',
    icon: Book,
  },
  {
    title: 'Analytics',
    href: '/portal/analytics',
    icon: BarChart3,
  },
  {
    title: 'Events',
    href: '/portal/events',
    icon: Calendar,
  },
  {
    title: 'HR Center',
    href: '/portal/hr-center',
    icon: Users,
  },
  {
    title: 'Compliance',
    href: '/portal/compliance',
    icon: Shield,
  },
  {
    title: 'Live Relay',
    href: '/portal/live-relay',
    icon: MessageSquare,
  },
  {
    title: 'Conversation Flows',
    href: '/portal/conversation-flows',
    icon: GitBranch,
  },
  {
    title: 'Voice Analytics',
    href: '/portal/voice-analytics',
    icon: Mic,
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="flex h-full w-[72px] flex-col items-center border-r border-gray-800 bg-[#121212] py-4">
      <div className="mb-6 h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600" />
      
      {/* Activity Feed */}
      <div className="mb-4">
        <ActivityFeed />
      </div>

      <div className="flex flex-1 flex-col items-center gap-4">
        <TooltipProvider delayDuration={100}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <Tooltip key={item.href} >
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
                <TooltipContent 
                  side="right" 
                  className="border-gray-800 bg-[#1A1A1A] text-white pointer-events-none z-50"
                  sideOffset={8}
                >
                  {item.title}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>

      <TooltipProvider>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <button
              onClick={handleSignOut}
              className="mt-auto flex h-10 w-10 items-center justify-center rounded-md text-gray-400 transition-colors hover:text-white"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent 
            side="right" 
            className="border-gray-800 bg-[#1A1A1A] text-white pointer-events-none z-50"
            sideOffset={8}
          >
            Sign Out
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {/* Feedback Widget */}
      <FeedbackWidget />
    </div>
  );
}