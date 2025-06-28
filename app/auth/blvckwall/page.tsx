'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Zap, Shield, Cpu, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useToast } from '@/hooks/use-toast';

// GlitchText Component
interface GlitchTextProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
  textClassName?: string;
  containerClassName?: string;
  colors?: {
    red: string;
    green: string;
    blue: string;
  };
}

const GlitchText = React.forwardRef<HTMLDivElement, GlitchTextProps>(
  ({
    text,
    as: Component = "h1",
    className,
    textClassName,
    containerClassName,
    colors = {
      red: "#ff0000",
      green: "#00ff00",
      blue: "#0000ff"
    },
    ...props
  }, ref) => {
    return (
      <div 
        ref={ref}
        className={cn(
          "flex items-center justify-center",
          className
        )}
        {...props}
      >
        <div className={cn(
          "relative",
          containerClassName
        )}>
          <motion.div
            className={cn(
              "text-4xl font-bold absolute",
              "mix-blend-multiply dark:mix-blend-screen",
              textClassName
            )}
            animate={{
              x: [-2, 2, -2],
              y: [0, -1, 1],
              skew: [0, -2, 2],
              opacity: [1, 0.8, 0.9],
              color: [colors.red, colors.red, colors.red]
            }}
            transition={{
              duration: 0.15,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "anticipate"
            }}
          >
            {text}
          </motion.div>
          <motion.div
            className={cn(
              "text-4xl font-bold absolute",
              "mix-blend-multiply dark:mix-blend-screen",
              textClassName
            )}
            animate={{
              x: [2, -2, 2],
              y: [1, -1, 0],
              skew: [-2, 2, 0],
              opacity: [0.9, 1, 0.8],
              color: [colors.green, colors.green, colors.green]
            }}
            transition={{
              duration: 0.13,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "anticipate"
            }}
          >
            {text}
          </motion.div>
          <motion.div
            className={cn(
              "text-4xl font-bold",
              "mix-blend-multiply dark:mix-blend-screen",
              textClassName
            )}
            animate={{
              x: [-1, 1, -1],
              y: [-1, 1, 0],
              skew: [2, -2, 0],
              opacity: [0.8, 0.9, 1],
              color: [colors.blue, colors.blue, colors.blue]
            }}
            transition={{
              duration: 0.11,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "anticipate"
            }}
          >
            {text}
          </motion.div>
        </div>
      </div>
    )
  }
);
GlitchText.displayName = "GlitchText";

// Matrix Background Component
interface MatrixBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  isDarkMode: boolean;
}

interface Character {
  char: string;
  opacity: number;
}

interface Strand {
  x: number;
  y: number;
  speed: number;
  length: number;
  characters: Character[];
  showCursor: boolean;
  layer: number;
  scale: number;
}

const MatrixBackground = ({ children, className, isDarkMode }: MatrixBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const strands = useRef<Strand[]>([]);
  const lastTime = useRef<number>(0);
  const cursorBlinkTime = useRef<number>(0);
  
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()_+-=[]{}|;:,./<>?';
  const fontSize = 12;
  const speed = 0.3;
  const density = 0.8;
  const textColor = isDarkMode ? '#00FF41' : '#008000'; // Green for dark, darker green for light
  const bgColor = isDarkMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'; // Black for dark, white for light
  
  const getRandomChar = () => {
    return characters.charAt(Math.floor(Math.random() * characters.length));
  };

  const createStrand = (x: number, canvasHeight: number) => {
    const layer = Math.floor(Math.random() * 3);
    const scale = layer === 0 ? 0.8 : layer === 1 ? 1 : 1.2;
    const length = Math.floor(Math.random() * 15) + 15;
    
    const chars: Character[] = Array(length).fill(null).map(() => ({
      char: getRandomChar(),
      opacity: 1
    }));

    return {
      x,
      y: -length * (fontSize * scale),
      speed: (Math.random() * 0.3 + 0.7) * speed * fontSize * (layer === 2 ? 1.2 : layer === 1 ? 1 : 0.8),
      length,
      characters: chars,
      showCursor: true,
      layer,
      scale
    };
  };

  const updateStrands = (ctx: CanvasRenderingContext2D, width: number, height: number, deltaTime: number) => {
    const spacing = fontSize * 1.5;
    const maxStrands = Math.floor(width / spacing) * density * 1.5;
    
    if (strands.current.length < maxStrands) {
      const availableSlots = Array.from({ length: Math.floor(width / spacing) })
        .map((_, i) => i * spacing)
        .filter(x => !strands.current.some(strand => strand.x === x));
      
      if (availableSlots.length > 0 && Math.random() < 0.1 * density) {
        const x = availableSlots[Math.floor(Math.random() * availableSlots.length)];
        strands.current.push(createStrand(x, height));
      }
    }
    
    cursorBlinkTime.current += deltaTime;
    if (cursorBlinkTime.current >= 500) {
      strands.current.forEach(strand => {
        strand.showCursor = !strand.showCursor;
      });
      cursorBlinkTime.current = 0;
    }
    
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
    
    strands.current.sort((a, b) => a.layer - b.layer);
    
    strands.current = strands.current.filter(strand => {
      strand.y += strand.speed * deltaTime * 0.05;
      
      const baseOpacity = strand.layer === 0 ? 0.1 : strand.layer === 1 ? 0.2 : 0.3;
      const blur = strand.layer === 0 ? 1 : strand.layer === 1 ? 2 : 3;
      
      const scaledFontSize = fontSize * strand.scale;
      ctx.font = `${scaledFontSize}px monospace`;
      ctx.shadowBlur = blur;
      ctx.shadowColor = textColor;

      strand.characters.forEach((char, i) => {
        const y = strand.y + (i * scaledFontSize);
        
        if (y > -scaledFontSize && y < height + scaledFontSize) {
          ctx.fillStyle = textColor;
          ctx.globalAlpha = baseOpacity;
          ctx.fillText(char.char, strand.x, y);
        }
      });

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      if (Math.random() < 0.02) {
        const randomIndex = Math.floor(Math.random() * strand.characters.length);
        strand.characters[randomIndex].char = getRandomChar();
      }

      return strand.y - (strand.length * (fontSize * strand.scale)) < height;
    });
  };
  
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  
  const animate = (time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const deltaTime = time - lastTime.current;
    lastTime.current = time;
    
    updateStrands(ctx, canvas.width, canvas.height, deltaTime);
    
    animationFrameId.current = requestAnimationFrame(animate);
  };
  
  useEffect(() => {
    resizeCanvas();
    lastTime.current = performance.now();
    cursorBlinkTime.current = 0;
    animationFrameId.current = requestAnimationFrame(animate);
    
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isDarkMode]); // Re-run effect when isDarkMode changes to update colors

  return (
    <div className={cn("relative w-full h-screen overflow-hidden", isDarkMode ? "bg-black" : "bg-white", className)}>
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-20"
      />
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  onClear?: () => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, success, onClear, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [value, setValue] = useState(props.value || props.defaultValue || "");
    const inputRef = useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => inputRef.current!);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-foreground/90" htmlFor={props.id}>
            {label}
          </label>
        )}

        <div className="relative">
          <input
            type={type}
            className={cn(
              "w-full px-3 py-2 rounded-lg",
              "bg-background/20 backdrop-blur-sm",
              "border border-border/20",
              "text-foreground",
              "placeholder:text-muted-foreground",
              "transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error && "border-red-500/50 focus:border-red-500 focus:ring-red-500/30",
              className,
            )}
            ref={inputRef}
            onChange={(e) => {
              setValue(e.target.value);
              props.onChange?.(e);
            }}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            value={value}
            {...props}
          />
        </div>
        
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-400"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

// Main Component
const BlvckwallAuth = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { toast } = useToast();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true); 
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // 3D card effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [8, -8]);
  const rotateY = useTransform(mouseX, [-300, 300], [-8, 8]);

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/portal/overview');
      }
    };
    checkUser();
  }, [router]);

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/portal/overview');
      }
    };
    checkUser();
  }, [router]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (isSignUp) {
      if (!firstName) {
        newErrors.firstName = "First name is required";
      }
      if (!lastName) {
        newErrors.lastName = "Last name is required";
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    const newErrors: {[key: string]: string} = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (isSignUp) {
      if (!firstName) {
        newErrors.firstName = "First name is required";
      }
      if (!lastName) {
        newErrors.lastName = "Last name is required";
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              firstName,
              lastName,
              name: `${firstName} ${lastName}`,
            }
          }
        });

        if (error) throw error;

        if (data.user && !data.session) {
          toast({
            title: "Check your email",
            description: "We've sent you a confirmation link to complete your registration.",
          });
        } else {
          toast({
            title: "Account created successfully",
            description: "Welcome to BlvckWall AI!",
          });
          router.push('/portal/overview');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back",
          description: "Successfully signed in to BlvckWall AI.",
        });
        router.push('/portal/overview');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      let errorMessage = "An unexpected error occurred";
      
      if (error.message?.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password";
      } else if (error.message?.includes("User already registered")) {
        errorMessage = "An account with this email already exists";
      } else if (error.message?.includes("Password should be at least")) {
        errorMessage = "Password must be at least 6 characters long";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setErrors({ general: errorMessage });
      toast({
        title: "Authentication failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              firstName,
              lastName,
              name: `${firstName} ${lastName}`,
            }
          }
        });

        if (error) throw error;

        if (data.user && !data.session) {
          toast({
            title: "Check your email",
            description: "We've sent you a confirmation link to complete your registration.",
          });
        } else {
          toast({
            title: "Account created successfully",
            description: "Welcome to BlvckWall AI!",
          });
          router.push('/portal/overview');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back",
          description: "Successfully signed in to BlvckWall AI.",
        });
        router.push('/portal/overview');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      let errorMessage = "An unexpected error occurred";
      
      if (error.message?.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password";
      } else if (error.message?.includes("User already registered")) {
        errorMessage = "An account with this email already exists";
      } else if (error.message?.includes("Password should be at least")) {
        errorMessage = "Password must be at least 6 characters long";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setErrors({ general: errorMessage });
      toast({
        title: "Authentication failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <MatrixBackground isDarkMode={isDarkMode}>
      <div className={cn("min-h-screen w-full flex items-center justify-center relative overflow-hidden", isDarkMode ? "dark" : "light")}>
        {/* Cyber grid background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" 
            style={{
              backgroundImage: `
                linear-gradient(${isDarkMode ? 'rgba(0, 255, 255, 0.1)' : 'rgba(0, 128, 128, 0.1)'} 1px, transparent 1px),
                linear-gradient(90deg, ${isDarkMode ? 'rgba(0, 255, 255, 0.1)' : 'rgba(0, 128, 128, 0.1)'} 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className={cn("absolute w-1 h-1 rounded-full", isDarkMode ? "bg-cyan-400/30" : "bg-teal-600/30")}
              animate={{
                x: [Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000)],
                y: [Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000), Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000)],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 5,
              }}
              style={{
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
              }}
            />
          ))}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={cn(
            "absolute top-4 right-4 p-2 rounded-full transition-colors duration-300",
            "bg-background/50 text-foreground/80 hover:text-primary hover:bg-primary/10",
            "border border-border/50"
          )}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md relative z-10"
          style={{ perspective: 1500 }}
        >
          <motion.div
            className="relative"
            style={{ rotateX, rotateY }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            whileHover={{ z: 10 }}
          >
            <div className="relative group">
              {/* Holographic border effect */}
              <div className="absolute -inset-1 rounded-2xl overflow-hidden">
                <motion.div 
                  className={cn(
                    "absolute inset-0",
                    isDarkMode 
                      ? "bg-gradient-to-r from-cyan-400/20 via-purple-500/20 to-cyan-400/20"
                      : "bg-gradient-to-r from-teal-400/20 via-indigo-500/20 to-teal-400/20"
                  )}
                  animate={{ 
                    rotate: [0, 360],
                  }}
                  transition={{ 
                    duration: 8, 
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              </div>

              {/* Scanning line effect */}
              <motion.div 
                className={cn(
                  "absolute top-0 left-0 right-0 h-0.5",
                  isDarkMode 
                    ? "bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                    : "bg-gradient-to-r from-transparent via-teal-400 to-transparent"
                )}
                animate={{ 
                  y: [0, 400, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Main card */}
              <div className={cn(
                "relative backdrop-blur-xl rounded-2xl p-8 shadow-2xl overflow-hidden",
                isDarkMode ? "bg-black/80 border border-cyan-500/20" : "bg-white/80 border border-teal-500/20"
              )}>
                {/* Circuit pattern overlay */}
                <div className={cn("absolute inset-0 opacity-5", isDarkMode ? "text-cyan-500" : "text-teal-500")}>
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <defs>
                      <pattern id="circuit" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M0 10h5v-5h5v5h5v5h-5v5h-5v-5h-5z" fill="currentColor" stroke="currentColor" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#circuit)" />
                  </svg>
                </div>

                {/* Logo and header */}
                <div className="text-center space-y-4 mb-8">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", duration: 0.8 }}
                    className="mx-auto w-16 h-16 relative"
                  >
                    {/* Animated logo */}
                    <div className={cn(
                      "w-full h-full border-2 rounded-lg flex items-center justify-center relative overflow-hidden",
                      isDarkMode ? "border-cyan-400" : "border-teal-400"
                    )}>
                      <motion.div
                        className={cn(
                          "absolute inset-0",
                          isDarkMode 
                            ? "bg-gradient-to-br from-cyan-400/20 to-purple-500/20"
                            : "bg-gradient-to-br from-teal-400/20 to-indigo-500/20"
                        )}
                        animate={{ 
                          scale: [1, 1.1, 1],
                          opacity: [0.5, 0.8, 0.5]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      <GlitchText 
                        text="BW" 
                        textClassName="text-xl font-black"
                        colors={isDarkMode ? {
                          red: "#ff0080",
                          green: "#00ffff",
                          blue: "#8000ff"
                        } : {
                          red: "#ff4080",
                          green: "#00ccff",
                          blue: "#8040ff"
                        }}
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <GlitchText 
                      text="BLVCKWALL" 
                      textClassName="text-2xl font-black tracking-wider"
                      colors={isDarkMode ? {
                        red: "#ff0080",
                        green: "#00ffff", 
                        blue: "#8000ff"
                      } : {
                        red: "#ff4080",
                        green: "#00ccff",
                        blue: "#8040ff"
                      }}
                    />
                  </motion.div>
                  
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className={cn("text-sm flex items-center justify-center gap-2", isDarkMode ? "text-cyan-400/80" : "text-teal-600/80")}
                  >
                    <Shield className="w-4 h-4" />
                    {isSignUp ? 'Join the Network' : 'Access the System'}
                    <Cpu className="w-4 h-4" />
                  </motion.p>
                </div>

                {/* General error message */}
                {errors.general && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
                  >
                    {errors.general}
                  </motion.div>
                )}

                {/* Auth toggle */}
                <div className={cn( 
                  "flex mb-6 rounded-lg p-1",
                  isDarkMode ? "bg-black/40 border border-cyan-500/20" : "bg-white/40 border border-teal-500/20"
                )}>
                  <button
                    type="button"
                    onClick={() => setIsSignUp(false)}
                    className={cn(
                      "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 relative overflow-hidden",
                      !isSignUp 
                        ? (isDarkMode ? "bg-cyan-500/20 text-cyan-100 border border-cyan-500/30" : "bg-teal-500/20 text-teal-900 border border-teal-500/30") 
                        : (isDarkMode ? "text-cyan-400/60 hover:text-cyan-400" : "text-teal-600/60 hover:text-teal-600")
                    )}
                  >
                    {!isSignUp && (
                      <motion.div 
                        layoutId="auth-bg"
                        className={cn(
                          "absolute inset-0",
                          isDarkMode 
                            ? "bg-gradient-to-r from-cyan-500/10 to-purple-500/10"
                            : "bg-gradient-to-r from-teal-500/10 to-indigo-500/10"
                        )}
                        transition={{ type: "spring", duration: 0.5 }}
                      />
                    )}
                    <span className="relative z-10">Sign In</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    className={cn(
                      "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 relative overflow-hidden",
                      isSignUp 
                        ? (isDarkMode ? "bg-cyan-500/20 text-cyan-100 border border-cyan-500/30" : "bg-teal-500/20 text-teal-900 border border-teal-500/30") 
                        : (isDarkMode ? "text-cyan-400/60 hover:text-cyan-400" : "text-teal-600/60 hover:text-teal-600")
                    )}
                  >
                    {isSignUp && (
                      <motion.div 
                        layoutId="auth-bg"
                        className={cn(
                          "absolute inset-0",
                          isDarkMode 
                            ? "bg-gradient-to-r from-cyan-500/10 to-purple-500/10"
                            : "bg-gradient-to-r from-teal-500/10 to-indigo-500/10"
                        )}
                        transition={{ type: "spring", duration: 0.5 }}
                      />
                    )}
                    <span className="relative z-10">Sign Up</span>
                  </button>
                </div>

                {/* General error message */}
                {errors.general && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
                  >
                    {errors.general}
                  </motion.div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isSignUp ? 'signup' : 'signin'}
                      initial={{ opacity: 0, x: isSignUp ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: isSignUp ? -20 : 20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      {isSignUp && (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="relative">
                            <User className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4", isDarkMode ? "text-cyan-400/60" : "text-teal-600/60")} />
                            <Input
                              type="text"
                              placeholder="First Name"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              className="pl-10"
                              onFocus={() => setFocusedInput("firstName")}
                              onBlur={() => setFocusedInput(null)}
                              error={errors.firstName}
                              error={errors.firstName}
                            />
                          </div>
                          <div className="relative">
                            <User className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4", isDarkMode ? "text-cyan-400/60" : "text-teal-600/60")} />
                            <Input
                              type="text"
                              placeholder="Last Name"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              className="pl-10"
                              onFocus={() => setFocusedInput("lastName")}
                              onBlur={() => setFocusedInput(null)}
                              error={errors.lastName}
                              error={errors.lastName}
                            />
                          </div>
                        </div>
                      )}

                      <div className="relative">
                        <Mail className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4", isDarkMode ? "text-cyan-400/60" : "text-teal-600/60")} />
                        <Input
                          type="email"
                          placeholder="Email Address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          onFocus={() => setFocusedInput("email")}
                          onBlur={() => setFocusedInput(null)}
                          error={errors.email}
                          error={errors.email}
                        />
                      </div>

                      <div className="relative">
                        <Lock className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4", isDarkMode ? "text-cyan-400/60" : "text-teal-600/60")} />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10"
                          onFocus={() => setFocusedInput("password")}
                          onBlur={() => setFocusedInput(null)}
                          error={errors.password}
                          error={errors.password}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className={cn("absolute right-3 top-1/2 -translate-y-1/2 hover:text-primary transition-colors", isDarkMode ? "text-cyan-400/60" : "text-teal-600/60")}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {isSignUp && (
                        <div className="relative">
                          <Lock className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4", isDarkMode ? "text-cyan-400/60" : "text-teal-600/60")} />
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-10 pr-10"
                            onFocus={() => setFocusedInput("confirmPassword")}
                            onBlur={() => setFocusedInput(null)}
                            error={errors.confirmPassword}
                            error={errors.confirmPassword}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className={cn("absolute right-3 top-1/2 -translate-y-1/2 hover:text-primary transition-colors", isDarkMode ? "text-cyan-400/60" : "text-teal-600/60")}
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Submit button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full relative group mt-6"
                  >
                    <div className={cn(
                      "absolute inset-0 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                      isDarkMode 
                        ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20"
                        : "bg-gradient-to-r from-teal-500/20 to-indigo-500/20"
                    )} />
                    
                    <div className={cn(
                      "relative overflow-hidden font-bold h-12 rounded-lg transition-all duration-300 flex items-center justify-center",
                      isDarkMode 
                        ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-black border border-cyan-400/30"
                        : "bg-gradient-to-r from-teal-500 to-indigo-500 text-white border border-teal-400/30"
                    )}>
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                        animate={{ 
                          x: ['-100%', '100%'],
                        }}
                        transition={{ 
                          duration: 1.5, 
                          ease: "easeInOut", 
                          repeat: Infinity,
                          repeatDelay: 2
                        }}
                      />
                      
                      <AnimatePresence mode="wait">
                        {isLoading ? (
                          <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center justify-center gap-2"
                          >
                            <div className={cn("w-5 h-5 border-2 rounded-full animate-spin", isDarkMode ? "border-black/70 border-t-transparent" : "border-white/70 border-t-transparent")} />
                            <span>Processing...</span>
                          </motion.div>
                        ) : (
                          <motion.span
                            key="button-text"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center justify-center gap-2"
                          >
                            <Zap className="w-4 h-4" />
                            {isSignUp ? 'Initialize Account' : 'Access System'}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.button>

                  {/* Footer text */}
                  <motion.p 
                    className={cn("text-center text-xs mt-6", isDarkMode ? "text-cyan-400/60" : "text-teal-600/60")}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }} 
                  >
                    {isSignUp ? (
                      <>Already have access? <button type="button" onClick={() => setIsSignUp(false)} className={cn("font-medium", isDarkMode ? "text-cyan-400 hover:text-cyan-300" : "text-teal-600 hover:text-teal-500")}>Sign In</button></>
                    ) : (
                      <>Need access? <button type="button" onClick={() => setIsSignUp(true)} className={cn("font-medium", isDarkMode ? "text-cyan-400 hover:text-cyan-300" : "text-teal-600 hover:text-teal-500")}>Create Account</button></>
                    )}
                  </motion.p>
                </form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </MatrixBackground>
  );
};

export default BlvckwallAuth;