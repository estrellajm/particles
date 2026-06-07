import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FloatingPanel } from './FloatingPanel';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { X, Atom, Calendar, Zap, Info } from 'lucide-react';

interface Molecule {
  id: string;
  name: string;
  formula: string;
  discoveryDate: string;
  energyValue: number;
  description: string;
  formed: boolean;
}

interface MoleculeLogbookProps {
  isOpen: boolean;
  onClose: () => void;
  molecules: Molecule[];
  scientificMode: boolean;
}

export function MoleculeLogbook({ isOpen, onClose, molecules, scientificMode }: MoleculeLogbookProps) {
  const discoveredCount = molecules.filter(m => m.formed).length;
  const totalCount = molecules.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md h-[70vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <FloatingPanel className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div>
                  <h2 className="text-xl text-white flex items-center gap-2">
                    <Atom className="h-5 w-5 text-cyan-400" />
                    Molecule Logbook
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Discovered: {discoveredCount}/{totalCount}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onClose}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Progress Bar */}
              <div className="px-6 pt-4">
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(discoveredCount / totalCount) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Molecules List */}
              <ScrollArea className="flex-1 px-6 py-4">
                <div className="space-y-4">
                  {molecules.map((molecule) => (
                    <motion.div
                      key={molecule.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 rounded-xl border transition-all duration-300 ${
                        molecule.formed
                          ? 'bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border-cyan-400/30'
                          : 'bg-gray-900/50 border-gray-600/30'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className={`font-medium ${molecule.formed ? 'text-white' : 'text-gray-500'}`}>
                            {molecule.name}
                          </h3>
                          <p className={`text-sm ${molecule.formed ? 'text-cyan-300' : 'text-gray-600'}`}>
                            {scientificMode ? molecule.formula : molecule.name}
                          </p>
                        </div>
                        <Badge
                          variant={molecule.formed ? "default" : "secondary"}
                          className={molecule.formed ? 'bg-cyan-600' : 'bg-gray-600'}
                        >
                          {molecule.formed ? 'Discovered' : 'Unknown'}
                        </Badge>
                      </div>

                      {molecule.formed && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-3"
                        >
                          {/* Discovery Info */}
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{molecule.discoveryDate}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Zap className="h-3 w-3 text-yellow-400" />
                              <span>+{molecule.energyValue} Energy</span>
                            </div>
                          </div>

                          {/* Description */}
                          <div className="flex items-start gap-2">
                            <Info className="h-3 w-3 text-blue-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-gray-300 leading-relaxed">
                              {molecule.description}
                            </p>
                          </div>

                          {/* Molecule Visualization */}
                          <div className="flex items-center justify-center py-2">
                            <div className="flex items-center gap-2">
                              {molecule.formula.split('').map((char, i) => (
                                <span
                                  key={i}
                                  className={`text-lg ${
                                    char === 'H' ? 'text-cyan-400' :
                                    char === 'O' ? 'text-blue-400' :
                                    char === 'C' ? 'text-gray-400' :
                                    'text-gray-500'
                                  }`}
                                >
                                  {char}
                                </span>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {!molecule.formed && (
                        <div className="text-center py-4">
                          <div className="w-16 h-16 bg-gray-800 rounded-full mx-auto mb-2 flex items-center justify-center">
                            <span className="text-2xl">?</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            Discover this molecule by bonding particles
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </FloatingPanel>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}