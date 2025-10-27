'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui';
import { 
  Zap, 
  Sparkles, 
  Rocket, 
  Target,
  RefreshCw,
  Play
} from 'lucide-react';

export function AnimationShowcase() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [pulseActive, setPulseActive] = useState(false);
  const [bounceActive, setBounceActive] = useState(false);

  const triggerAnimation = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Pulse Animation */}
      <div className="neomorphic-card p-8">
        <h3 className="text-xl font-bold text-foreground mb-6">Pulse Animation</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className={`w-16 h-16 neomorphic-button rounded-full flex items-center justify-center ${
              pulseActive ? 'animate-pulse' : ''
            }`}>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Click to activate pulse effect</p>
              <p className="text-xs text-muted-foreground mt-1">Neumorphic element with CSS animation</p>
            </div>
          </div>
          <Button
            onClick={() => setPulseActive(!pulseActive)}
            className="neomorphic-primary"
          >
            {pulseActive ? 'Stop' : 'Start'} Pulse
          </Button>
        </div>
      </div>

      {/* Bounce Animation */}
      <div className="neomorphic-card p-8">
        <h3 className="text-xl font-bold text-foreground mb-6">Bounce Animation</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className={`w-16 h-16 neomorphic-button rounded-full flex items-center justify-center ${
              bounceActive ? 'animate-bounce' : ''
            }`}>
              <Rocket className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bouncing neumorphic element</p>
              <p className="text-xs text-muted-foreground mt-1">Smooth bounce animation with shadows</p>
            </div>
          </div>
          <Button
            onClick={() => setBounceActive(!bounceActive)}
            className="neomorphic-primary"
          >
            {bounceActive ? 'Stop' : 'Start'} Bounce
          </Button>
        </div>
      </div>

      {/* Spin Animation */}
      <div className="neomorphic-card p-8">
        <h3 className="text-xl font-bold text-foreground mb-6">Spin Animation</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className={`w-16 h-16 neomorphic-button rounded-full flex items-center justify-center ${
              isAnimating ? 'animate-spin' : ''
            }`}>
              <RefreshCw className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Spinning refresh icon</p>
              <p className="text-xs text-muted-foreground mt-1">2-second spin animation</p>
            </div>
          </div>
          <Button
            onClick={triggerAnimation}
            disabled={isAnimating}
            className="neomorphic-primary"
          >
            <Play className="h-4 w-4 mr-2" />
            Trigger Spin
          </Button>
        </div>
      </div>

      {/* Hover Effects Grid */}
      <div className="neomorphic-card p-8">
        <h3 className="text-xl font-bold text-foreground mb-6">Hover Effects</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="neomorphic-button p-6 text-center group cursor-pointer hover:scale-110 transition-all duration-300">
            <Sparkles className="h-8 w-8 text-purple-500 mx-auto mb-2 group-hover:rotate-12 transition-transform duration-300" />
            <p className="text-sm font-medium">Scale + Rotate</p>
          </div>
          
          <div className="neomorphic-button p-6 text-center group cursor-pointer hover:-translate-y-2 transition-all duration-300">
            <Target className="h-8 w-8 text-red-500 mx-auto mb-2 group-hover:scale-125 transition-transform duration-300" />
            <p className="text-sm font-medium">Lift + Scale</p>
          </div>
          
          <div className="neomorphic-button p-6 text-center group cursor-pointer hover:shadow-2xl transition-all duration-300">
            <Zap className="h-8 w-8 text-yellow-500 mx-auto mb-2 group-hover:animate-pulse" />
            <p className="text-sm font-medium">Shadow + Pulse</p>
          </div>
          
          <div className="neomorphic-button p-6 text-center group cursor-pointer hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 transition-all duration-500">
            <Rocket className="h-8 w-8 text-blue-500 group-hover:text-white mx-auto mb-2 transition-colors duration-500" />
            <p className="text-sm font-medium group-hover:text-white transition-colors duration-500">Gradient Fill</p>
          </div>
        </div>
      </div>

      {/* Loading States */}
      <div className="neomorphic-card p-8">
        <h3 className="text-xl font-bold text-foreground mb-6">Loading States</h3>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 neomorphic-button rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">Pulsing loader</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 neomorphic-button rounded-full animate-spin border-2 border-transparent border-t-primary"></div>
            <span className="text-sm text-muted-foreground">Spinning loader</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex space-x-1">
              <div className="w-2 h-2 neomorphic-button rounded-full animate-bounce"></div>
              <div className="w-2 h-2 neomorphic-button rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 neomorphic-button rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm text-muted-foreground">Bouncing dots</span>
          </div>
        </div>
      </div>
    </div>
  );
}
