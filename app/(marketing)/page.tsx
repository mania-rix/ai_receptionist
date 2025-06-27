'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function MarketingPage() {
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0E0E0E] to-[#1A1A1A] px-4 py-12 text-white">
      {/* Background elements */}
      <div className="absolute left-0 top-0 h-full w-full overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-80 w-80 rounded-full bg-purple-600/10 blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 max-w-3xl rounded-3xl border border-white/10 bg-black/20 p-12 backdrop-blur-xl"
      >
        <div className="mb-8 flex items-center justify-center">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600" />
          <h2 className="ml-4 text-2xl font-medium">BlvckWall</h2>
        </div>

        <h1 className="mb-6 text-center text-5xl font-bold tracking-tight md:text-6xl">
          BlvckWall{' '}
          <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            AI
          </span>
        </h1>

        <p className="mb-8 text-center text-lg text-gray-300">
          Harness the power of artificial intelligence to revolutionize your workflow.
          Experience seamless integration and extraordinary results.
        </p>

        <div className="flex justify-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Button
              id="enter-portal"
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6 text-lg hover:from-purple-700 hover:to-blue-700"
              onClick={() => router.push('/auth/blvckwall')}
            >
              Enter Portal <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-400">
          © 2025 BlvckWall AI. All rights reserved.
        </div>
      </motion.div>
    </div>
  );
}