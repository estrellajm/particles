import React from 'react';
import { motion } from 'motion/react';
import { cn } from './ui/utils';

interface FloatingPanelProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  onClick?: () => void;
}

export function FloatingPanel({ children, className, animate = true, onClick }: FloatingPanelProps) {
  const Component = animate ? motion.div : 'div';
  
  const animationProps = animate ? {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    whileHover: { scale: 1.02 },
    transition: { duration: 0.3, ease: "easeOut" }
  } : {};

  return (
    <Component
      {...animationProps}
      onClick={onClick}
      className={cn(
        "bg-black/40 backdrop-blur-md border border-white/20",
        "rounded-2xl shadow-xl shadow-black/50",
        "relative overflow-hidden",
        onClick && "cursor-pointer",
        className
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </Component>
  );
}