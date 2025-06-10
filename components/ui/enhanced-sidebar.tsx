'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, User, PhoneOutgoing, PhoneIncoming, FileText, 
  Settings, LogOut, Phone, Book, BarChart3, Calendar, Users, 
  Shield, GitBranch, MessageSquare, Mic, Pin, PinOff
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SearchBar } from '@/components/ui/search-bar';
import { supabase } from '@/lib/supabase-browser';

const navCategories = [
  {
    title: 'Overview',
    items: [
      {
        title: 'Overview',
        href: '/portal/overview',
        icon: LayoutDashboard,
      }
    ]
  },
  {
    title: 'Operations',
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
      },
      {
        title: 'Conversation Flows',
        href: '/portal/conversation-flows',
        icon: GitBranch,
      }
    ]
  },
  {
    title: 'Knowledge & Insights',
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
      }
    ]
  },
  {
    title: 'Settings & Account',
    items: [
      {
        title: 'Settings',
        href: '/portal/settings',
        icon: Settings,
      }
    ]
  }
];

// Optimized animation variants matching 21st.dev performance
const sidebarVariants = {
  collapsed: {
    width: 72,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 40,
      mass: 0.8,
      duration: 0.3
    }
  },
  expanded: {
    width: 280,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 40,
      mass: 0.8,
      duration: 0.3
    }
  }
};

const contentVariants = {
  collapsed: {
    opacity: 0,
    x: -10,
    transition: {
      duration: 0.15,
      ease: "easeOut"
    }
  },
  expanded: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.2,
      delay: 0.1,
      ease: "easeOut"
    }
  }
};

const itemVariants = {
  collapsed: {
    justifyContent: "center",
    transition: { duration: 0.2 }
  },
  expanded: {
    justifyContent: "flex-start",
    transition: { duration: 0.2 }
  }
};

export function EnhancedSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Memoized filtered items for performance
  const filteredItems = useMemo(() => {
    if (!searchQuery) return navCategories;
    
    return navCategories.map(category => ({
      ...category,
      items: category.items.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(category => category.items.length > 0);
  }, [searchQuery]);

  const handleMouseEnter = useCallback(() => {
    if (!isPinned) {
      setIsExpanded(true);
    }
  }, [isPinned]);

  const handleMouseLeave = useCallback(() => {
    if (!isPinned) {
      setIsExpanded(false);
    }
  }, [isPinned]);

  const togglePin = useCallback(() => {
    setIsPinned(prev => {
      const newPinned = !prev;
      setIsExpanded(newPinned);
      return newPinned;
    });
  }, []);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.push('/');
  }, [router]);

  const shouldShowExpanded = isExpanded || isPinned;

  return (
    <TooltipProvider delayDuration={300}>
      <motion.div
        className="relative flex flex-col border-r border-gray-800 bg-[#0A0A0A]/95 backdrop-blur-xl"
        variants={sidebarVariants}
        animate={shouldShowExpanded ? "expanded" : "collapsed"}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ willChange: 'width' }}
      >
        {/* Header with Logo and Pin */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex-shrink-0" />
            <AnimatePresence mode="wait">
              {shouldShowExpanded && (
                <motion.span
                  variants={contentVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  className="font-semibold text-white whitespace-nowrap"
                >
                  BlvckWall AI
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          
          <AnimatePresence>
            {shouldShowExpanded && (
              <motion.div
                variants={contentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePin}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                >
                  {isPinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-gray-800/50">
          <AnimatePresence mode="wait">
            {shouldShowExpanded ? (
              <motion.div
                variants={contentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
              >
                <SearchBar
                  placeholder="Search navigation..."
                  onSearch={setSearchQuery}
                  onClear={() => setSearchQuery('')}
                  variant="glassmorphism"
                  className="w-full"
                />
              </motion.div>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-9 justify-center text-gray-400 hover:text-white hover:bg-white/5"
                    onClick={() => setIsExpanded(true)}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="border-gray-800 bg-[#1A1A1A] text-white">
                  Search
                </TooltipContent>
              </Tooltip>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 space-y-1">
          {filteredItems.map((category, categoryIndex) => (
            <div key={category.title} className="px-3">
              <AnimatePresence>
                {shouldShowExpanded && (
                  <motion.div
                    variants={contentVariants}
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {category.title}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="space-y-1">
                {category.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  
                  return (
                    <Tooltip key={item.href} delayDuration={shouldShowExpanded ? 1000 : 300}>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                            'hover:bg-white/5 hover:text-white',
                            isActive 
                              ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white border-r-2 border-purple-500' 
                              : 'text-gray-400'
                          )}
                        >
                          <motion.div
                            variants={itemVariants}
                            animate={shouldShowExpanded ? "expanded" : "collapsed"}
                            className="flex items-center gap-3 w-full"
                          >
                            <Icon className="h-5 w-5 flex-shrink-0" />
                            <AnimatePresence mode="wait">
                              {shouldShowExpanded && (
                                <motion.span
                                  variants={contentVariants}
                                  initial="collapsed"
                                  animate="expanded"
                                  exit="collapsed"
                                  className="whitespace-nowrap"
                                >
                                  {item.title}
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </motion.div>
                          
                          {/* Active indicator */}
                          {isActive && (
                            <motion.div
                              layoutId="activeIndicator"
                              className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-600 to-blue-600 rounded-r-full"
                              transition={{ type: "spring", stiffness: 400, damping: 40 }}
                            />
                          )}
                        </Link>
                      </TooltipTrigger>
                      {!shouldShowExpanded && (
                        <TooltipContent side="right" className="border-gray-800 bg-[#1A1A1A] text-white">
                          {item.title}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Account Section */}
        <div className="border-t border-gray-800/50 p-3">
          <AnimatePresence>
            {shouldShowExpanded && (
              <motion.div
                variants={contentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="flex items-center gap-3 px-3 py-2 mb-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-purple-600 text-white text-sm">
                    U
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    demo@blvckwall.ai
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    Administrator
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Tooltip delayDuration={shouldShowExpanded ? 1000 : 300}>
            <TooltipTrigger asChild>
              <button
                onClick={handleSignOut}
                className={cn(
                  'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 w-full',
                  'hover:bg-red-500/10 hover:text-red-400 text-gray-400'
                )}
              >
                <motion.div
                  variants={itemVariants}
                  animate={shouldShowExpanded ? "expanded" : "collapsed"}
                  className="flex items-center gap-3 w-full"
                >
                  <LogOut className="h-5 w-5 flex-shrink-0" />
                  <AnimatePresence mode="wait">
                    {shouldShowExpanded && (
                      <motion.span
                        variants={contentVariants}
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        className="whitespace-nowrap"
                      >
                        Sign Out
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </button>
            </TooltipTrigger>
            {!shouldShowExpanded && (
              <TooltipContent side="right" className="border-gray-800 bg-[#1A1A1A] text-white">
                Sign Out
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}