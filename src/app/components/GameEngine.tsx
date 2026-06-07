import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';

interface Particle {
  id: string;
  type: 'hydrogen' | 'oxygen' | 'carbon';
  x: number;
  y: number;
  charge: number;
  energy: number;
  bonded?: string[];
  isDragging?: boolean;
}

interface Molecule {
  id: string;
  formula: string;
  name: string;
  atoms: Particle[];
  x: number;
  y: number;
  bondType: 'single' | 'double' | 'triple';
  type: 'molecule';
  molecularType: 'H2' | 'O2' | 'H2O' | 'CO' | 'CH4' | 'CO2';
  isDragging?: boolean;
}

interface GameEngineProps {
  scientificMode: boolean;
  onEnergyChange: (energy: number) => void;
  onMoleculeFormed: (molecule: string) => void;
  onDragStateChange?: (isDragging: boolean) => void;
  onNearbyElementsChange?: (elements: string[]) => void;
  children: React.ReactNode;
}

// Updated atomic data structure with new model
const ATOMIC_DATA = {
  hydrogen: {
    element: "H",
    name: "Hydrogen",
    symbol: "H",
    charge: 0,
    bonding_state: "unbonded",
    temperature: 298,
    state: "gas",
    atomic_weights: [1.00784, 1.00811],
    average_atomic_mass: 1.00794,
    electron_configuration: "1s1",
    crystal_structure: "hexagonal",
    category: "nonmetal",
    atom_config: {
      protons: 1,
      neutrons: 0,
      electrons: {
        total: 1,
        shell: {
          "1": 1
        }
      }
    },
    // Display properties
    bgColor: 'bg-violet-400',
    glowColor: '#a855f7',
    textColor: 'text-white'
  },
  oxygen: {
    element: "O",
    name: "Oxygen",
    symbol: "O",
    charge: 0,
    bonding_state: "unbonded",
    temperature: 298,
    state: "gas",
    atomic_weights: [15.9949, 15.9991],
    average_atomic_mass: 15.999,
    electron_configuration: "1s2 2s2 2p4",
    crystal_structure: "cubic",
    category: "nonmetal",
    atom_config: {
      protons: 8,
      neutrons: 8,
      electrons: {
        total: 8,
        shell: {
          "1": 2,
          "2": 6
        }
      }
    },
    // Display properties
    bgColor: 'bg-green-500',
    glowColor: '#22c55e',
    textColor: 'text-white'
  },
  carbon: {
    element: "C",
    name: "Carbon",
    symbol: "C",
    charge: 0,
    bonding_state: "unbonded",
    temperature: 298,
    state: "solid",
    atomic_weights: [12.0096, 12.0116],
    average_atomic_mass: 12.011,
    electron_configuration: "1s2 2s2 2p2",
    crystal_structure: "diamond cubic",
    category: "nonmetal",
    atom_config: {
      protons: 6,
      neutrons: 6,
      electrons: {
        total: 6,
        shell: {
          "1": 2,
          "2": 4
        }
      }
    },
    // Display properties
    bgColor: 'bg-orange-500',
    glowColor: '#f97316',
    textColor: 'text-white'
  }
};

// Legacy compatibility - extract display config from atomic data
const ELEMENT_CONFIG = Object.fromEntries(
  Object.entries(ATOMIC_DATA).map(([key, data]) => [
    key, 
    {
      symbol: data.symbol,
      bgColor: data.bgColor,
      glowColor: data.glowColor,
      textColor: data.textColor,
      electrons: data.atom_config.electrons.total,
      electronShells: data.atom_config.electrons.shell
    }
  ])
);

// Molecular bonding rules
const BONDING_RULES = {
  'hydrogen,hydrogen': { formula: 'H₂', name: 'Hydrogen Gas', bondType: 'single' as const, molecularType: 'H2' as const },
  'oxygen,oxygen': { formula: 'O₂', name: 'Oxygen Gas', bondType: 'double' as const, molecularType: 'O2' as const },
  'carbon,oxygen': { formula: 'CO', name: 'Carbon Monoxide', bondType: 'triple' as const, molecularType: 'CO' as const },
  'hydrogen,oxygen': { formula: 'H₂O', name: 'Water', bondType: 'single' as const, requiresCount: { hydrogen: 2, oxygen: 1 }, molecularType: 'H2O' as const },
  'carbon,hydrogen': { formula: 'CH₄', name: 'Methane', bondType: 'single' as const, requiresCount: { carbon: 1, hydrogen: 4 }, molecularType: 'CH4' as const },
  // Allow H2 molecules to bond with oxygen
  'H2,oxygen': { formula: 'H₂O', name: 'Water', bondType: 'single' as const, molecularType: 'H2O' as const },
};

// Optimized orbital electrons with smoother performance
const OrbitingElectrons = ({ elementType, size = 'normal', centerX = 0, centerY = 0 }: { elementType: 'hydrogen' | 'oxygen' | 'carbon', size?: 'normal' | 'large', centerX?: number, centerY?: number }) => {
  const config = ELEMENT_CONFIG[elementType];
  const electronShells = config.electronShells;
  const isLarge = size === 'large';
  const electronSize = isLarge ? 'w-1.5 h-1.5' : 'w-1 h-1';
  const electronHalfSize = isLarge ? 6 : 4;
  
  // Optimized base radius and spacing
  const baseRadius = isLarge ? 32 : 28;
  const shellSpacing = isLarge ? 20 : 16;
  
  return (
    <div className="absolute" style={{ left: `${centerX}px`, top: `${centerY}px` }}>
      {Object.entries(electronShells).map(([shellNumber, electronCount]) => {
        const shellIndex = parseInt(shellNumber) - 1;
        const baseShellRadius = baseRadius + (shellIndex * shellSpacing);
        
        // Simplified direction pattern
        const isClockwise = shellIndex % 2 === 0;
        const rotationDirection = isClockwise ? 1 : -1;
        
        // Simplified orbital speed - more consistent, less random
        const baseSpeed = 6 + (shellIndex * 0.5); // Slightly faster base speed
        
        return Array.from({ length: electronCount }).map((_, electronIndex) => {
          // Evenly distribute electrons around the shell
          const startAngle = (electronIndex * 360) / electronCount;
          
          // Fixed speed variation for consistency
          const electronSpeed = baseSpeed + (electronIndex * 0.1);
          
          return (
            <div
              key={`shell${shellNumber}-electron${electronIndex}`}
              className="absolute"
              style={{
                left: '0px',
                top: '0px',
              }}
            >
              <motion.div
                className={`absolute ${electronSize} bg-cyan-300 rounded-full`}
                initial={{
                  x: baseShellRadius - electronHalfSize,
                  y: -electronHalfSize,
                  rotate: startAngle
                }}
                animate={{ 
                  // Simple rotation animation - remove complex radial oscillation
                  rotate: rotationDirection === 1 
                    ? [startAngle, startAngle + 360] 
                    : [startAngle, startAngle - 360]
                }}
                transition={{ 
                  rotate: {
                    duration: electronSpeed,
                    repeat: Infinity, 
                    ease: 'linear',
                    delay: electronIndex * 0.05 // Slightly larger stagger
                  }
                }}
                style={{
                  transformOrigin: `${-(baseShellRadius - electronHalfSize)}px ${electronHalfSize}px`,
                  boxShadow: '0 0 6px #67e8f9, 0 0 3px #22d3ee',
                }}
              />
            </div>
          );
        });
      })}
    </div>
  );
};

// Molecule component with shared electrons visualization
const MoleculeRenderer = ({ molecule, proximity }: { molecule: Molecule; proximity?: { type: string } }) => {
  if (molecule.molecularType === 'H2') {
    return (
      <div className="relative w-0 h-0">
        {/* Proximity Ring - Centered around the entire molecule */}
        {proximity && (
          <motion.div
            className={`absolute w-20 h-20 rounded-full border-2 ${
              proximity.type === 'bonding' 
                ? 'border-yellow-400 bg-yellow-400/10' 
                : proximity.type === 'neutral'
                ? 'border-blue-400 bg-blue-400/10'
                : 'border-red-400 bg-red-400/10'
            }`}
            style={{
              left: '-40px', // Center the 80px ring around molecule center at (0,0)
              top: '-40px',  // Center the 80px ring around molecule center at (0,0)
              zIndex: 5,
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}

        {/* Molecule Glow - Overall glow around both atoms */}
        <motion.div
          className="absolute w-24 h-12 bg-gradient-to-r from-violet-400/30 to-purple-500/30 rounded-full blur-lg"
          style={{
            left: '-48px',
            top: '-24px',
            zIndex: 8,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Left Hydrogen Atom - centered at (-18px, 0px) */}
        <div 
          className="absolute w-12 h-12 bg-gradient-to-r from-violet-400 to-purple-500 rounded-full flex items-center justify-center"
          style={{ 
            left: '-42px',  // -18px center - 24px radius = -42px
            top: '-24px',   // Center vertically
            boxShadow: '0 0 16px rgba(168, 85, 247, 0.6)',
            zIndex: 15,
          }}
        >
          <span className="text-sm font-bold text-white">H</span>
        </div>

        {/* Right Hydrogen Atom - centered at (+18px, 0px) */}
        <div 
          className="absolute w-12 h-12 bg-gradient-to-r from-violet-400 to-purple-500 rounded-full flex items-center justify-center"
          style={{ 
            left: '-6px',   // +18px center - 24px radius = -6px
            top: '-24px',   // Center vertically  
            boxShadow: '0 0 16px rgba(168, 85, 247, 0.6)',
            zIndex: 15,
          }}
        >
          <span className="text-sm font-bold text-white">H</span>
        </div>

        {/* Bonding Orbital Overlap Glow - positioned exactly at center (0px,0px) */}
        <motion.div
          className="absolute w-8 h-8 bg-cyan-400/60 rounded-full blur-sm"
          style={{
            left: '-16px', // Center at (0px,0px): 0px - 16px = -16px
            top: '-16px',
            zIndex: 20,
          }}
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />

        {/* Shared Electrons - positioned exactly at the circle intersection points */}
        <div className="absolute" style={{ left: '0px', top: '0px', zIndex: 25 }}>
          {/* First electron - at top intersection point (0px, -16px) */}
          <motion.div
            className="absolute w-2.5 h-2.5 bg-cyan-300 rounded-full"
            style={{ 
              left: '-8px',   // 0px x-coordinate, perfectly centered = -8px 
              top: '-20px',   // -16px y-coordinate, centered = -20px  
              boxShadow: '0 0 12px #67e8f9, 0 0 6px #22d3ee',
            }}
            animate={{
              x: 0,
              y: 0,
              opacity: [0.9, 1, 0.9],
              scale: [1.1, 0.9, 1.1],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          {/* Second electron - at bottom intersection point (0px, +16px) */}
          <motion.div
            className="absolute w-2.5 h-2.5 bg-cyan-300 rounded-full"
            style={{ 
              left: '-8px',   // 0px x-coordinate, perfectly centered = -8px
              top: '6px',    // +16px y-coordinate, centered = +6px
              boxShadow: '0 0 12px #67e8f9, 0 0 6px #22d3ee',
            }}
            animate={{
              x: 0,
              y: 0,
              opacity: [0.9, 1, 0.9],
              scale: [0.9, 1.1, 0.9],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1.25
            }}
          />
        </div>

        {/* Molecule Label - Simple formula only, perfectly centered */}
        <div 
          className="absolute text-center cursor-pointer hover:scale-110 transition-transform duration-200" 
          style={{ left: '-8px', top: '28px', zIndex: 30 }}
          onClick={() => {
            // TODO: Show detailed molecule information modal/popup
            console.log('Show molecule details:', molecule);
          }}
        >
          <div className="text-sm font-bold text-yellow-400">{molecule.formula}</div>
        </div>
      </div>
    );
  }

  // Default molecule display for other types
  return (
    <div className="relative w-16 h-16 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-lg flex flex-col items-center justify-center"
         style={{ boxShadow: '0 0 20px #fbbf24' }}>
      <span className="text-xs font-bold text-white">{molecule.formula}</span>
      <span className="text-xs text-yellow-100">{molecule.name.split(' ')[0]}</span>
    </div>
  );
};

export function GameEngine({ scientificMode, onEnergyChange, onMoleculeFormed, onDragStateChange, onNearbyElementsChange, children }: GameEngineProps) {
  const [particles, setParticles] = useState<Particle[]>([
    { id: 'h1', type: 'hydrogen', x: 25, y: 25, charge: 1, energy: 1 },
    { id: 'h2', type: 'hydrogen', x: 50, y: 25, charge: 1, energy: 1 },
    { id: 'o1', type: 'oxygen', x: 75, y: 25, charge: -2, energy: 8 },
    { id: 'c1', type: 'carbon', x: 25, y: 75, charge: 0, energy: 6 },
    { id: 'h3', type: 'hydrogen', x: 75, y: 75, charge: 1, energy: 1 },
  ]);
  const [molecules, setMolecules] = useState<Molecule[]>([]);
  const [draggedEntity, setDraggedEntity] = useState<string | null>(null);
  const [touchTrail, setTouchTrail] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const [proximityEffects, setProximityEffects] = useState<Array<{ id: string; type: 'danger' | 'safe' | 'neutral' | 'bonding' }>>([]);
  const [bondingAnimation, setBondingAnimation] = useState<{ particles: string[], position: { x: number, y: number } } | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const trailIdRef = useRef(0);

  // Check for possible molecular bonds between all entities
  const checkForBonds = useCallback(() => {
    const allEntities = [
      ...particles,
      ...molecules.map(mol => ({
        id: mol.id,
        type: mol.molecularType,
        x: mol.x,
        y: mol.y,
        charge: 0,
        energy: 0,
        isMolecule: true
      }))
    ];

    // Find pairs of entities within bonding distance
    for (let i = 0; i < allEntities.length; i++) {
      for (let j = i + 1; j < allEntities.length; j++) {
        const entity1 = allEntities[i];
        const entity2 = allEntities[j];
        
        const distance = Math.sqrt(
          Math.pow(entity1.x - entity2.x, 2) + Math.pow(entity1.y - entity2.y, 2)
        );
        
        if (distance < 15) { // Bonding distance (in percentage units)
          // Only bond atoms (not existing molecules with atoms for now)
          if (!entity1.isMolecule && !entity2.isMolecule) {
            const types = [entity1.type, entity2.type].sort();
            const typeKey = types.join(',');
            
            if (BONDING_RULES[typeKey]) {
              const rule = BONDING_RULES[typeKey];
              
              // Check if we have the right count for complex molecules
              if (rule.requiresCount) {
                // For complex molecules, we need to find all required atoms in proximity
                const nearbyAtoms = allEntities.filter(entity => {
                  if (entity.isMolecule) return false;
                  const dist1 = Math.sqrt(Math.pow(entity.x - entity1.x, 2) + Math.pow(entity.y - entity1.y, 2));
                  const dist2 = Math.sqrt(Math.pow(entity.x - entity2.x, 2) + Math.pow(entity.y - entity2.y, 2));
                  return dist1 < 20 || dist2 < 20; // Slightly larger radius for complex molecules
                });
                
                const counts = nearbyAtoms.reduce((acc, entity) => {
                  acc[entity.type] = (acc[entity.type] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>);
                
                const meetsRequirement = Object.entries(rule.requiresCount).every(
                  ([type, required]) => counts[type] >= required
                );
                
                if (meetsRequirement) {
                  // Get the exact number of atoms needed
                  const atomsToUse: Particle[] = [];
                  Object.entries(rule.requiresCount).forEach(([type, required]) => {
                    const atomsOfType = nearbyAtoms.filter(a => a.type === type && !a.isMolecule).slice(0, required);
                    atomsToUse.push(...atomsOfType as Particle[]);
                  });
                  
                  if (atomsToUse.length > 0) {
                    formMolecule(atomsToUse, rule);
                    return; // Exit after forming one molecule
                  }
                }
              } else {
                // Simple two-atom molecule
                formMolecule([entity1, entity2] as Particle[], rule);
                return; // Exit after forming one molecule
              }
            }
          }
          
          // Handle molecule + atom bonding (e.g., H2 + O)
          if ((entity1.isMolecule && !entity2.isMolecule) || (!entity1.isMolecule && entity2.isMolecule)) {
            const molecule = entity1.isMolecule ? entity1 : entity2;
            const atom = entity1.isMolecule ? entity2 : entity1;
            
            const typeKey = [molecule.type, atom.type].sort().join(',');
            
            if (BONDING_RULES[typeKey]) {
              const rule = BONDING_RULES[typeKey];
              formMolecularBond([molecule, atom], rule);
              return; // Exit after forming one molecule
            }
          }
        }
      }
    }
  }, [particles, molecules]);

  const formMolecule = (atoms: Particle[], rule: typeof BONDING_RULES[string]) => {
    const centerX = atoms.reduce((sum, atom) => sum + atom.x, 0) / atoms.length;
    const centerY = atoms.reduce((sum, atom) => sum + atom.y, 0) / atoms.length;

    const newMolecule: Molecule = {
      id: `molecule_${Date.now()}`,
      formula: rule.formula,
      name: rule.name,
      atoms: atoms,
      x: centerX,
      y: centerY,
      bondType: rule.bondType,
      type: 'molecule',
      molecularType: rule.molecularType
    };

    // Start bonding animation
    setBondingAnimation({
      particles: atoms.map(a => a.id),
      position: { x: centerX, y: centerY }
    });

    // Remove individual particles that formed the molecule
    setParticles(prev => prev.filter(p => !atoms.some(atom => atom.id === p.id)));
    
    // Add the new molecule
    setMolecules(prev => [...prev, newMolecule]);
    
    // Trigger callback
    onMoleculeFormed(rule.name);

    // Clear animation after delay
    setTimeout(() => setBondingAnimation(null), 1500);
  };

  // Handle bonding between molecules and atoms
  const formMolecularBond = (entities: any[], rule: typeof BONDING_RULES[string]) => {
    const h2Molecule = entities.find(entity => entity.type === 'H2');
    const oxygenAtom = entities.find(entity => entity.type === 'oxygen');
    
    if (!h2Molecule || !oxygenAtom) return;

    const centerX = (h2Molecule.x + oxygenAtom.x) / 2;
    const centerY = (h2Molecule.y + oxygenAtom.y) / 2;

    // Get the original hydrogen atoms from the H2 molecule
    const h2MoleculeData = molecules.find(mol => mol.id === h2Molecule.id);
    const hydrogenAtoms = h2MoleculeData ? h2MoleculeData.atoms : [];
    const oxygenParticle = particles.find(p => p.id === oxygenAtom.id);

    if (!oxygenParticle) return;

    const allAtoms = [...hydrogenAtoms, oxygenParticle];

    const newMolecule: Molecule = {
      id: `molecule_${Date.now()}`,
      formula: rule.formula,
      name: rule.name,
      atoms: allAtoms,
      x: centerX,
      y: centerY,
      bondType: rule.bondType,
      type: 'molecule',
      molecularType: rule.molecularType
    };

    // Start bonding animation
    setBondingAnimation({
      particles: [h2Molecule.id, oxygenAtom.id],
      position: { x: centerX, y: centerY }
    });

    // Remove the H2 molecule and oxygen atom
    setMolecules(prev => prev.filter(mol => mol.id !== h2Molecule.id));
    setParticles(prev => prev.filter(p => p.id !== oxygenAtom.id));
    
    // Add the new H2O molecule
    setMolecules(prev => [...prev, newMolecule]);
    
    // Trigger callback
    onMoleculeFormed(rule.name);

    // Clear animation after delay
    setTimeout(() => setBondingAnimation(null), 1500);
  };

  // Calculate proximity effects between all entities
  useEffect(() => {
    const allEntities = [...particles, ...molecules];
    const effects: Array<{ id: string; type: 'danger' | 'safe' | 'neutral' | 'bonding' }> = [];

    allEntities.forEach(entity => {
      const otherEntities = allEntities.filter(other => other.id !== entity.id);
      
      otherEntities.forEach(other => {
        const distance = Math.sqrt(
          Math.pow(entity.x - other.x, 2) + Math.pow(entity.y - other.y, 2)
        );
        
        if (distance < 25) {
          if (distance < 15) {
            effects.push({ id: entity.id, type: 'bonding' });
          } else {
            effects.push({ id: entity.id, type: 'neutral' });
          }
        }
      });
    });
    
    setProximityEffects(effects);

    // Update nearby elements for scanner
    const nearbyTypes = particles.slice(0, 3).map(particle => particle.type);
    onNearbyElementsChange?.(nearbyTypes);
  }, [particles, molecules, onNearbyElementsChange]);

  // Test bonding immediately on load
  useEffect(() => {
    const timer = setTimeout(() => {
      checkForBonds();
    }, 2000);

    return () => clearTimeout(timer);
  }, [checkForBonds]);

  // Check for bonding when proximity changes
  useEffect(() => {
    if (proximityEffects.some(effect => effect.type === 'bonding')) {
      const timer = setTimeout(() => {
        checkForBonds();
      }, 500); // Reduced delay to allow user to position correctly

      return () => clearTimeout(timer);
    }
  }, [proximityEffects, checkForBonds]);

  // Simplified drag handling using only motion.div drag
  const addTrailPoint = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const trailPoint = { x: clientX - rect.left, y: clientY - rect.top, id: trailIdRef.current++ };
    setTouchTrail(prev => [...prev.slice(-8), trailPoint]);
    
    // Remove trail points after delay
    setTimeout(() => {
      setTouchTrail(prev => prev.filter(point => point.id !== trailPoint.id));
    }, 1000);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{ 
        cursor: 'default',
        touchAction: 'none', // Prevent default touch behaviors that might interfere
        zIndex: 10, // Ensure game elements are above background
        backgroundColor: 'transparent' // Remove gray-900 to show starfield
      }}
    >

      {/* Touch Trail Effects */}
      {touchTrail.map((point) => (
        <motion.div
          key={point.id}
          className="absolute pointer-events-none"
          style={{
            left: point.x,
            top: point.y,
          }}
          initial={{ opacity: 0.8, scale: 1 }}
          animate={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="w-4 h-4 bg-cyan-400 rounded-full blur-sm -translate-x-2 -translate-y-2" />
        </motion.div>
      ))}

      {/* Bonding Animation */}
      {bondingAnimation && (
        <motion.div
          className="absolute w-16 h-16 pointer-events-none"
          style={{
            left: `${bondingAnimation.position.x}%`,
            top: `${bondingAnimation.position.y}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: 100,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [0, 1.5, 1],
            opacity: [0, 1, 0.8],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          <div className="w-full h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xs">⚛️</span>
          </div>
        </motion.div>
      )}

      {/* Render all particles */}
      {particles.map(particle => {
        const config = ELEMENT_CONFIG[particle.type];
        const proximity = proximityEffects.find(effect => effect.id === particle.id);
        
        return (
          <motion.div
            key={particle.id}
            className="absolute cursor-grab active:cursor-grabbing"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: particle.isDragging ? 50 : 30,
            }}
            drag
            dragMomentum={false}
            dragElastic={0}
            dragSnapToOrigin={false}
            dragConstraints={containerRef}
            dragTransition={{ bounceStiffness: 0, bounceDamping: 1000 }}
            onDrag={(event, info) => {
              // Only add trail effect and energy update during drag
              // Let motion.div handle the visual positioning
              addTrailPoint(info.point.x, info.point.y);
              onEnergyChange(Math.min(100, 85 + Math.random() * 5));
            }}
            onDragStart={() => {
              setDraggedEntity(particle.id);
              setParticles(prev => prev.map(p => 
                p.id === particle.id ? { ...p, isDragging: true } : p
              ));
              onDragStateChange?.(true);
            }}
            onDragEnd={(event, info) => {
              // Update particle position in percentage coordinates when drag ends
              if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const newX = ((info.point.x - rect.left) / rect.width) * 100;
                const newY = ((info.point.y - rect.top) / rect.height) * 100;
                
                // Clamp to bounds
                const clampedX = Math.max(5, Math.min(95, newX));
                const clampedY = Math.max(5, Math.min(95, newY));
                
                setParticles(prev => prev.map(p => 
                  p.id === particle.id 
                    ? { ...p, x: clampedX, y: clampedY, isDragging: false } 
                    : p
                ));
              }
              
              setDraggedEntity(null);
              onDragStateChange?.(false);
              
              // Check for bonding immediately after particle drag ends
              setTimeout(() => {
                checkForBonds();
              }, 100);
            }}
            whileHover={{ scale: 1.05 }}
            whileDrag={{ scale: 1.1 }}
          >
            {/* Proximity Ring */}
            {proximity && (
              <motion.div
                className={`absolute w-16 h-16 rounded-full border-2 pointer-events-none ${
                  proximity.type === 'bonding' 
                    ? 'border-yellow-400 bg-yellow-400/10' 
                    : proximity.type === 'neutral'
                    ? 'border-blue-400 bg-blue-400/10'
                    : 'border-red-400 bg-red-400/10'
                }`}
                style={{
                  left: '-32px',
                  top: '-32px',
                  zIndex: 5,
                }}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}

            {/* Particle Glow */}
            <motion.div
              className={`absolute w-16 h-16 rounded-full blur-lg opacity-40 pointer-events-none`}
              style={{
                left: '-32px',
                top: '-32px',
                background: config.glowColor,
                zIndex: 8,
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Main Particle */}
            <div 
              className={`absolute w-8 h-8 ${config.bgColor} rounded-full flex items-center justify-center`}
              style={{ 
                left: '-16px',
                top: '-16px',
                boxShadow: `0 0 16px ${config.glowColor}`,
                zIndex: 15,
              }}
            >
              <span className={`text-sm font-bold ${config.textColor} pointer-events-none select-none`}>{config.symbol}</span>
            </div>

            {/* Orbital Electrons */}
            <div className="pointer-events-none" style={{ zIndex: 20 }}>
              <OrbitingElectrons elementType={particle.type} centerX={0} centerY={0} />
            </div>
          </motion.div>
        );
      })}

      {/* Render all molecules */}
      {molecules.map(molecule => {
        const proximity = proximityEffects.find(effect => effect.id === molecule.id);
        
        return (
          <motion.div
            key={molecule.id}
            className="absolute cursor-grab active:cursor-grabbing"
            style={{
              left: `${molecule.x}%`,
              top: `${molecule.y}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: molecule.isDragging ? 50 : 30,
            }}
            drag
            dragMomentum={false}
            dragElastic={0}
            dragSnapToOrigin={false}
            dragConstraints={containerRef}
            dragTransition={{ bounceStiffness: 0, bounceDamping: 1000 }}
            onDrag={(event, info) => {
              addTrailPoint(info.point.x, info.point.y);
              onEnergyChange(Math.min(100, 85 + Math.random() * 5));
            }}
            onDragStart={() => {
              setDraggedEntity(molecule.id);
              setMolecules(prev => prev.map(m => 
                m.id === molecule.id ? { ...m, isDragging: true } : m
              ));
              onDragStateChange?.(true);
            }}
            onDragEnd={(event, info) => {
              // Update molecule position in percentage coordinates when drag ends
              if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const newX = ((info.point.x - rect.left) / rect.width) * 100;
                const newY = ((info.point.y - rect.top) / rect.height) * 100;
                
                // Clamp to bounds
                const clampedX = Math.max(5, Math.min(95, newX));
                const clampedY = Math.max(5, Math.min(95, newY));
                
                setMolecules(prev => prev.map(m => 
                  m.id === molecule.id 
                    ? { ...m, x: clampedX, y: clampedY, isDragging: false } 
                    : m
                ));
              }
              
              setDraggedEntity(null);
              onDragStateChange?.(false);
              
              // Check for bonding immediately after molecule drag ends
              setTimeout(() => {
                checkForBonds();
              }, 100);
            }}
            whileHover={{ scale: 1.05 }}
            whileDrag={{ scale: 1.1 }}
          >
            <MoleculeRenderer molecule={molecule} proximity={proximity} />
          </motion.div>
        );
      })}

      {children}
    </div>
  );
}