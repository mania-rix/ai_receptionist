'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, User, PhoneOutgoing, PhoneIncoming, FileText, Video, Settings, LogOut, 
  Phone, Book, BarChart3, Calendar, Users, Shield, GitBranch, MessageSquare, Mic, 
  CreditCard, Hash, Bug, Rocket
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import { ActivityFeed } from '@/components/activity-feed';
import { FeedbackWidget } from '@/components/feedback-widget';

// Define sidebar sections for better organization
const sections = [
  {
    title: 'OVERVIEW',
    items: [
      {
        title: 'Overview',
        href: '/portal/overview',
        icon: LayoutDashboard,
      }
    ]
  },
  {
    title: 'OPERATIONS',
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
      {
        title: 'Live Relay',
        href: '/portal/live-relay',
        icon: MessageSquare,
      }
    ]
  },
  {
    title: 'KNOWLEDGE & INSIGHTS',
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
      }
    ]
  },
  {
    title: 'COMMUNITY & COMPLIANCE',
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
      {
        title: 'Conversation Flows',
        href: '/portal/conversation-flows',
        icon: GitBranch,
      }
    ]
  },
  {
    title: 'HACKATHON FEATURES',
    items: [
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
        title: 'Deploy',
        href: '/portal/deploy',
        icon: Rocket,
      }
    ]
  },
  {
    title: 'SETTINGS & ACCOUNT',
    items: [
      {
        title: 'Settings',
        href: '/portal/settings',
        icon: Settings,
      }
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
      <div className="mb-6 h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600" />
      
      {/* Activity Feed */}
      <div className="mb-4">
        <ActivityFeed />
      </div>

      <div className="flex flex-1 flex-col items-center gap-1 w-full">
        <TooltipProvider>
          {sections.map((section, sectionIndex) => (
            <div key={section.title} className="w-full">
              {sectionIndex > 0 && (
                <div className="my-3 px-2">
                  <div className="h-px w-full bg-gray-800" />
                </div>
              )}
              
              <div className="px-2 py-1">
                <p className="text-[9px] text-gray-500 font-medium tracking-wider px-2 mb-2 hidden">
                  {section.title}
                </p>
                
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  
                  return (
                    <Tooltip key={item.href} delayDuration={100}>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "group relative flex h-10 w-full items-center justify-center rounded-md text-gray-400 transition-colors hover:text-white",
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
                        className="border-gray-800 bg-[#1A1A1A] text-white pointer-events-none z-50"
                        sideOffset={8}
                      >
                        {item.title}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
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