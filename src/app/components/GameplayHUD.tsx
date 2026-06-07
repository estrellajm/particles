import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Battery, Zap, Settings, Home, BookOpen, Atom } from 'lucide-react';
import { GameEngine } from './GameEngine';
import { FloatingPanel } from './FloatingPanel';
import { TutorialOverlay } from './TutorialOverlay';
import { SpectroscopicScanner } from './SpectroscopicScanner';

type GameScreen = 'home' | 'gameplay' | 'settings';

interface GameplayHUDProps {
  onNavigate: (screen: GameScreen) => void;
  scientificMode: boolean;
}

interface MoleculeFormation {
  id: string;
  name: string;
  formula: string;
  timestamp: number;
}

export function GameplayHUD({ onNavigate, scientificMode }: GameplayHUDProps) {
  const [energy, setEnergy] = useState(87);
  const [molecules, setMolecules] = useState<MoleculeFormation[]>([]);
  const [recentMolecule, setRecentMolecule] = useState<MoleculeFormation | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [bondingTip, setBondingTip] = useState('');
  const [nearbyElements, setNearbyElements] = useState<string[]>(['hydrogen']);

  // Handle molecule formation
  const handleMoleculeFormed = (moleculeName: string) => {
    const formulas: Record<string, string> = {
      'Hydrogen Gas': 'H₂',
      'Oxygen Gas': 'O₂',
      'Water': 'H₂O',
      'Carbon Monoxide': 'CO',
      'Carbon Dioxide': 'CO₂',
      'Methane': 'CH₄',
      'Ethane': 'C₂H₆',
      'Ethene': 'C₂H₄',
      'Ethyne': 'C₂H₂',
      'Formaldehyde': 'CH₂O',
      'Ethanol': 'C₂H₆O',
      'Acetic Acid': 'C₂H₄O₂',
    };

    const newMolecule: MoleculeFormation = {
      id: `mol_${Date.now()}`,
      name: moleculeName,
      formula: formulas[moleculeName] || moleculeName,
      timestamp: Date.now()
    };

    setMolecules(prev => [...prev, newMolecule]);
    setRecentMolecule(newMolecule);

    // Clear recent molecule notification after 3 seconds
    setTimeout(() => setRecentMolecule(null), 3000);

    // Increase energy when molecules are formed
    setEnergy(prev => Math.min(100, prev + 15));
  };

  // Handle drag state changes for tutorial
  const handleDragStateChange = (dragging: boolean) => {
    setIsDragging(dragging);
    if (dragging && showTutorial) {
      setShowTutorial(false);
    }
  };

  // Update bonding tips based on proximity
  useEffect(() => {
    const tips = [
      "Bring atoms close together to form molecular bonds!",
      "H + H = Hydrogen Gas (H₂)",
      "O + O = Oxygen Gas (O₂)", 
      "H + H + O = Water (H₂O)",
      "C + O = Carbon Monoxide (CO)",
      "C + H + H + H + H = Methane (CH₄)"
    ];
    
    const interval = setInterval(() => {
      setBondingTip(tips[Math.floor(Math.random() * tips.length)]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative size-full overflow-hidden">
      {/* Game Engine */}
      <GameEngine
        scientificMode={scientificMode}
        onEnergyChange={setEnergy}
        onMoleculeFormed={handleMoleculeFormed}
        onDragStateChange={handleDragStateChange}
        onNearbyElementsChange={setNearbyElements}
      >
        {/* Top HUD */}
        <div className="absolute top-0 left-0 right-0 z-30 p-4 pointer-events-none">
          <div className="flex justify-between items-start">
            {/* Energy Display */}
            <FloatingPanel className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 pointer-events-auto">
              <div className="flex items-center space-x-3 p-3">
                <div className="relative">
                  <Battery className="w-6 h-6 text-cyan-400" />
                  <motion.div
                    className="absolute inset-0 bg-cyan-400 rounded opacity-30"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-cyan-100">Energy</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-white">{Math.round(energy)}%</span>
                    <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                        animate={{ width: `${energy}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </FloatingPanel>

            {/* Molecule Counter - Positioned to avoid overlap with scanner */}
            <div className="mr-20">
              <FloatingPanel className="bg-black/40 backdrop-blur-sm border border-purple-500/30 pointer-events-auto">
                <div className="flex items-center space-x-3 p-3">
                  <div className="relative">
                    <Atom className="w-6 h-6 text-purple-400" />
                    <motion.div
                      className="absolute inset-0 bg-purple-400 rounded opacity-30"
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-purple-100">Molecules</span>
                    <span className="text-lg font-bold text-white">{molecules.length}</span>
                  </div>
                </div>
              </FloatingPanel>
            </div>
          </div>
        </div>

        {/* Recent Molecule Formation Notification */}
        <AnimatePresence>
          {recentMolecule && (
            <motion.div
              className="absolute top-20 left-1/2 transform -translate-x-1/2 z-40"
              initial={{ opacity: 0, scale: 0.5, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: -20 }}
              transition={{ duration: 0.6, ease: "backOut" }}
            >
              <FloatingPanel className="bg-gradient-to-r from-yellow-500/20 to-amber-600/20 backdrop-blur-sm border border-yellow-400/50 pointer-events-auto">
                <div className="flex items-center space-x-3 p-4">
                  <motion.div
                    className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, ease: "linear" }}
                    style={{ boxShadow: '0 0 15px #fbbf24' }}
                  >
                    <Zap className="w-4 h-4 text-white" />
                  </motion.div>
                  <div className="flex flex-col">
                    <span className="text-sm text-yellow-100">Molecule Formed!</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-white">{recentMolecule.formula}</span>
                      <span className="text-sm text-yellow-200">({recentMolecule.name})</span>
                    </div>
                  </div>
                </div>
              </FloatingPanel>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bonding Tip */}
        <AnimatePresence>
          {!isDragging && bondingTip && (
            <motion.div
              className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
            >
              <FloatingPanel className="bg-black/50 backdrop-blur-sm border border-blue-500/30 pointer-events-auto">
                <div className="flex items-center space-x-3 p-3 max-w-xs">
                  <Atom className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <span className="text-sm text-blue-100">{bondingTip}</span>
                </div>
              </FloatingPanel>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 z-30 p-4 pointer-events-none">
          <div className="flex justify-between items-end">
            {/* Navigation Controls */}
            <div className="flex space-x-3">
              <FloatingPanel 
                className="bg-black/40 backdrop-blur-sm border border-gray-500/30 cursor-pointer hover:border-gray-400/50 transition-colors pointer-events-auto"
                onClick={() => onNavigate('home')}
              >
                <div className="p-3">
                  <Home className="w-6 h-6 text-gray-300" />
                </div>
              </FloatingPanel>

              <FloatingPanel 
                className="bg-black/40 backdrop-blur-sm border border-gray-500/30 cursor-pointer hover:border-gray-400/50 transition-colors pointer-events-auto"
                onClick={() => onNavigate('settings')}
              >
                <div className="p-3">
                  <Settings className="w-6 h-6 text-gray-300" />
                </div>
              </FloatingPanel>
            </div>

            {/* Molecule Log Button */}
            <FloatingPanel 
              className="bg-black/40 backdrop-blur-sm border border-green-500/30 cursor-pointer hover:border-green-400/50 transition-colors pointer-events-auto"
            >
              <div className="flex items-center space-x-2 p-3">
                <BookOpen className="w-5 h-5 text-green-400" />
                <span className="text-sm text-green-100">Molecule Log</span>
                {molecules.length > 0 && (
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">{molecules.length}</span>
                  </div>
                )}
              </div>
            </FloatingPanel>
          </div>
        </div>

        {/* Tutorial Overlay */}
        {showTutorial && (
          <div className="pointer-events-none">
            <TutorialOverlay 
              message="Drag anywhere to move your hydrogen atom around the space. Bring atoms close together to form molecular bonds!"
            />
          </div>
        )}

        {/* Spectroscopic Scanner */}
        <div className="pointer-events-auto">
          <SpectroscopicScanner nearbyElements={nearbyElements} />
        </div>
        

      </GameEngine>
    </div>
  );
}