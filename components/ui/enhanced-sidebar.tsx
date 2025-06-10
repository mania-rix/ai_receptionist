'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, User, PhoneOutgoing, PhoneIncoming, FileText, 
  Settings, LogOut, Phone, Book, BarChart3, Calendar, Users, 
  Shield, GitBranch, MessageSquare, Mic, Search, Pin, PinOff,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase-browser';
import { ActivityFeed } from '../activity-feed';
import { FeedbackWidget } from '../feedback-widget';

interface NavCategory {
  title: string;
  items: NavItem[];
}

interface NavItem {
  title: string;
  href: string;
  icon: any;
  badge?: string;
  disabled?: boolean;
}

const navCategories: NavCategory[] = [
  {
    title: 'Overview',
    items: [
      {
        title: 'Dashboard',
        href: '/portal/overview',
        icon: LayoutDashboard,
      },
    ],
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
        badge: 'New',
      },
      {
        title: 'Conversation Flows',
        href: '/portal/conversation-flows',
        icon: GitBranch,
      },
    ],
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
      },
    ],
  },
];

export function EnhancedSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [filteredItems, setFilteredItems] = useState<NavItem[]>([]);

  useEffect(() => {
    console.log('[EnhancedSidebar] Component mounted');
    fetchUserInfo();
    
    return () => {
      console.log('[EnhancedSidebar] Component unmounted');
    };
  }, []);

  useEffect(() => {
    // Filter navigation items based on search
    if (searchQuery.trim()) {
      const allItems = navCategories.flatMap(category => category.items);
      const filtered = allItems.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems([]);
    }
  }, [searchQuery]);

  const fetchUserInfo = async () => {
    console.log('[EnhancedSidebar] Fetching user info...');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
        console.log('[EnhancedSidebar] User info fetched:', user.email);
      }
    } catch (error) {
      console.error('[EnhancedSidebar] Error fetching user info:', error);
    }
  };

  const handleSignOut = async () => {
    console.log('[EnhancedSidebar] Signing out...');
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleMouseEnter = () => {
    if (!isPinned) {
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isPinned) {
      setIsExpanded(false);
    }
  };

  const togglePin = () => {
    console.log('[EnhancedSidebar] Toggling pin:', !isPinned);
    setIsPinned(!isPinned);
    setIsExpanded(!isPinned);
  };

  const handleSearchSelect = (item: NavItem) => {
    console.log('[EnhancedSidebar] Navigating to:', item.href);
    router.push(item.href);
    setSearchQuery('');
  };

  const sidebarWidth = isExpanded ? 'w-64' : 'w-[72px]';

  return (
    <motion.div
      className={cn(
        'flex h-full flex-col border-r border-gray-800 bg-[#121212] transition-all duration-300 ease-in-out',
        sidebarWidth
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial={false}
      animate={{ width: isExpanded ? 256 : 72 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <motion.div
          className="flex items-center gap-3"
          initial={false}
          animate={{ opacity: isExpanded ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex-shrink-0" />
          {isExpanded && (
            <span className="font-semibold text-white">BlvckWall AI</span>
          )}
        </motion.div>
        
        {isExpanded && (
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePin}
            className="h-6 w-6 p-0"
          >
            {isPinned ? (
              <PinOff className="h-4 w-4" />
            ) : (
              <Pin className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Activity Feed */}
      <div className="px-4 mb-4">
        <ActivityFeed />
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-2">
        <div className="space-y-6">
          {navCategories.map((category) => (
            <div key={category.title}>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="px-2 mb-2"
                  >
                    <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {category.title}
                    </h3>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="space-y-1">
                {category.items.map((item) => {
                  const isActive = pathname === item.href;
                  
                  return (
                    <div key={item.href} className="relative">
                      <Link
                        href={item.href}
                        className={cn(
                          'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-900/50',
                          isActive && 'bg-gray-900 text-white',
                          !isActive && 'text-gray-400 hover:text-white',
                          item.disabled && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-600 to-blue-600 rounded-r-full"
                            initial={false}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        )}
                        
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: 'auto' }}
                              exit={{ opacity: 0, width: 0 }}
                              transition={{ duration: 0.2 }}
                              className="flex items-center justify-between flex-1 min-w-0"
                            >
                              <span className="truncate">{item.title}</span>
                              {item.badge && (
                                <Badge variant="secondary" className="text-xs ml-2">
                                  {item.badge}
                                </Badge>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-t border-gray-800">
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search navigation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-900 border-gray-700"
                />
              </div>
              
              {/* Search Results */}
              <AnimatePresence>
                {filteredItems.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute bottom-full left-0 right-0 mb-2 bg-gray-900 border border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                  >
                    {filteredItems.map((item) => (
                      <button
                        key={item.href}
                        onClick={() => handleSearchSelect(item)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-gray-800 first:rounded-t-lg last:rounded-b-lg"
                      >
                        <item.icon className="h-4 w-4 text-gray-400" />
                        <span>{item.title}</span>
                        <ChevronRight className="h-3 w-3 text-gray-400 ml-auto" />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User Account */}
      <div className="p-4 border-t border-gray-800">
        <AnimatePresence>
          {isExpanded && userEmail && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-4"
            >
              <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-900/50">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-purple-600 text-white text-xs">
                    {userEmail.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {userEmail.split('@')[0]}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {userEmail}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings & Sign Out */}
        <div className="space-y-1">
          <Link
            href="/portal/settings"
            className="group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-400 transition-all hover:bg-gray-900/50 hover:text-white"
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            <AnimatePresence>
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="truncate"
                >
                  Settings
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          
          <button
            onClick={handleSignOut}
            className="group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-400 transition-all hover:bg-gray-900/50 hover:text-white w-full"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <AnimatePresence>
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="truncate"
                >
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Feedback Widget */}
      <FeedbackWidget />
    </motion.div>
  );
}