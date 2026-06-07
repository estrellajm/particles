import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FloatingPanel } from './FloatingPanel';
import { Button } from './ui/button';
import { ChevronRight, ChevronLeft, X, Hand, Target, Sparkles } from 'lucide-react';

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  position: { x: string; y: string };
  pointer: { x: string; y: string };
}

interface TutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function TutorialOverlay({ isOpen, onClose, onComplete }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps: TutorialStep[] = [
    {
      id: 1,
      title: "Welcome to Particles!",
      description: "You are a Hydrogen atom exploring the universe. Drag anywhere on the screen to move your particle around.",
      icon: <Hand className="h-6 w-6 text-cyan-400" />,
      position: { x: "50%", y: "40%" },
      pointer: { x: "50%", y: "60%" }
    },
    {
      id: 2,
      title: "Find Another Hydrogen",
      description: "Look for another Hydrogen atom (green glow) and get close to it. When you're near, you'll see a glowing ring appear.",
      icon: <Target className="h-6 w-6 text-green-400" />,
      position: { x: "30%", y: "30%" },
      pointer: { x: "70%", y: "60%" }
    },
    {
      id: 3,
      title: "Form Your First Molecule",
      description: "Tap the interaction button or get very close to bond with Oxygen and create H₂O (water). This unlocks advanced bonding!",
      icon: <Sparkles className="h-6 w-6 text-blue-400" />,
      position: { x: "70%", y: "25%" },
      pointer: { x: "20%", y: "40%" }
    }
  ];

  const currentTutorial = tutorialSteps[currentStep];

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
        >
          {/* Spotlight effect */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute rounded-full bg-white/10"
            style={{
              left: currentTutorial.pointer.x,
              top: currentTutorial.pointer.y,
              width: '120px',
              height: '120px',
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
            }}
          />

          {/* Pulsing Pointer */}
          <motion.div
            className="absolute z-10"
            style={{
              left: currentTutorial.pointer.x,
              top: currentTutorial.pointer.y,
              transform: 'translate(-50%, -50%)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="w-8 h-8 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50" />
            <div className="absolute inset-0 w-8 h-8 bg-cyan-400 rounded-full animate-ping" />
          </motion.div>

          {/* Tutorial Panel */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute z-20"
            style={{
              left: currentTutorial.position.x,
              top: currentTutorial.position.y,
            }}
          >
            <FloatingPanel className="w-80 p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {currentTutorial.icon}
                  <h3 className="text-lg text-white">{currentTutorial.title}</h3>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleSkip}
                  className="w-8 h-8 text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-300 leading-relaxed mb-6">
                {currentTutorial.description}
              </p>

              {/* Progress Dots */}
              <div className="flex items-center justify-center gap-2 mb-6">
                {tutorialSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep ? 'bg-cyan-400' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-gray-400 hover:text-white"
                >
                  Skip Tutorial
                </Button>

                <div className="flex items-center gap-2">
                  {currentStep > 0 && (
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={handlePrevious}
                      className="w-8 h-8 border-gray-600"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button
                    onClick={handleNext}
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
                  >
                    {currentStep === tutorialSteps.length - 1 ? 'Start Playing' : 'Next'}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </FloatingPanel>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}