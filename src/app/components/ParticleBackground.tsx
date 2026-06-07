import React from 'react';
import { motion } from 'motion/react';

interface ParticleBackgroundProps {
  intensity: 'low' | 'high';
}

export function ParticleBackground({ intensity }: ParticleBackgroundProps) {
  const starCount = intensity === 'high' ? 150 : 75;
  const brightStarCount = intensity === 'high' ? 20 : 10; // Prominent bright stars
  const particleCount = intensity === 'high' ? 25 : 12;
  
  // Generate stars with various sizes and positions
  const stars = Array.from({ length: starCount }, (_, i) => ({
    id: i,
    size: Math.random() * 2 + 0.5, // Smaller stars: 0.5-2.5px
    x: Math.random() * 100,
    y: Math.random() * 100,
    twinkleDuration: Math.random() * 6 + 3, // Slower twinkling
    delay: Math.random() * 8,
    opacity: Math.random() * 0.3 + 0.1, // Much dimmer: 0.1-0.4
    brightness: Math.random() * 0.2 + 0.1, // Very subtle: 0.1-0.3
  }));

  // Generate bright prominent stars
  const brightStars = Array.from({ length: brightStarCount }, (_, i) => ({
    id: i,
    size: Math.random() * 1.5 + 2, // Smaller: 2-3.5px
    x: Math.random() * 100,
    y: Math.random() * 100,
    twinkleDuration: Math.random() * 5 + 3, // Slower twinkling
    delay: Math.random() * 6,
    opacity: Math.random() * 0.2 + 0.3, // Much dimmer: 0.3-0.5
  }));

  // Generate floating particles (atoms/molecules)
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
      {/* Deep space gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-blue-950" style={{ zIndex: 1 }} />
      
      {/* Main Starfield */}
      {stars.map((star) => (
        <motion.div
          key={`star-${star.id}`}
          className="absolute rounded-full bg-white"
          style={{
            width: star.size,
            height: star.size,
            left: `${star.x}%`,
            top: `${star.y}%`,
            opacity: star.brightness,
            filter: 'none',
            boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, ${star.brightness * 0.3})`,
            zIndex: 2,
          }}
          animate={{
            opacity: [star.opacity * 0.5, star.opacity, star.opacity * 0.5],
            scale: [0.8, 1.1, 0.8],
          }}
          transition={{
            duration: star.twinkleDuration,
            delay: star.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Bright Prominent Stars */}
      {brightStars.map((star) => (
        <motion.div
          key={`bright-star-${star.id}`}
          className="absolute rounded-full bg-white"
          style={{
            width: star.size,
            height: star.size,
            left: `${star.x}%`,
            top: `${star.y}%`,
            opacity: star.opacity,
            filter: 'none',
            boxShadow: `0 0 ${star.size * 3}px rgba(255, 255, 255, ${star.opacity * 0.4}), 0 0 ${star.size * 1.5}px rgba(255, 255, 255, ${star.opacity * 0.2})`,
            zIndex: 3,
          }}
          animate={{
            opacity: [star.opacity * 0.7, star.opacity, star.opacity * 0.7],
            scale: [0.9, 1.2, 0.9],
          }}
          transition={{
            duration: star.twinkleDuration,
            delay: star.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Floating atomic particles */}
      {particles.map((particle) => (
        <motion.div
          key={`particle-${particle.id}`}
          className="absolute rounded-full bg-gradient-to-r from-blue-400/40 to-cyan-300/40"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            filter: 'blur(1px)',
            boxShadow: `0 0 ${particle.size * 1.5}px rgba(34, 197, 94, 0.2)`,
            zIndex: 4,
          }}
          animate={{
            y: [0, -15, 0],
            x: [0, 8, -3, 0],
            opacity: [0.15, 0.4, 0.15],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Distant galaxies/nebulae */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 20% 80%, rgba(168, 85, 247, 0.08) 0%, transparent 40%), radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.08) 0%, transparent 40%), radial-gradient(circle at 60% 60%, rgba(59, 130, 246, 0.06) 0%, transparent 50%)',
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Subtle cosmic dust */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 40% 30%, rgba(255, 255, 255, 0.02) 0%, transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(255, 255, 255, 0.02) 0%, transparent 60%)',
        }}
        animate={{
          opacity: [0.4, 0.8, 0.4],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}