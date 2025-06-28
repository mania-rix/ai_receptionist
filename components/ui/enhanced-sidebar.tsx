'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, User, PhoneOutgoing, PhoneIncoming, FileText, 
  Video, Settings, LogOut, Phone, Book, BarChart3, Calendar, 
  Users, Shield, GitBranch, MessageSquare, Mic, CreditCard, 
  Hash, Bug, Rocket, Zap
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation';
import { ActivityFeed } from '@/components/activity-feed';
import { FeedbackWidget } from '@/components/feedback-widget';

const navItems = [
  {
    section: 'OVERVIEW',
    items: [
      {
        title: 'Overview',
        href: '/portal/overview',
        icon: LayoutDashboard,
      }
    ]
  },
  {
    section: 'OPERATIONS',
    items: [
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
    ]
  },
  {
    section: 'HACKATHON FEATURES',
    items: [
      {
        title: 'Live Relay',
        href: '/portal/live-relay',
        icon: MessageSquare,
      },
      {
        title: 'Video Summaries',
        href: '/portal/video-summaries',
        icon: Video,
      },
      {
        title: 'Digital Cards',
        href: '/portal/digital-cards',
        icon: CreditCard,
      },
      {
        title: 'Compliance Ledger',
        href: '/portal/compliance-ledger',
        icon: Hash,
      },
      {
        title: 'Debug Console',
        href: '/portal/debug-console',
        icon: Bug,
      },
      {
        title: 'Deployment',
        href: '/portal/deploy',
        icon: Rocket,
      },
    ]
  },
  {
    section: 'KNOWLEDGE & INSIGHTS',
    items: [
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
        title: 'Voice Analytics',
        href: '/portal/voice-analytics',
        icon: Mic,
      },
      {
        title: 'Conversation Flows',
        href: '/portal/conversation-flows',
        icon: GitBranch,
      },
    ]
  },
  {
    section: 'ORGANIZATION',
    items: [
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
    ]
  },
  {
    section: 'SETTINGS & ACCOUNT',
    items: [
      {
        title: 'Settings',
        href: '/portal/settings',
        icon: Settings,
      },
    ]
  }
];

export function EnhancedSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="flex h-full w-[72px] flex-col items-center border-r border-gray-800 bg-[#121212] py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
      <div className="mb-6 h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
        <Zap className="h-5 w-5 text-white" />
      </div>
      
      {/* Activity Feed */}
      <div className="mb-4">
        <ActivityFeed />
      </div>

      <div className="flex flex-1 flex-col items-center gap-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        <TooltipProvider>
          {navItems.map((section) => (
            <div key={section.section} className="w-full flex flex-col items-center">
              {section.items.map((item) => {
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
              <div className="w-8 border-t border-gray-800 my-2"></div>
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
      
      {/* Feedback Widget */}
      <FeedbackWidget />
    </div>
  );
}