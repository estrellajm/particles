import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface TouchJoystickProps {
  onMove: (direction: { x: number; y: number }) => void;
}

export function TouchJoystick({ onMove }: TouchJoystickProps) {
  const [isActive, setIsActive] = useState(false);
  const [knobPosition, setKnobPosition] = useState({ x: 0, y: 0 });
  const joystickRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(false);

  const maxDistance = 30; // Maximum distance from center

  const handleStart = useCallback((clientX: number, clientY: number) => {
    setIsActive(true);
    activeRef.current = true;
  }, []);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!activeRef.current || !joystickRef.current) return;

    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    let x = deltaX;
    let y = deltaY;

    if (distance > maxDistance) {
      x = (deltaX / distance) * maxDistance;
      y = (deltaY / distance) * maxDistance;
    }

    setKnobPosition({ x, y });
    
    // Normalize values between -1 and 1
    const normalizedX = x / maxDistance;
    const normalizedY = y / maxDistance;
    
    onMove({ x: normalizedX, y: normalizedY });
  }, [onMove, maxDistance]);

  const handleEnd = useCallback(() => {
    setIsActive(false);
    activeRef.current = false;
    setKnobPosition({ x: 0, y: 0 });
    onMove({ x: 0, y: 0 });
  }, [onMove]);

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  // Mouse events (for testing)
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
    
    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      handleEnd();
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      ref={joystickRef}
      className="relative w-20 h-20 touch-none select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleEnd}
      onMouseDown={handleMouseDown}
    >
      {/* Outer ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-white/30 bg-black/30 backdrop-blur-sm"
        animate={{
          borderColor: isActive ? 'rgba(34, 211, 238, 0.6)' : 'rgba(255, 255, 255, 0.3)',
          boxShadow: isActive 
            ? '0 0 20px rgba(34, 211, 238, 0.4)' 
            : '0 0 10px rgba(0, 0, 0, 0.3)',
        }}
        transition={{ duration: 0.2 }}
      />
      
      {/* Inner knob */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-8 h-8 -mt-4 -ml-4 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg"
        animate={{
          x: knobPosition.x,
          y: knobPosition.y,
          scale: isActive ? 1.1 : 1,
          boxShadow: isActive
            ? '0 0 15px rgba(34, 211, 238, 0.6)'
            : '0 0 8px rgba(34, 211, 238, 0.3)',
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    </div>
  );
}