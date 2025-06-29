'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { LayoutDashboard, User, PhoneOutgoing, PhoneIncoming, FileText, Video, Settings, LogOut, Phone, Book, BarChart3, Calendar, Users, Shield, GitBranch, MessageSquare, Mic, CreditCard, Hash, Bug } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation';

const navItems = [
  {
    title: 'Overview',
    href: '/portal/overview',
    icon: LayoutDashboard,
    section: 'DASHBOARD'
  },
  {
    title: 'Agents',
    href: '/portal/agents',
    icon: User,
    section: 'OPERATIONS'
  },
  {
    title: 'Outbound Calls',
    href: '/portal/calls-out',
    icon: PhoneOutgoing,
    section: 'OPERATIONS'
  },
  {
    title: 'Inbound Calls',
    href: '/portal/calls-in',
    icon: PhoneIncoming,
    section: 'OPERATIONS'
  },
  {
    title: 'Phone Numbers',
    href: '/portal/phone-numbers',
    icon: Phone,
    section: 'OPERATIONS'
  },
  {
    title: 'Knowledge Base',
    href: '/portal/knowledge-base',
    icon: Book,
    section: 'KNOWLEDGE & INSIGHTS'
  },
  {
    title: 'Analytics',
    href: '/portal/analytics',
    icon: BarChart3,
    section: 'KNOWLEDGE & INSIGHTS'
  },
  {
    title: 'Voice Analytics',
    href: '/portal/voice-analytics',
    icon: Mic,
    section: 'KNOWLEDGE & INSIGHTS'
  },
  {
    title: 'Events',
    href: '/portal/events',
    icon: Calendar,
    section: 'MANAGEMENT'
  },
  {
    title: 'HR Center',
    href: '/portal/hr-center',
    icon: Users,
    section: 'MANAGEMENT'
  },
  {
    title: 'Compliance',
    href: '/portal/compliance',
    icon: Shield,
    section: 'MANAGEMENT'
  },
  {
    title: 'Live Relay',
    href: '/portal/live-relay',
    icon: MessageSquare,
    section: 'HACKATHON FEATURES'
  },
  {
    title: 'Video Summaries',
    href: '/portal/video-summaries',
    icon: Video,
    section: 'HACKATHON FEATURES'
  },
  {
    title: 'Digital Cards',
    href: '/portal/digital-cards',
    icon: CreditCard,
    section: 'HACKATHON FEATURES'
  },
  {
    title: 'Compliance Ledger',
    href: '/portal/compliance-ledger',
    icon: Hash,
    section: 'HACKATHON FEATURES'
  },
  {
    title: 'Debug Console',
    href: '/portal/debug-console',
    icon: Bug,
    section: 'HACKATHON FEATURES'
  },
  {
    title: 'Conversation Flows',
    href: '/portal/conversation-flows',
    icon: GitBranch,
    section: 'ADVANCED'
  },
  {
    title: 'Settings',
    href: '/portal/settings',
    icon: Settings,
    section: 'SETTINGS & ACCOUNT'
  },
];

export function EnhancedSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Group nav items by section
  const groupedNavItems: { [key: string]: typeof navItems } = {};
  navItems.forEach(item => {
    if (!groupedNavItems[item.section]) {
      groupedNavItems[item.section] = [];
    }
    groupedNavItems[item.section].push(item);
  });

  return (
    <div className="flex h-full w-[72px] flex-col items-center border-r border-gray-800 bg-[#121212] py-4">
      <div className="mb-6 h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600" />
      
      <div className="flex flex-1 flex-col items-center gap-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        <TooltipProvider>
          {Object.entries(groupedNavItems).map(([section, items]) => (
            <div key={section} className="w-full">
              <div className="px-2 mb-2">
                <div className="text-[10px] text-gray-500 font-medium tracking-wider text-center">{section}</div>
              </div>
              
              {items.map((item) => {
                const isActive = pathname === item.href;
                
                return (
                  <Tooltip key={item.href} delayDuration={100}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "group relative flex h-10 w-10 items-center justify-center rounded-md text-gray-400 transition-colors hover:text-white",
                          isActive && "text-white"
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
                      className="border-gray-800 bg-[#1A1A1A] text-white pointer-events-none z-[9999]"
                      sideOffset={8}
                    >
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
              
              <div className="h-4"></div>
            </div>
          ))}
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
            className="border-gray-800 bg-[#1A1A1A] text-white pointer-events-none z-[9999]"
            sideOffset={8}
          >
            Sign Out
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}