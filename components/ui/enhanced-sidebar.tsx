'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  User, 
  PhoneOutgoing, 
  PhoneIncoming, 
  FileText, 
  Video, 
  Settings, 
  LogOut, 
  Phone, 
  Book, 
  BarChart3, 
  Calendar, 
  Users, 
  Shield, 
  GitBranch, 
  MessageSquare, 
  Mic,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import { ActivityFeed } from '../activity-feed';
import { FeedbackWidget } from '../feedback-widget';
import { useState } from 'react';

// Group navigation items
const navGroups = [
  {
    title: 'Core',
    items: [
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
    ]
  },
  {
    title: 'Management',
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
    <div className="flex h-full w-[72px] flex-col items-center border-r border-gray-800 bg-[#121212] py-4 overflow-hidden">
    title: 'Hackathon Features',
    items: [
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
        title: 'Digital Cards',
        href: '/portal/digital-cards',
        icon: FileText,
      },
      {
        title: 'Video Summaries',
        href: '/portal/video-summaries',
        icon: Video,
      },
      {
        title: 'Compliance Ledger',
        href: '/portal/compliance-ledger',
        icon: Shield,
      },
      {
        title: 'Debug Console',
        href: '/portal/debug-console',
        icon: FileText,
      },
    ]
  },
  {
    title: 'System',
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
  const [isExpanded, setIsExpanded] = useState(true);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className={cn(
      "flex flex-col border-r border-gray-800 bg-[#121212] transition-all duration-300",
      isExpanded ? "w-64" : "w-[72px]"
    )}>
      <div className="flex items-center justify-between p-4">
        <div className={cn(
          "flex items-center gap-3 transition-opacity",
          isExpanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
        )}>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600" />
          <span className="font-semibold">BlvckWall AI</span>
        </div>
        {!isExpanded && (
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 mx-auto" />
        )}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
      
      <div className="mt-2 px-3">
        <ActivityFeed />
      </div>
      
      <div className="flex flex-1 flex-col items-center gap-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent w-full">
        <TooltipProvider>
          {navGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-6">
              {isExpanded && (
                <h3 className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {group.title}
                </h3>
              )}
              {!isExpanded && (
                <div className="h-px bg-gray-800 mx-2 my-4" />
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  
                  return (
                    <Tooltip key={item.href} delayDuration={300}>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 px-4 py-2 rounded-md text-gray-400 transition-colors",
                            isActive ? "bg-gray-800 text-white" : "hover:bg-gray-900 hover:text-white",
                            !isExpanded && "justify-center px-2"
                          )}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="activeNav"
                              className="absolute left-0 w-1 h-6 bg-gradient-to-b from-purple-600 to-blue-600 rounded-r-md"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            />
                          )}
                          <item.icon className="h-5 w-5 flex-shrink-0" />
                          {isExpanded && <span>{item.title}</span>}
                        </Link>
                      </TooltipTrigger>
                      {!isExpanded && (
                        <TooltipContent 
                          side="right" 
                          className="border-gray-800 bg-[#1A1A1A] text-white pointer-events-none z-50"
                          sideOffset={8}
                        >
                          {item.title}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          ))}
        </TooltipProvider>
      </div>

      <div className="p-4 border-t border-gray-800">
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <button
                onClick={handleSignOut}
                className={cn(
                  "flex items-center gap-3 w-full px-4 py-2 rounded-md text-gray-400 hover:bg-gray-900 hover:text-white transition-colors",
                  !isExpanded && "justify-center px-2"
                )}
              > 
                <LogOut className="h-5 w-5 flex-shrink-0" />
                {isExpanded && <span>Sign Out</span>}
              </button>
            </TooltipTrigger>
            {!isExpanded && (
              <TooltipContent 
                side="right" 
                className="border-gray-800 bg-[#1A1A1A] text-white pointer-events-none z-50"
                sideOffset={8}
              >
                Sign Out
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <FeedbackWidget />
    </div>
  );
}