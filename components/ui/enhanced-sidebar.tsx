'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, Users, Phone, PhoneOutgoing, PhoneIncoming, 
  FileText, BarChart2, Calendar, UserCheck, ShieldCheck, 
  MessageSquare, GitBranch, Mic, CreditCard, Video, 
  Database, Bug, Settings, LogOut
} from 'lucide-react';

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const SidebarItem = ({ href, icon, label, isActive }: SidebarItemProps) => {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors relative group",
        isActive 
          ? "text-white bg-blue-600/20" 
          : "text-gray-400 hover:text-white hover:bg-gray-800"
      )}
    >
      {isActive && (
        <motion.div
          layoutId="sidebar-highlight"
          className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}
      <div className="w-5 h-5 flex items-center justify-center">
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
};

interface SidebarCategoryProps {
  title: string;
  children: React.ReactNode;
}

const SidebarCategory = ({ title, children }: SidebarCategoryProps) => {
  return (
    <div className="mb-6">
      <div className="px-3 mb-2">
        <h3 className="text-xs font-semibold text-blue-400">{title}</h3>
      </div>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
};

export function EnhancedSidebar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-60 bg-[#0A0A0A] border-r border-gray-800 h-screen flex-shrink-0" />
    );
  }

  return (
    <div className="w-60 bg-[#0A0A0A] border-r border-gray-800 h-screen flex-shrink-0 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-gray-800">
        <Link href="/portal/overview" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold">BW</span>
          </div>
          <span className="font-semibold text-white">BlvckWall AI</span>
        </Link>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 overflow-y-auto sidebar-nav py-4 px-2">
        <SidebarCategory title="CORE">
          <SidebarItem
            href="/portal/overview"
            icon={<LayoutDashboard className="w-4 h-4" />}
            label="Overview"
            isActive={pathname === '/portal/overview'}
          />
          <SidebarItem
            href="/portal/agents"
            icon={<Users className="w-4 h-4" />}
            label="Agents"
            isActive={pathname === '/portal/agents'}
          />
          <SidebarItem
            href="/portal/calls-out"
            icon={<PhoneOutgoing className="w-4 h-4" />}
            label="Outbound Calls"
            isActive={pathname === '/portal/calls-out'}
          />
          <SidebarItem
            href="/portal/calls-in"
            icon={<PhoneIncoming className="w-4 h-4" />}
            label="Inbound Calls"
            isActive={pathname === '/portal/calls-in'}
          />
          <SidebarItem
            href="/portal/phone-numbers"
            icon={<Phone className="w-4 h-4" />}
            label="Phone Numbers"
            isActive={pathname === '/portal/phone-numbers'}
          />
        </SidebarCategory>
        
        <SidebarCategory title="MANAGEMENT">
          <SidebarItem
            href="/portal/knowledge-base"
            icon={<FileText className="w-4 h-4" />}
            label="Knowledge Base"
            isActive={pathname === '/portal/knowledge-base'}
          />
          <SidebarItem
            href="/portal/analytics"
            icon={<BarChart2 className="w-4 h-4" />}
            label="Analytics"
            isActive={pathname === '/portal/analytics'}
          />
          <SidebarItem
            href="/portal/events"
            icon={<Calendar className="w-4 h-4" />}
            label="Events"
            isActive={pathname === '/portal/events'}
          />
          <SidebarItem
            href="/portal/hr-center"
            icon={<UserCheck className="w-4 h-4" />}
            label="HR Center"
            isActive={pathname === '/portal/hr-center'}
          />
          <SidebarItem
            href="/portal/compliance"
            icon={<ShieldCheck className="w-4 h-4" />}
            label="Compliance"
            isActive={pathname === '/portal/compliance'}
          />
        </SidebarCategory>
        
        <SidebarCategory title="PROTOTYPE CENTER">
          <SidebarItem
            href="/portal/live-relay"
            icon={<MessageSquare className="w-4 h-4" />}
            label="Live Relay"
            isActive={pathname === '/portal/live-relay'}
          />
          <SidebarItem
            href="/portal/conversation-flows"
            icon={<GitBranch className="w-4 h-4" />}
            label="Conversation Flows"
            isActive={pathname === '/portal/conversation-flows'}
          />
          <SidebarItem
            href="/portal/voice-analytics"
            icon={<Mic className="w-4 h-4" />}
            label="Voice Analytics"
            isActive={pathname === '/portal/voice-analytics'}
          />
          <SidebarItem
            href="/portal/digital-cards"
            icon={<CreditCard className="w-4 h-4" />}
            label="Digital Cards"
            isActive={pathname === '/portal/digital-cards'}
          />
          <SidebarItem
            href="/portal/video-summaries"
            icon={<Video className="w-4 h-4" />}
            label="Video Summaries"
            isActive={pathname === '/portal/video-summaries'}
          />
          <SidebarItem
            href="/portal/compliance-ledger"
            icon={<Database className="w-4 h-4" />}
            label="Compliance Ledger"
            isActive={pathname === '/portal/compliance-ledger'}
          />
          <SidebarItem
            href="/portal/debug-console"
            icon={<Bug className="w-4 h-4" />}
            label="Debug Console"
            isActive={pathname === '/portal/debug-console'}
          />
        </SidebarCategory>
        
        <SidebarCategory title="SYSTEM">
          <SidebarItem
            href="/portal/settings"
            icon={<Settings className="w-4 h-4" />}
            label="Settings"
            isActive={pathname === '/portal/settings'}
          />
        </SidebarCategory>
      </div>
      
      {/* Sign Out */}
      <div className="p-4 border-t border-gray-800">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Sign Out</span>
        </Link>
      </div>
    </div>
  );
}