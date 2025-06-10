'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, User, PhoneOutgoing, PhoneIncoming, FileText, 
  Settings, LogOut, Phone, Book, BarChart3, Calendar, Users, Shield, 
  GitBranch, MessageSquare, Mic, ChevronLeft, ChevronRight, Search
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/ui/search-bar';
import { supabase } from '@/lib/supabase-browser';

const navItems = [
  // Overview
  {
    title: 'Overview',
    href: '/portal/overview',
    icon: LayoutDashboard,
    category: 'overview'
  },
  // Operations
  {
    title: 'Agents',
    href: '/portal/agents',
    icon: User,
    category: 'operations'
  },
  {
    title: 'Outbound Calls',
    href: '/portal/calls-out',
    icon: PhoneOutgoing,
    category: 'operations'
  },
  {
    title: 'Inbound Calls',
    href: '/portal/calls-in',
    icon: PhoneIncoming,
    category: 'operations'
  },
  {
    title: 'Phone Numbers',
    href: '/portal/phone-numbers',
    icon: Phone,
    category: 'operations'
  },
  {
    title: 'Live Relay',
    href: '/portal/live-relay',
    icon: MessageSquare,
    category: 'operations'
  },
  {
    title: 'Conversation Flows',
    href: '/portal/conversation-flows',
    icon: GitBranch,
    category: 'operations'
  },
  // Knowledge & Insights
  {
    title: 'Knowledge Base',
    href: '/portal/knowledge-base',
    icon: Book,
    category: 'insights'
  },
  {
    title: 'Analytics',
    href: '/portal/analytics',
    icon: BarChart3,
    category: 'insights'
  },
  {
    title: 'Events',
    href: '/portal/events',
    icon: Calendar,
    category: 'insights'
  },
  {
    title: 'Voice Analytics',
    href: '/portal/voice-analytics',
    icon: Mic,
    category: 'insights'
  },
  {
    title: 'HR Center',
    href: '/portal/hr-center',
    icon: Users,
    category: 'insights'
  },
  {
    title: 'Compliance',
    href: '/portal/compliance',
    icon: Shield,
    category: 'insights'
  },
  // Settings
  {
    title: 'Settings',
    href: '/portal/settings',
    icon: Settings,
    category: 'settings'
  },
];

const categories = {
  overview: { title: 'Overview', items: [] as typeof navItems },
  operations: { title: 'Operations', items: [] as typeof navItems },
  insights: { title: 'Knowledge & Insights', items: [] as typeof navItems },
  settings: { title: 'Settings & Account', items: [] as typeof navItems },
};

export function EnhancedSidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.push('/');
  }, [router]);

  const categorizedItems = useMemo(() => {
    const cats = { ...categories };
    navItems.forEach(item => {
      cats[item.category as keyof typeof cats].items.push(item);
    });
    return cats;
  }, []);

  const filteredItems = useMemo(() => {
    if (!searchQuery) return categorizedItems;
    
    const filtered = { ...categories };
    Object.entries(categorizedItems).forEach(([key, category]) => {
      filtered[key as keyof typeof filtered] = {
        ...category,
        items: category.items.filter(item =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      };
    });
    return filtered;
  }, [categorizedItems, searchQuery]);

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

  // Optimized animation variants
  const sidebarVariants = {
    collapsed: {
      width: 72,
      transition: {
        type: shouldReduceMotion ? "tween" : "spring",
        stiffness: shouldReduceMotion ? undefined : 300,
        damping: shouldReduceMotion ? undefined : 30,
        mass: shouldReduceMotion ? undefined : 0.8,
        duration: shouldReduceMotion ? 0.2 : undefined,
        when: "afterChildren"
      }
    },
    expanded: {
      width: 280,
      transition: {
        type: shouldReduceMotion ? "tween" : "spring",
        stiffness: shouldReduceMotion ? undefined : 300,
        damping: shouldReduceMotion ? undefined : 30,
        mass: shouldReduceMotion ? undefined : 0.8,
        duration: shouldReduceMotion ? 0.2 : undefined,
        when: "beforeChildren"
      }
    }
  };

  const contentVariants = {
    collapsed: {
      opacity: 0,
      x: -10,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.15,
        ease: "easeOut"
      }
    },
    expanded: {
      opacity: 1,
      x: 0,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.2,
        ease: "easeOut",
        delay: shouldReduceMotion ? 0 : 0.1
      }
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <motion.div
        className="flex h-full flex-col border-r border-gray-800 bg-[#0A0A0A]/95 backdrop-blur-xl will-change-[width] transform-gpu"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        animate={isExpanded || isPinned ? "expanded" : "collapsed"}
        variants={sidebarVariants}
        initial="collapsed"
        style={{ 
          willChange: 'width',
          backfaceVisibility: 'hidden',
          perspective: 1000
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800/50 min-h-[72px]">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex-shrink-0" />
            <AnimatePresence mode="wait">
              {(isExpanded || isPinned) && (
                <motion.span
                  className="font-semibold text-white whitespace-nowrap"
                  variants={contentVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                >
                  BlvckWall AI
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          
          <AnimatePresence mode="wait">
            {(isExpanded || isPinned) && (
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
                  className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                >
                  {isPinned ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Search Bar */}
        <AnimatePresence mode="wait">
          {(isExpanded || isPinned) && (
            <motion.div
              className="p-4 border-b border-gray-800/30"
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
            >
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search navigation..."
                className="w-full"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 scrollbar-hide">
          {Object.entries(filteredItems).map(([categoryKey, category]) => {
            if (category.items.length === 0) return null;
            
            return (
              <div key={categoryKey} className="space-y-2">
                {/* Category Header */}
                <AnimatePresence mode="wait">
                  {(isExpanded || isPinned) && (
                    <motion.div
                      className="px-4"
                      variants={contentVariants}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                    >
                      <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {category.title}
                      </h3>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation Items */}
                <div className="space-y-1 px-2">
                  {category.items.map((item, index) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    
                    return (
                      <div key={item.href} className="relative">
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-600 to-blue-600 rounded-r-md"
                            transition={{ 
                              type: shouldReduceMotion ? "tween" : "spring", 
                              stiffness: shouldReduceMotion ? undefined : 400, 
                              damping: shouldReduceMotion ? undefined : 30,
                              duration: shouldReduceMotion ? 0.2 : undefined
                            }}
                          />
                        )}
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              href={item.href}
                              className={cn(
                                'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-gray-800/50',
                                isActive 
                                  ? 'text-white bg-gray-800/30' 
                                  : 'text-gray-400 hover:text-white'
                              )}
                            >
                              <Icon className="h-5 w-5 flex-shrink-0" />
                              <AnimatePresence mode="wait">
                                {(isExpanded || isPinned) && (
                                  <motion.span
                                    className="whitespace-nowrap"
                                    variants={contentVariants}
                                    initial="collapsed"
                                    animate="expanded"
                                    exit="collapsed"
                                  >
                                    {item.title}
                                  </motion.span>
                                )}
                              </AnimatePresence>
                            </Link>
                          </TooltipTrigger>
                          {!(isExpanded || isPinned) && (
                            <TooltipContent side="right" className="border-gray-800 bg-[#1A1A1A] text-white">
                              {item.title}
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Account Section */}
        <div className="border-t border-gray-800/50 p-4 space-y-3">
          <AnimatePresence mode="wait">
            {(isExpanded || isPinned) && (
              <motion.div
                className="flex items-center gap-3 px-2 py-2"
                variants={contentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">Demo User</p>
                  <p className="text-xs text-gray-400 truncate">demo@blvckwall.ai</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 transition-all duration-200 hover:bg-gray-800/50 hover:text-white"
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                <AnimatePresence mode="wait">
                  {(isExpanded || isPinned) && (
                    <motion.span
                      className="whitespace-nowrap"
                      variants={contentVariants}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                    >
                      Sign Out
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </TooltipTrigger>
            {!(isExpanded || isPinned) && (
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