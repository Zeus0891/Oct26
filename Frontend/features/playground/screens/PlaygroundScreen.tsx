'use client';

import React, { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { 
  Code2, 
  Palette, 
  Zap, 
  Layout, 
  Search,
  Grid3X3,
  List,
  Settings,
  Play,
  Sparkles,
  Rocket,
  Heart
} from 'lucide-react';
import { NeomorphicShowcase } from '../demos/NeomorphicShowcase';
import { AnimationShowcase } from '../demos/AnimationShowcase';

type DemoCategory = 'all' | 'components' | 'animations' | 'layouts' | 'forms';

interface Demo {
  id: string;
  title: string;
  description: string;
  category: DemoCategory;
  component: React.ComponentType;
  icon: React.ComponentType<{ className?: string }>;
}

export function PlaygroundScreen() {
  const [activeDemo, setActiveDemo] = useState<string>('neomorphic');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DemoCategory>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const demos: Demo[] = [
    {
      id: 'neomorphic',
      title: 'Neumorphic Components',
      description: 'Showcase of soft UI elements with depth and shadows',
      category: 'components',
      component: NeomorphicShowcase,
      icon: Palette
    },
    {
      id: 'animations',
      title: 'Animation Library',
      description: 'Interactive animations and micro-interactions',
      category: 'animations',
      component: AnimationShowcase,
      icon: Zap
    }
  ];

  const categories = [
    { id: 'all', label: 'All Demos', icon: Layout },
    { id: 'components', label: 'Components', icon: Code2 },
    { id: 'animations', label: 'Animations', icon: Zap },
    { id: 'layouts', label: 'Layouts', icon: Layout },
    { id: 'forms', label: 'Forms', icon: Settings }
  ];

  const filteredDemos = demos.filter(demo => {
    const matchesSearch = demo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         demo.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || demo.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const activeComponent = demos.find(demo => demo.id === activeDemo)?.component;
  const ActiveComponent = activeComponent || NeomorphicShowcase;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="neomorphic-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 neomorphic-button flex items-center justify-center">
              <Code2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Playground
              </h1>
              <p className="text-muted-foreground mt-1">Experiment with components and interactions</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="neomorphic-button"
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" className="neomorphic-button">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="neomorphic-stats p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 neomorphic-button flex items-center justify-center">
              <Code2 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{demos.length}</div>
              <p className="text-xs text-muted-foreground">Total Demos</p>
            </div>
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            Available Components
          </div>
        </div>

        <div className="neomorphic-stats p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 neomorphic-button flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">12</div>
              <p className="text-xs text-muted-foreground">Animations</p>
            </div>
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            Interactive Effects
          </div>
        </div>

        <div className="neomorphic-stats p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 neomorphic-button flex items-center justify-center">
              <Palette className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">8</div>
              <p className="text-xs text-muted-foreground">Themes</p>
            </div>
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            Design Variations
          </div>
        </div>

        <div className="neomorphic-stats p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 neomorphic-button flex items-center justify-center">
              <Heart className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">100%</div>
              <p className="text-xs text-muted-foreground">Responsive</p>
            </div>
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            Mobile Ready
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="neomorphic-card p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search demos and components..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="neomorphic-input pl-12 h-12"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory(category.id as DemoCategory)}
                  className={`neomorphic-button ${
                    selectedCategory === category.id ? 'neomorphic-primary' : ''
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {category.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Demo List */}
        <div className="lg:col-span-1">
          <div className="neomorphic-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Available Demos</h3>
            <div className="space-y-3">
              {filteredDemos.map((demo) => {
                const Icon = demo.icon;
                return (
                  <div
                    key={demo.id}
                    onClick={() => setActiveDemo(demo.id)}
                    className={`neomorphic-button p-4 cursor-pointer hover:scale-[1.02] transition-all duration-200 ${
                      activeDemo === demo.id ? 'neomorphic-primary' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 neomorphic-button rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground text-sm">{demo.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {demo.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Demo Content */}
        <div className="lg:col-span-3">
          <div className="neomorphic-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 neomorphic-button flex items-center justify-center">
                  <Play className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {demos.find(d => d.id === activeDemo)?.title || 'Demo'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {demos.find(d => d.id === activeDemo)?.description || 'Interactive demonstration'}
                  </p>
                </div>
              </div>
              <Button className="neomorphic-primary">
                <Rocket className="h-4 w-4 mr-2" />
                Run Demo
              </Button>
            </div>
            
            <div className="border border-border/50 rounded-2xl p-6 bg-gradient-to-br from-background/50 to-background">
              <ActiveComponent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
