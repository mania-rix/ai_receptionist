'use client';

import { useState, useCallback, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  className?: string;
  variant?: 'default' | 'glassmorphism';
}

export function SearchBar({ 
  placeholder = "Search...", 
  onSearch, 
  onClear,
  className,
  variant = 'glassmorphism'
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    onSearch?.(value);
  }, [onSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    onClear?.();
  }, [onClear]);

  const searchBarClasses = useMemo(() => {
    const baseClasses = "relative group transition-all duration-200";
    
    if (variant === 'glassmorphism') {
      return cn(
        baseClasses,
        "backdrop-blur-md bg-white/5 border border-white/10 rounded-lg",
        "hover:bg-white/10 hover:border-white/20",
        "focus-within:bg-white/10 focus-within:border-white/30 focus-within:shadow-lg",
        className
      );
    }
    
    return cn(baseClasses, className);
  }, [variant, className]);

  const inputClasses = useMemo(() => {
    if (variant === 'glassmorphism') {
      return cn(
        "bg-transparent border-0 text-white placeholder:text-white/60",
        "focus:ring-0 focus:outline-none",
        "pl-10 pr-10 py-2.5 text-sm"
      );
    }
    
    return "pl-10 pr-10 py-2.5 text-sm";
  }, [variant]);

  return (
    <div className={searchBarClasses}>
      <div className="relative">
        <Search 
          className={cn(
            "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors",
            variant === 'glassmorphism' 
              ? "text-white/60 group-focus-within:text-white/80" 
              : "text-gray-400 group-focus-within:text-gray-600"
          )} 
        />
        
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={inputClasses}
        />
        
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className={cn(
              "absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0",
              "hover:bg-white/10 rounded-full transition-colors",
              variant === 'glassmorphism' ? "text-white/60 hover:text-white" : ""
            )}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      {/* Focus ring effect for glassmorphism */}
      {variant === 'glassmorphism' && isFocused && (
        <div className="absolute inset-0 rounded-lg ring-2 ring-white/20 ring-offset-2 ring-offset-transparent pointer-events-none" />
      )}
    </div>
  );
}