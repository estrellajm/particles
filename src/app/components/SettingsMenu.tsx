import React from 'react';
import { motion } from 'framer-motion';
import { FloatingPanel } from './FloatingPanel';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, Volume2, Sparkles, Target, Gamepad2 } from 'lucide-react';

interface SettingsMenuProps {
  settings: {
    music: boolean;
    particleEffects: boolean;
    difficulty: 'easy' | 'normal' | 'hard';
    scientificMode: boolean;
  };
  onUpdateSettings: (settings: Partial<SettingsMenuProps['settings']>) => void;
  onNavigate: (screen: 'home' | 'gameplay' | 'settings') => void;
}

export function SettingsMenu({ settings, onUpdateSettings, onNavigate }: SettingsMenuProps) {
  return (
    <div className="relative size-full flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <FloatingPanel className="p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onNavigate('home')}
              className="w-10 h-10 text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-2xl text-white">Settings</h2>
          </div>

          {/* Audio Settings */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="h-5 w-5 text-blue-400" />
                <Label htmlFor="music" className="text-white">Music</Label>
              </div>
              <Switch
                id="music"
                checked={settings.music}
                onCheckedChange={(checked) => onUpdateSettings({ music: checked })}
              />
            </div>

            {/* Particle Effects */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-cyan-400" />
                <Label htmlFor="effects" className="text-white">Particle Effects</Label>
              </div>
              <Switch
                id="effects"
                checked={settings.particleEffects}
                onCheckedChange={(checked) => onUpdateSettings({ particleEffects: checked })}
              />
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-green-400" />
                <Label className="text-white">Difficulty</Label>
              </div>
              <Select
                value={settings.difficulty}
                onValueChange={(value: 'easy' | 'normal' | 'hard') => 
                  onUpdateSettings({ difficulty: value })
                }
              >
                <SelectTrigger className="w-full bg-black/30 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Scientific vs Arcade Mode */}
            <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <Gamepad2 className="h-5 w-5 text-purple-400" />
                <Label className="text-white">Game Mode</Label>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">
                    {settings.scientificMode ? 'Scientific Mode' : 'Arcade Mode'}
                  </span>
                  <Switch
                    checked={settings.scientificMode}
                    onCheckedChange={(checked) => onUpdateSettings({ scientificMode: checked })}
                  />
                </div>
                
                <p className="text-xs text-gray-400 leading-relaxed">
                  {settings.scientificMode 
                    ? 'Realistic atomic bonding with accurate chemical formulas and physics.'
                    : 'Simplified gameplay with visual cues and casual interaction mechanics.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8">
            <Button
              variant="outline"
              onClick={() => onNavigate('home')}
              className="flex-1 border-gray-600 text-gray-300 hover:text-white hover:border-white/30"
            >
              Back to Menu
            </Button>
            <Button
              onClick={() => onNavigate('gameplay')}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500"
            >
              Play Game
            </Button>
          </div>
        </FloatingPanel>
      </motion.div>
    </div>
  );
}