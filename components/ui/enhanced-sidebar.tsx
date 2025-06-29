'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Phone,
  PhoneCall,
  PhoneIncoming,
  FileText,
  BarChart2,
  Calendar,
  Shield,
  MessageSquare,
  GitBranch,
  Mic,
  CreditCard,
  Video,
  Hash,
  Bug,
  Settings,
  LogOut,
} from 'lucide-react';
import { supabase } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';

interface SidebarItem {
  title: string;
  href: string;
  icon: any;
  active?: boolean;
  disabled?: boolean;
}

interface SidebarCategory {
  title: string;
  items: SidebarItem[];
}

export function EnhancedSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [categories, setCategories] = useState<SidebarCategory[]>([
    {
      title: 'CORE',
      items: [
        {
          title: 'Overview',
          href: '/portal/overview',
          icon: LayoutDashboard,
        },
        {
          title: 'Agents',
          href: '/portal/agents',
          icon: Users,
        },
        {
          title: 'Outbound Calls',
          href: '/portal/calls-out',
          icon: PhoneCall,
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
      ],
    },
    {
      title: 'MANAGEMENT',
      items: [
        {
          title: 'Knowledge Base',
          href: '/portal/knowledge-base',
          icon: FileText,
        },
        {
          title: 'Analytics',
          href: '/portal/analytics',
          icon: BarChart2,
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
      ],
    },
    {
      title: 'PROTOTYPE CENTER',
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
          icon: CreditCard,
        },
        {
          title: 'Video Summaries',
          href: '/portal/video-summaries',
          icon: Video,
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
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        {
          title: 'Settings',
          href: '/portal/settings',
          icon: Settings,
        },
      ],
    },
  ]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="h-screen flex flex-col bg-[#0A0A0A] border-r border-gray-800 w-56 overflow-hidden">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600" />
        <span className="font-semibold text-white">BlvckWall AI</span>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        <nav className="px-2 py-4 space-y-6">
          {categories.map((category) => (
            <div key={category.title} className="space-y-1">
              <h3 className="px-4 text-xs font-semibold text-gray-400 tracking-wider">
                {category.title}
              </h3>
              {category.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.disabled ? '#' : item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2 text-sm rounded-md relative group',
                      isActive
                        ? 'text-white bg-gradient-to-r from-purple-600/20 to-blue-600/20 font-medium'
                        : 'text-gray-400 hover:text-white',
                      item.disabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-highlight"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-600 to-blue-600 rounded-full"
                        transition={{ type: 'spring', duration: 0.5 }}
                      />
                    )}
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Sign Out Button */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white rounded-md w-full"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}