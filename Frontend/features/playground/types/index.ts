export interface PlaygroundDemo {
  id: string;
  title: string;
  description: string;
  category: 'components' | 'animations' | 'layouts' | 'forms' | 'data' | 'utilities';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  component: React.ComponentType;
  codeExample?: string;
  isActive: boolean;
}

export interface PlaygroundSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  demos: PlaygroundDemo[];
  color: string;
}

export interface PlaygroundStats {
  totalDemos: number;
  categoriesCount: number;
  activeComponents: number;
  lastUpdated: string;
}

export type PlaygroundTheme = 'light' | 'dark' | 'auto';

export interface PlaygroundSettings {
  theme: PlaygroundTheme;
  showCode: boolean;
  autoRefresh: boolean;
  gridView: boolean;
}
