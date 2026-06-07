import React from 'react';
import { motion } from 'motion/react';

interface Molecule {
  id: string;
  formula: string;
  name: string;
  bondType: 'single' | 'double' | 'triple';
  atoms: Array<{ type: 'hydrogen' | 'oxygen' | 'carbon' }>;
}

interface MoleculeDisplayProps {
  molecule: Molecule;
  position: { x: number; y: number };
  size?: 'small' | 'medium' | 'large';
}

const ELEMENT_COLORS = {
  hydrogen: '#a855f7', // Violet (real spectroscopic color)
  oxygen: '#22c55e',   // Green 
  carbon: '#f97316',   // Orange
};

const BOND_COLORS = {
  single: '#22c55e',   // Green
  double: '#3b82f6',   // Blue
  triple: '#8b5cf6',   // Purple
};

export function MoleculeDisplay({ molecule, position, size = 'medium' }: MoleculeDisplayProps) {
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-20 h-20'
  };

  const textSizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  const bondSize = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4',
    large: 'w-5 h-5'
  };

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
      initial={{ scale: 0, opacity: 0, rotate: -180 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ 
        duration: 1.2, 
        ease: "backOut",
        delay: 0.2
      }}
    >
      {/* Molecule Aura */}
      <motion.div
        className={`absolute ${sizeClasses[size]} bg-gradient-to-r from-yellow-400/20 to-amber-500/20 rounded-full blur-xl`}
        style={{
          transform: 'translate(-50%, -50%) scale(1.8)',
        }}
        animate={{
          scale: [1.8, 2.2, 1.8],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Main Molecule Container */}
      <div 
        className={`relative ${sizeClasses[size]} bg-gradient-to-br from-yellow-400 to-amber-600 rounded-xl flex flex-col items-center justify-center border-2 border-yellow-300/50`}
        style={{
          boxShadow: '0 0 20px rgba(251, 191, 36, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* Molecular Formula */}
        <motion.div
          className={`${textSizes[size]} font-bold text-white drop-shadow-lg`}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          {molecule.formula}
        </motion.div>

        {/* Molecule Name */}
        <motion.div
          className="text-xs text-yellow-100 font-medium drop-shadow"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.5 }}
        >
          {molecule.name.split(' ')[0]}
        </motion.div>
      </div>

      {/* Bond Type Indicator */}
      <motion.div
        className={`absolute -top-2 -right-2 ${bondSize[size]} rounded-full flex items-center justify-center text-xs font-bold border-2 border-white/50`}
        style={{
          backgroundColor: BOND_COLORS[molecule.bondType],
          color: 'white',
          boxShadow: `0 0 12px ${BOND_COLORS[molecule.bondType]}`,
        }}
        initial={{ scale: 0, rotate: 90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 1.2, duration: 0.6, ease: "backOut" }}
      >
        {molecule.bondType === 'single' ? '1' : molecule.bondType === 'double' ? '2' : '3'}
      </motion.div>

      {/* Atomic Composition Dots */}
      <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
        {molecule.atoms.slice(0, 4).map((atom, index) => (
          <motion.div
            key={index}
            className="w-2 h-2 rounded-full border border-white/50"
            style={{
              backgroundColor: ELEMENT_COLORS[atom.type],
              boxShadow: `0 0 6px ${ELEMENT_COLORS[atom.type]}`,
            }}
            initial={{ scale: 0, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 1.4 + index * 0.1, duration: 0.4 }}
          />
        ))}
        {molecule.atoms.length > 4 && (
          <motion.div
            className="w-2 h-2 rounded-full bg-gray-400 border border-white/50 flex items-center justify-center"
            initial={{ scale: 0, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.4 }}
          >
            <span className="text-xs text-white">+</span>
          </motion.div>
        )}
      </div>

      {/* Energy Sparkles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-yellow-300 rounded-full"
          style={{
            left: '50%',
            top: '50%',
          }}
          animate={{
            x: [0, (Math.cos(i * 60 * Math.PI / 180) * 40)],
            y: [0, (Math.sin(i * 60 * Math.PI / 180) * 40)],
            opacity: [1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            delay: 0.5 + i * 0.1,
            ease: "easeOut"
          }}
        />
      ))}
    </motion.div>
  );
}

// Preset molecule configurations for common compounds
export const MOLECULE_PRESETS = {
  'H₂': {
    formula: 'H₂',
    name: 'Hydrogen Gas',
    bondType: 'single' as const,
    atoms: [{ type: 'hydrogen' as const }, { type: 'hydrogen' as const }]
  },
  'O₂': {
    formula: 'O₂',
    name: 'Oxygen Gas',
    bondType: 'double' as const,
    atoms: [{ type: 'oxygen' as const }, { type: 'oxygen' as const }]
  },
  'H₂O': {
    formula: 'H₂O',
    name: 'Water',
    bondType: 'single' as const,
    atoms: [{ type: 'hydrogen' as const }, { type: 'hydrogen' as const }, { type: 'oxygen' as const }]
  },
  'CO': {
    formula: 'CO',
    name: 'Carbon Monoxide',
    bondType: 'triple' as const,
    atoms: [{ type: 'carbon' as const }, { type: 'oxygen' as const }]
  },
  'CO₂': {
    formula: 'CO₂',
    name: 'Carbon Dioxide',
    bondType: 'double' as const,
    atoms: [{ type: 'carbon' as const }, { type: 'oxygen' as const }, { type: 'oxygen' as const }]
  },
  'CH₄': {
    formula: 'CH₄',
    name: 'Methane',
    bondType: 'single' as const,
    atoms: [{ type: 'carbon' as const }, { type: 'hydrogen' as const }, { type: 'hydrogen' as const }, { type: 'hydrogen' as const }, { type: 'hydrogen' as const }]
  }
};