'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DemoBannerProps {
  className?: string;
}

export function DemoBanner({ className }: DemoBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [bannerData, setBannerData] = useState({
    message: "🚀 Demo Mode - BlvckWall AI Hackathon MVP",
    type: "info",
    dismissible: true
  });

  useEffect(() => {
    console.log('[DemoBanner] Component mounted');
    fetchBannerConfig();
    
    // Check if banner was previously dismissed
    const dismissed = localStorage.getItem('demo-banner-dismissed');
    if (dismissed === 'true') {
      setIsVisible(false);
    }
  }, []);

  const fetchBannerConfig = async () => {
    try {
      const response = await fetch('/api/demo-banner');
      const data = await response.json();
      
      if (data.show) {
        setBannerData({
          message: data.message,
          type: data.type,
          dismissible: data.dismissible
        });
      } else {
        setIsVisible(false);
      }
    } catch (error) {
      console.error('[DemoBanner] Error fetching banner config:', error);
    }
  };

  const dismissBanner = () => {
    setIsVisible(false);
    localStorage.setItem('demo-banner-dismissed', 'true');
  };

  const getBannerIcon = () => {
    switch (bannerData.type) {
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'success': return <CheckCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getBannerColor = () => {
    switch (bannerData.type) {
      case 'warning': return 'bg-yellow-900/20 border-yellow-500/30 text-yellow-400';
      case 'success': return 'bg-green-900/20 border-green-500/30 text-green-400';
      default: return 'bg-blue-900/20 border-blue-500/30 text-blue-400';
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`w-full ${getBannerColor()} border-b px-4 py-2 flex items-center justify-center ${className}`}
      >
        <div className="flex items-center gap-2 text-sm">
          {getBannerIcon()}
          <span>{bannerData.message}</span>
        </div>
        
        {bannerData.dismissible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={dismissBanner}
            className="ml-4 h-6 w-6 p-0 rounded-full"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}