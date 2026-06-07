import React from 'react';
import { motion } from 'framer-motion';
import { FloatingPanel } from './FloatingPanel';
import { Button } from './ui/button';
import { Plus, X, Zap } from 'lucide-react';

interface BondingPreviewProps {
  target: 'oxygen' | 'carbon';
  scientificMode: boolean;
  onBond: () => void;
  onCancel: () => void;
}

export function BondingPreview({ target, scientificMode, onBond, onCancel }: BondingPreviewProps) {
  const reactions = {
    oxygen: {
      formula: scientificMode ? 'H + O → H₂O' : 'Hydrogen + Oxygen → Water',
      energy: '+15',
      stability: 'High',
      color: 'from-blue-400 to-cyan-500',
    },
    carbon: {
      formula: scientificMode ? 'H + C → CH₄' : 'Hydrogen + Carbon → Methane',
      energy: '+8',
      stability: 'Medium',
      color: 'from-green-400 to-emerald-500',
    },
  };

  const reaction = reactions[target];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 50 }}
      className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-50"
    >
      <FloatingPanel className="p-4 min-w-80">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white">Bonding Opportunity</h3>
          <Button
            size="icon"
            variant="ghost"
            onClick={onCancel}
            className="w-6 h-6 text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Reaction Preview */}
        <div className="text-center mb-4">
          <div className={`text-lg bg-gradient-to-r ${reaction.color} bg-clip-text text-transparent mb-2`}>
            {reaction.formula}
          </div>
          
          {/* Visual representation */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <motion.div
              className="w-4 h-4 bg-cyan-400 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <Plus className="h-3 w-3 text-gray-400" />
            <motion.div
              className={`w-4 h-4 rounded-full bg-gradient-to-r ${reaction.color}`}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
            />
            <span className="text-gray-400 mx-2">→</span>
            <motion.div
              className="w-6 h-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-green-400 rounded-full"
              animate={{ 
                rotate: 360,
                boxShadow: ['0 0 5px currentColor', '0 0 15px currentColor', '0 0 5px currentColor']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-between text-sm text-gray-300 mb-4">
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-yellow-400" />
            <span>Energy: {reaction.energy}</span>
          </div>
          <div>Stability: {reaction.stability}</div>
        </div>

        {/* Action Button */}
        <Button
          onClick={onBond}
          className={`w-full bg-gradient-to-r ${reaction.color} hover:opacity-90 transition-opacity`}
        >
          Form Bond
        </Button>
      </FloatingPanel>
    </motion.div>
  );
}