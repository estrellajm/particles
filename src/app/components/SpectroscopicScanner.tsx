import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Zap } from 'lucide-react';
import { FloatingPanel } from './FloatingPanel';

interface AtomicStructure {
  element: string;
  name: string;
  symbol: string;
  protons: number;
  neutrons: number;
  electrons: number;
  charge: number;
  bonding_state: string;
  temperature: number;
  state: string;
  atomic_weights: number[];
  average_atomic_mass: number;
  electron_configuration: string;
  crystal_structure: string;
  category: string;
  electronsShells: number[];
  color: string;
  description: string;
}

const ATOMIC_DATA: Record<string, AtomicStructure> = {
  hydrogen: {
    element: "H",
    name: "Hydrogen",
    symbol: "H",
    protons: 1,
    neutrons: 0,
    electrons: 1,
    charge: 0,
    bonding_state: "unbonded",
    temperature: 298,
    state: "gas",
    atomic_weights: [1.00784, 1.00811],
    average_atomic_mass: 1.00794,
    electron_configuration: "1s1",
    crystal_structure: "hexagonal",
    category: "nonmetal",
    electronsShells: [1],
    color: '#a855f7',
    description: 'The lightest and most abundant element in the universe'
  },
  carbon: {
    element: "C",
    name: "Carbon",
    symbol: "C",
    protons: 6,
    neutrons: 6,
    electrons: 6,
    charge: 0,
    bonding_state: "unbonded",
    temperature: 298,
    state: "solid",
    atomic_weights: [12.0096, 12.0116],
    average_atomic_mass: 12.011,
    electron_configuration: "1s2 2s2 2p2",
    crystal_structure: "diamond cubic",
    category: "nonmetal",
    electronsShells: [2, 4],
    color: '#f97316',
    description: 'Essential element for all known life forms'
  },
  oxygen: {
    element: "O",
    name: "Oxygen",
    symbol: "O",
    protons: 8,
    neutrons: 8,
    electrons: 8,
    charge: 0,
    bonding_state: "unbonded",
    temperature: 298,
    state: "gas",
    atomic_weights: [15.9949, 15.9991],
    average_atomic_mass: 15.999,
    electron_configuration: "1s2 2s2 2p4",
    crystal_structure: "cubic",
    category: "nonmetal",
    electronsShells: [2, 6],
    color: '#22c55e',
    description: 'Vital for combustion and respiration processes'
  }
};

interface SpectroscopicScannerProps {
  nearbyElements: string[];
  onClose?: () => void;
}

export function SpectroscopicScanner({ nearbyElements, onClose }: SpectroscopicScannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleScannerClick = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setIsOpen(true);
    }, 1000);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedElement(null);
  };

  const renderAtomicStructure = (atomData: AtomicStructure) => {
    const electrons = atomData.electrons;
    const isHydrogen = atomData.symbol === 'H';
    
    return (
      <div className="relative w-80 h-80 mx-auto">
        {/* Electron Shells */}
        {!isHydrogen && (
          <>
            {/* Outer shell */}
            <div 
              className="absolute inset-8 rounded-full border-2 opacity-30"
              style={{ borderColor: atomData.color }}
            />
            {/* Inner shell */}
            <div 
              className="absolute inset-16 rounded-full border-2 opacity-50"
              style={{ borderColor: atomData.color }}
            />
          </>
        )}

        {/* Single shell for Hydrogen */}
        {isHydrogen && (
          <div 
            className="absolute inset-4 rounded-full border-2 opacity-40"
            style={{ borderColor: atomData.color }}
          />
        )}

        {/* Nucleus */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="relative w-16 h-16 rounded-full flex items-center justify-center"
            style={{ 
              background: `radial-gradient(circle, ${atomData.color}aa, ${atomData.color}ff)`,
              boxShadow: `0 0 20px ${atomData.color}`
            }}
            animate={{ 
              scale: [1, 1.1, 1],
              boxShadow: [`0 0 20px ${atomData.color}`, `0 0 40px ${atomData.color}`, `0 0 20px ${atomData.color}`]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {/* Protons and Neutrons in nucleus */}
            <div className="grid grid-cols-3 gap-0.5">
              {Array.from({ length: Math.min(9, atomData.protons + atomData.neutrons) }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${
                    i < atomData.protons ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                  style={{
                    boxShadow: i < atomData.protons ? '0 0 4px #ef4444' : '0 0 4px #3b82f6'
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Orbiting Electrons */}
        {Array.from({ length: electrons }).map((_, i) => {
          const shell = isHydrogen ? 0 : (i < 2 ? 0 : 1);
          const radius = isHydrogen ? 140 : (shell === 0 ? 100 : 140);
          const angle = (i * 360) / (shell === 0 ? Math.min(2, electrons) : Math.max(1, electrons - 2));
          const speed = 3 + shell;

          return (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-green-400 rounded-full"
              style={{
                left: '50%',
                top: '50%',
                marginLeft: '-6px',
                marginTop: '-6px',
                boxShadow: '0 0 8px #22c55e'
              }}
              animate={{
                x: [
                  Math.cos((angle * Math.PI) / 180) * radius,
                  Math.cos(((angle + 90) * Math.PI) / 180) * radius,
                  Math.cos(((angle + 180) * Math.PI) / 180) * radius,
                  Math.cos(((angle + 270) * Math.PI) / 180) * radius,
                  Math.cos((angle * Math.PI) / 180) * radius,
                ],
                y: [
                  Math.sin((angle * Math.PI) / 180) * radius,
                  Math.sin(((angle + 90) * Math.PI) / 180) * radius,
                  Math.sin(((angle + 180) * Math.PI) / 180) * radius,
                  Math.sin(((angle + 270) * Math.PI) / 180) * radius,
                  Math.sin((angle * Math.PI) / 180) * radius,
                ],
              }}
              transition={{
                duration: speed,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          );
        })}
      </div>
    );
  };

  const currentElement = nearbyElements[0] || 'hydrogen';

  // Get electron shell configuration from atomic data
  const electronShells = ATOMIC_DATA[currentElement]?.electronsShells || [1];
  const totalShells = electronShells.length;

  return (
    <>
      {/* Small Scanner Interface - Top Right */}
      <motion.div 
        className="fixed top-4 right-4 z-40"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6, ease: "backOut" }}
      >
        <FloatingPanel 
          className="bg-black/60 backdrop-blur-sm border border-green-500/40 cursor-pointer hover:border-green-400/60 transition-colors"
          onClick={handleScannerClick}
        >
          <div className="relative p-2">
            {/* Dynamic Targeting Circles Based on Electron Configuration */}
            <div className="relative w-12 h-12">
              {/* Generate rings based on electron shells */}
              {electronShells.map((electronsInShell, shellIndex) => {
                const isOuterShell = shellIndex === electronShells.length - 1;
                const shellInset = shellIndex * 1.5; // Spacing between shells
                const rotationSpeed = 15 - (shellIndex * 3); // Outer shells rotate slower
                const scanningSpeed = 0.8 + (shellIndex * 0.2); // Different scanning speeds
                const opacity = 0.4 + (shellIndex * 0.2); // Outer shells more visible

                return (
                  <motion.div
                    key={shellIndex}
                    className="absolute rounded-full border border-green-400"
                    style={{ 
                      inset: `${shellInset * 4}px`,
                      borderColor: `rgba(34, 197, 94, ${opacity})`,
                      borderWidth: isOuterShell ? '1px' : '1px'
                    }}
                    animate={isScanning ? {
                      rotate: shellIndex % 2 === 0 ? 360 : -360,
                      borderColor: [
                        `rgba(34, 197, 94, ${opacity})`, 
                        `rgba(34, 197, 94, ${Math.min(1, opacity + 0.4)})`, 
                        `rgba(34, 197, 94, ${opacity})`
                      ]
                    } : { 
                      rotate: shellIndex % 2 === 0 ? 360 : -360 
                    }}
                    transition={isScanning ? {
                      duration: scanningSpeed,
                      repeat: Infinity,
                      ease: "linear"
                    } : {
                      duration: rotationSpeed,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    {/* Generate red dots for electrons in this shell */}
                    {Array.from({ length: electronsInShell }).map((_, electronIndex) => {
                      const angle = (electronIndex * 360) / electronsInShell;
                      // Calculate radius based on shell - accounting for the inset and border
                      const baseRadius = 24; // Half of 48px (w-12 h-12)
                      const shellRadius = baseRadius - (shellInset * 4) - 2; // Subtract inset and border
                      const x = Math.cos((angle * Math.PI) / 180) * shellRadius;
                      const y = Math.sin((angle * Math.PI) / 180) * shellRadius;
                      
                      return (
                        <div
                          key={electronIndex}
                          className="absolute w-1 h-1 bg-red-500 rounded-full"
                          style={{
                            left: '50%',
                            top: '50%',
                            transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                            boxShadow: '0 0 4px #ef4444'
                          }}
                        />
                      );
                    })}
                  </motion.div>
                );
              })}

              {/* Center nucleus with element symbol */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={isScanning ? {
                  scale: [1, 1.3, 1],
                } : {}}
                transition={isScanning ? {
                  duration: 0.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                } : {}}
              >
                <div className="w-6 h-6 bg-green-400/20 rounded-full flex items-center justify-center border border-green-400/60"
                     style={{ boxShadow: '0 0 8px rgba(34, 197, 94, 0.3)' }}>
                  <span className="text-xs font-bold text-green-400">
                    {ATOMIC_DATA[currentElement]?.symbol || 'H'}
                  </span>
                </div>
              </motion.div>

              {/* Scanning pulse effect */}
              {isScanning && (
                <motion.div
                  className="absolute inset-0 rounded-full border border-yellow-400"
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              )}
            </div>

            {/* Scanning text */}
            {isScanning && (
              <motion.div
                className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                <span className="text-xs text-green-400">
                  Scanning...
                </span>
              </motion.div>
            )}
          </div>
        </FloatingPanel>
      </motion.div>

      {/* Atomic Structure Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.5, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 100 }}
              transition={{ duration: 0.6, ease: "backOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <FloatingPanel className="bg-black/90 backdrop-blur-md border border-green-500/30">
                <div className="p-8">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center space-x-4">
                      <Zap className="w-8 h-8 text-green-400" />
                      <h2 className="text-3xl font-bold text-white">Atomic Structure Analysis</h2>
                    </div>
                    <button
                      onClick={closeModal}
                      className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-colors"
                    >
                      <X className="w-6 h-6 text-red-400" />
                    </button>
                  </div>

                  {/* Element Selection */}
                  <div className="flex space-x-4 mb-8">
                    {Object.entries(ATOMIC_DATA).map(([key, data]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedElement(key)}
                        className={`px-6 py-3 rounded-lg border-2 transition-all ${
                          selectedElement === key || (selectedElement === null && key === currentElement)
                            ? `border-green-400 bg-green-400/20`
                            : 'border-gray-600 bg-gray-800/40 hover:border-gray-400'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">{data.symbol}</div>
                          <div className="text-sm text-gray-300">{data.name}</div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Main Content */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Atomic Structure Visualization */}
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-white text-center">
                        {ATOMIC_DATA[selectedElement || currentElement].name} Atom
                      </h3>
                      
                      {renderAtomicStructure(ATOMIC_DATA[selectedElement || currentElement])}

                      <div className="text-center space-y-2">
                        <span className="text-gray-300">
                          Mass = {ATOMIC_DATA[selectedElement || currentElement].average_atomic_mass.toFixed(3)} AMU
                        </span>
                        <div className="text-xs text-gray-400">
                          Configuration: {ATOMIC_DATA[selectedElement || currentElement].electron_configuration}
                        </div>
                      </div>
                    </div>

                    {/* Atomic Data */}
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-white">Properties</h3>
                      
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                          <div className="text-gray-300 text-sm">Element</div>
                          <div className="text-white text-xl font-bold">
                            {ATOMIC_DATA[selectedElement || currentElement].name}
                          </div>
                          <div className="text-gray-400 text-sm mt-1">
                            {ATOMIC_DATA[selectedElement || currentElement].category} • {ATOMIC_DATA[selectedElement || currentElement].state} @ {ATOMIC_DATA[selectedElement || currentElement].temperature}K
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                            <div className="text-red-300 text-sm">Protons</div>
                            <div className="text-red-400 text-2xl font-bold">
                              {ATOMIC_DATA[selectedElement || currentElement].protons}
                            </div>
                          </div>

                          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                            <div className="text-blue-300 text-sm">Neutrons</div>
                            <div className="text-blue-400 text-2xl font-bold">
                              {ATOMIC_DATA[selectedElement || currentElement].neutrons}
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                          <div className="text-green-300 text-sm">Electrons</div>
                          <div className="text-green-400 text-2xl font-bold">
                            {ATOMIC_DATA[selectedElement || currentElement].electrons}
                          </div>
                        </div>

                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                          <div className="text-gray-300 text-sm">Description</div>
                          <div className="text-gray-100 mt-2">
                            {ATOMIC_DATA[selectedElement || currentElement].description}
                          </div>
                        </div>

                        {/* Additional Scientific Properties */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                            <div className="text-purple-300 text-xs">Bonding State</div>
                            <div className="text-purple-400 text-sm font-bold capitalize">
                              {ATOMIC_DATA[selectedElement || currentElement].bonding_state}
                            </div>
                          </div>

                          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                            <div className="text-amber-300 text-xs">Crystal Structure</div>
                            <div className="text-amber-400 text-sm font-bold">
                              {ATOMIC_DATA[selectedElement || currentElement].crystal_structure}
                            </div>
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
                          <div className="text-indigo-300 text-xs">Atomic Weight Range</div>
                          <div className="text-indigo-400 text-sm font-bold">
                            {ATOMIC_DATA[selectedElement || currentElement].atomic_weights[0].toFixed(5)} - {ATOMIC_DATA[selectedElement || currentElement].atomic_weights[1].toFixed(5)} u
                          </div>
                        </div>
                      </div>

                      {/* Legend */}
                      <div className="space-y-3">
                        <h4 className="text-white font-bold">Legend</h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-400 rounded-full"
                                 style={{ boxShadow: '0 0 6px #22c55e' }} />
                            <span className="text-green-300">Electron</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"
                                 style={{ boxShadow: '0 0 6px #ef4444' }} />
                            <span className="text-red-300">Proton</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"
                                 style={{ boxShadow: '0 0 6px #3b82f6' }} />
                            <span className="text-blue-300">Neutron</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </FloatingPanel>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}