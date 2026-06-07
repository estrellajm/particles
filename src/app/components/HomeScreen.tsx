import React from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Settings, Play, RotateCcw } from 'lucide-react';

interface HomeScreenProps {
  onNavigate: (screen: 'home' | 'gameplay' | 'settings') => void;
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  return (
    <div className="relative size-full flex flex-col items-center justify-center p-8">
      {/* Title Logo */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="text-center mb-16"
      >
        <h1 className="text-6xl font-light tracking-wider mb-4 bg-gradient-to-r from-blue-400 via-cyan-300 to-green-400 bg-clip-text text-transparent">
          PARTICLES
        </h1>
        <motion.div
          className="h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.5, delay: 1 }}
        />
        <p className="text-gray-400 mt-4 text-lg tracking-wide">
          Explore the Universe as a Hydrogen Atom
        </p>
      </motion.div>

      {/* Menu Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="flex flex-col gap-6 w-full max-w-xs"
      >
        <Button
          onClick={() => onNavigate('gameplay')}
          className="h-14 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 border border-cyan-400/30 shadow-lg shadow-cyan-500/25 transition-all duration-300"
        >
          <Play className="mr-3 h-5 w-5" />
          Start Journey
        </Button>
        
        <Button
          onClick={() => onNavigate('gameplay')}
          variant="outline"
          className="h-14 border-gray-600 bg-gray-900/50 hover:bg-gray-800/50 text-gray-300 hover:text-white transition-all duration-300"
        >
          <RotateCcw className="mr-3 h-5 w-5" />
          Continue
        </Button>
        
        <Button
          onClick={() => onNavigate('settings')}
          variant="ghost"
          className="h-12 text-gray-400 hover:text-white hover:bg-gray-800/30 transition-all duration-300"
        >
          <Settings className="mr-3 h-4 w-4" />
          Settings
        </Button>
      </motion.div>

      {/* Floating atomic symbol */}
      <motion.div
        className="absolute top-20 right-8 opacity-20"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border border-cyan-400 rounded-full" />
          <div className="absolute inset-2 border border-blue-400 rounded-full" />
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-cyan-400 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      </motion.div>
    </div>
  );
}