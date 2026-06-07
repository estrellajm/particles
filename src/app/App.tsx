import React, { useState, useEffect } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { GameplayHUD } from './components/GameplayHUD';
import { SettingsMenu } from './components/SettingsMenu';
import { ParticleBackground } from './components/ParticleBackground';

type GameScreen = 'home' | 'gameplay' | 'settings';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('home');
  const [gameSettings, setGameSettings] = useState({
    music: true,
    particleEffects: true,
    difficulty: 'normal' as 'easy' | 'normal' | 'hard',
    scientificMode: true,
  });

  const navigateToScreen = (screen: GameScreen) => {
    setCurrentScreen(screen);
  };

  const updateSettings = (newSettings: Partial<typeof gameSettings>) => {
    setGameSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <div className="relative size-full bg-black overflow-hidden">
      <ParticleBackground intensity={gameSettings.particleEffects ? 'high' : 'low'} />
      
      {currentScreen === 'home' && (
        <div className="relative z-20 size-full">
          <HomeScreen onNavigate={navigateToScreen} />
        </div>
      )}
      
      {currentScreen === 'gameplay' && (
        <div className="relative z-20 size-full">
          <GameplayHUD 
            onNavigate={navigateToScreen}
            scientificMode={gameSettings.scientificMode}
          />
        </div>
      )}
      
      {currentScreen === 'settings' && (
        <div className="relative z-20 size-full">
          <SettingsMenu
            settings={gameSettings}
            onUpdateSettings={updateSettings}
            onNavigate={navigateToScreen}
          />
        </div>
      )}
    </div>
  );
}