'use client';

import React, { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { 
  Heart, 
  Star, 
  Download, 
  Share, 
  Settings, 
  Play, 
  Pause,
  SkipForward,
  Volume2
} from 'lucide-react';

export function NeomorphicShowcase() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [liked, setLiked] = useState(false);

  return (
    <div className="space-y-8">
      {/* Music Player Card */}
      <div className="neomorphic-card p-8">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 neomorphic-button rounded-2xl flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-400">
            <div className="text-white text-2xl font-bold">♪</div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground mb-2">Neumorphic Beats</h3>
            <p className="text-muted-foreground mb-4">Soft UI Soundscape</p>
            
            <div className="flex items-center space-x-4 mb-4">
              <Button
                variant="ghost"
                size="sm"
                className="neomorphic-button"
                onClick={() => setLiked(!liked)}
              >
                <Heart className={`h-5 w-5 ${liked ? 'text-red-500 fill-current' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm" className="neomorphic-button">
                <Share className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="neomorphic-button">
                <Download className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="neomorphic-button">
                <SkipForward className="h-4 w-4 rotate-180" />
              </Button>
              <Button
                className="neomorphic-primary w-12 h-12 rounded-full"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
              </Button>
              <Button variant="ghost" size="sm" className="neomorphic-button">
                <SkipForward className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center space-x-2 ml-8">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <div className="w-20 h-2 neomorphic-button rounded-full relative">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-200"
                    style={{ width: `${volume}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Buttons Grid */}
      <div className="neomorphic-card p-8">
        <h3 className="text-xl font-bold text-foreground mb-6">Interactive Elements</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="neomorphic-button p-6 text-center group cursor-pointer hover:scale-105 transition-transform duration-200">
            <div className="w-12 h-12 neomorphic-button rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
              <Star className="h-6 w-6 text-yellow-500" />
            </div>
            <p className="text-sm font-medium text-foreground">Favorite</p>
          </div>
          
          <div className="neomorphic-button p-6 text-center group cursor-pointer hover:scale-105 transition-transform duration-200">
            <div className="w-12 h-12 neomorphic-button rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
              <Settings className="h-6 w-6 text-blue-500" />
            </div>
            <p className="text-sm font-medium text-foreground">Settings</p>
          </div>
          
          <div className="neomorphic-button p-6 text-center group cursor-pointer hover:scale-105 transition-transform duration-200">
            <div className="w-12 h-12 neomorphic-button rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
              <Download className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-sm font-medium text-foreground">Download</p>
          </div>
          
          <div className="neomorphic-button p-6 text-center group cursor-pointer hover:scale-105 transition-transform duration-200">
            <div className="w-12 h-12 neomorphic-button rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
              <Share className="h-6 w-6 text-purple-500" />
            </div>
            <p className="text-sm font-medium text-foreground">Share</p>
          </div>
        </div>
      </div>

      {/* Form Elements */}
      <div className="neomorphic-card p-8">
        <h3 className="text-xl font-bold text-foreground mb-6">Form Elements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Neumorphic Input
            </label>
            <Input
              placeholder="Type something..."
              className="neomorphic-input"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Range Slider
            </label>
            <div className="neomorphic-input p-4">
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <Button className="neomorphic-primary mr-4">
            Primary Action
          </Button>
          <Button variant="ghost" className="neomorphic-button">
            Secondary Action
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="neomorphic-stats p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 neomorphic-button flex items-center justify-center">
              <Star className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">4.9</div>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            User Experience
          </div>
        </div>
        
        <div className="neomorphic-stats p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 neomorphic-button flex items-center justify-center">
              <Download className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">1.2K</div>
              <p className="text-xs text-muted-foreground">Downloads</p>
            </div>
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            This Month
          </div>
        </div>
        
        <div className="neomorphic-stats p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 neomorphic-button flex items-center justify-center">
              <Heart className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">98%</div>
              <p className="text-xs text-muted-foreground">Satisfaction</p>
            </div>
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            User Feedback
          </div>
        </div>
      </div>
    </div>
  );
}
