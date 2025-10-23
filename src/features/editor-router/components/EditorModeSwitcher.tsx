import React from 'react';
import { Button } from '@/components/ui/button';
import { Monitor, Layers, Settings } from 'lucide-react';
import { useEditorRouter, EditorMode } from '../index';

interface EditorModeSwitcherProps {
  className?: string;
}

export const EditorModeSwitcher: React.FC<EditorModeSwitcherProps> = ({ className = '' }) => {
  const { currentMode, setCurrentMode, availableModes } = useEditorRouter();

  const modeConfig = {
    simple: {
      icon: Monitor,
      label: 'Simple Editor',
      description: 'Single frame editing'
    },
    advanced: {
      icon: Layers,
      label: 'Advanced Editor',
      description: 'Multi-frame board editing'
    },
    expert: {
      icon: Settings,
      label: 'Expert Editor',
      description: 'Professional features (Coming Soon)'
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      {availableModes.map((mode) => {
        const config = modeConfig[mode];
        const Icon = config.icon;
        const isActive = currentMode === mode;
        const isDisabled = mode === 'expert'; // Expert mode not yet implemented

        return (
          <Button
            key={mode}
            onClick={() => !isDisabled && setCurrentMode(mode)}
            disabled={isDisabled}
            className={`flex items-center gap-2 px-4 py-2 ${
              isActive 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-background text-foreground hover:bg-muted'
            } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            variant={isActive ? 'default' : 'outline'}
            title={config.description}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{config.label}</span>
          </Button>
        );
      })}
    </div>
  );
};
