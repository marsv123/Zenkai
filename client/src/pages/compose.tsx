import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Plus, Brain, Database, Zap, Settings, Play, Layers, Code2, GitBranch, Sparkles, Workflow, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import content from '@/lib/config/content.json';

// Enhanced Pipeline Block Component
function PipelineBlock({ title, description, icon: Icon, isConnected = false, category = 'default' }: { 
  title: string; 
  description: string; 
  icon: any; 
  isConnected?: boolean;
  category?: string;
}) {
  const categoryColors = {
    'input': 'text-primary border-primary/30',
    'processing': 'text-secondary border-secondary/30',
    'output': 'text-accent border-accent/30',
    'default': 'text-primary border-primary/30'
  };

  return (
    <div className="relative">
      <div className={`glass-cyber hover-cyber p-6 rounded-2xl border group cursor-pointer transition-all duration-500 ${categoryColors[category as keyof typeof categoryColors]}`}
           data-testid={`block-${title.toLowerCase().replace(/\s+/g, '-')}`}>
        <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Icon className="w-6 h-6 text-primary-foreground" />
        </div>
        <h4 className="text-lg font-semibold gradient-text-cyber mb-2">{title}</h4>
        <p className="text-sm text-foreground/70">{description}</p>
        <Badge className="mt-2 text-xs" variant="outline">{category}</Badge>
      </div>
      {isConnected && (
        <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-8 h-0.5 bg-gradient-to-r from-primary to-secondary animate-pulse"></div>
      )}
    </div>
  );
}

export default function ComposePage() {
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>(['data-input', 'neural-network']);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const availableBlocks = [
    { id: 'data-input', title: content.buildPage.blocks.dataInput, description: content.buildPage.blocks.dataInputDesc, icon: Database, category: 'input' },
    { id: 'neural-network', title: content.buildPage.blocks.neuralNetwork, description: content.buildPage.blocks.neuralNetworkDesc, icon: Brain, category: 'processing' },
    { id: 'optimizer', title: content.buildPage.blocks.optimizer, description: content.buildPage.blocks.optimizerDesc, icon: Zap, category: 'processing' },
    { id: 'hyperparams', title: content.buildPage.blocks.hyperparams, description: content.buildPage.blocks.hyperparamsDesc, icon: Settings, category: 'processing' },
    { id: 'layers', title: 'Custom Layers', description: 'Add specialized neural network layers', icon: Layers, category: 'processing' },
    { id: 'preprocessing', title: 'Data Preprocessing', description: 'Clean and transform input data', icon: Workflow, category: 'input' },
    { id: 'visualization', title: 'Model Visualization', description: 'Monitor and visualize model performance', icon: Monitor, category: 'output' },
    { id: 'api-output', title: 'API Output', description: 'Export model as REST API', icon: Code2, category: 'output' },
  ];

  const categories = [
    { id: 'all', name: 'All Blocks', icon: Sparkles },
    { id: 'input', name: 'Input', icon: Database },
    { id: 'processing', name: 'Processing', icon: Brain },
    { id: 'output', name: 'Output', icon: GitBranch }
  ];

  const filteredBlocks = activeCategory === 'all' 
    ? availableBlocks 
    : availableBlocks.filter(block => block.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12" data-testid="build-header">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 gradient-text-cyber">
              <Brain className="w-10 h-10 md:w-12 md:h-12 mr-4 text-primary hover:scale-110 transition-transform duration-300 inline-block" data-testid="icon-build" />
              {content.buildPage.headline}
            </h1>
            <p className="text-xl md:text-2xl text-accent/90 leading-relaxed max-w-3xl mx-auto">
              {content.buildPage.subHeadline}
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            
            {/* Left Column: Block Library */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Category Filter */}
              <Card className="glass-cyber hover-cyber" data-testid="card-categories">
                <CardHeader>
                  <CardTitle className="text-lg font-display gradient-text-cyber flex items-center">
                    <Layers className="w-5 h-5 mr-2 text-primary" />
                    {content.buildPage.sections.blocks.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {content.buildPage.sections.blocks.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={activeCategory === category.id ? "default" : "ghost"}
                      className={`w-full justify-start ${
                        activeCategory === category.id 
                          ? 'gradient-primary hover-cyber text-primary-foreground' 
                          : 'hover:bg-muted/20'
                      }`}
                      onClick={() => setActiveCategory(category.id)}
                      data-testid={`category-${category.id}`}
                    >
                      <category.icon className="w-4 h-4 mr-2" />
                      {category.name}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {/* Available Blocks */}
              <Card className="glass-cyber hover-cyber" data-testid="card-blocks-library">
                <CardHeader>
                  <CardTitle className="text-lg font-display gradient-text-cyber">Available Blocks</CardTitle>
                  <CardDescription>Drag blocks to the canvas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredBlocks.map((block) => (
                      <div key={block.id} 
                           className="glass-panel p-3 rounded-xl border border-primary/20 cursor-move hover:border-primary/40 transition-colors group"
                           data-testid={`available-block-${block.id}`}>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <block.icon className="w-4 h-4 text-primary-foreground" />
                          </div>
                          <div className="min-w-0">
                            <h5 className="font-medium text-sm truncate">{block.title}</h5>
                            <p className="text-xs text-foreground/70 line-clamp-2">{block.description}</p>
                            <Badge className="mt-1 text-xs" variant="outline">{block.category}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Center Column: Pipeline Canvas */}
            <div className="lg:col-span-2">
              <Card className="glass-cyber hover-cyber h-full" data-testid="card-pipeline-canvas">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-display gradient-text-cyber flex items-center">
                        <Workflow className="w-6 h-6 mr-2 text-primary" />
                        {content.buildPage.sections.pipeline.title}
                      </CardTitle>
                      <CardDescription>
                        {content.buildPage.sections.pipeline.description}
                      </CardDescription>
                    </div>
                    <Button className="gradient-primary hover-cyber" data-testid="button-run-pipeline">
                      <Play className="w-4 h-4 mr-2" />
                      Test Pipeline
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="min-h-96 p-8 bg-background/20 rounded-xl border border-primary/10 relative">
                    {/* Pipeline Flow */}
                    <div className="flex flex-col gap-8 items-center justify-center">
                      <div className="flex flex-wrap gap-6 items-center justify-center">
                        <PipelineBlock 
                          title="Data Input" 
                          description="Dataset loader"
                          icon={Database}
                          category="input"
                          isConnected={true}
                        />
                        <PipelineBlock 
                          title="Neural Network" 
                          description="Deep learning model"
                          icon={Brain}
                          category="processing"
                          isConnected={true}
                        />
                        <PipelineBlock 
                          title="API Output" 
                          description="Model predictions"
                          icon={Code2}
                          category="output"
                        />
                      </div>
                    </div>

                    {/* Drop Zone Indicator */}
                    <div className="absolute inset-4 border-2 border-dashed border-primary/20 rounded-xl pointer-events-none opacity-0 transition-opacity duration-300 flex items-center justify-center">
                      <div className="text-center">
                        <Plus className="w-8 h-8 mx-auto text-primary/40 mb-2" />
                        <p className="text-sm text-primary/40">Drop blocks here to build your AI</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Preview & Stats */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Pipeline Preview */}
              <Card className="glass-cyber hover-cyber" data-testid="card-pipeline-preview">
                <CardHeader>
                  <CardTitle className="text-lg font-display gradient-text-cyber flex items-center">
                    <Monitor className="w-5 h-5 mr-2 text-primary" />
                    {content.buildPage.sections.preview.title}
                  </CardTitle>
                  <CardDescription>
                    {content.buildPage.sections.preview.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 glass-panel rounded-xl">
                      <div className="flex items-center">
                        <Layers className="w-4 h-4 mr-2 text-primary" />
                        <span className="text-sm font-medium">Blocks</span>
                      </div>
                      <span className="text-lg font-bold gradient-text-cyber">3</span>
                    </div>
                    <div className="flex items-center justify-between p-3 glass-panel rounded-xl">
                      <div className="flex items-center">
                        <Settings className="w-4 h-4 mr-2 text-secondary" />
                        <span className="text-sm font-medium">Parameters</span>
                      </div>
                      <span className="text-lg font-bold text-secondary">2.1M</span>
                    </div>
                    <div className="flex items-center justify-between p-3 glass-panel rounded-xl">
                      <div className="flex items-center">
                        <Zap className="w-4 h-4 mr-2 text-accent" />
                        <span className="text-sm font-medium">Est. Time</span>
                      </div>
                      <span className="text-lg font-bold text-accent">~5min</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card className="glass-cyber hover-cyber">
                <CardContent className="p-6 space-y-4">
                  <Button className="w-full gradient-primary hover-cyber font-display font-semibold" 
                          data-testid="button-start-building">
                    <Sparkles className="w-4 h-4 mr-2" />
                    {content.buildPage.button}
                  </Button>
                  <Button variant="outline" 
                          className="w-full border-primary/30 hover:border-primary/50 hover-cyber"
                          data-testid="button-save-template">
                    Save as Template
                  </Button>
                  <Button variant="ghost" 
                          className="w-full hover:bg-muted/20"
                          data-testid="button-load-template">
                    Load Template
                  </Button>
                </CardContent>
              </Card>

              {/* Next Step Preview */}
              <Card className="glass-cyber hover-cyber border-secondary/30">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <Play className="w-8 h-8 mx-auto text-secondary mb-2" />
                    <h4 className="font-display font-semibold gradient-text-cyber">Next: Training</h4>
                    <p className="text-sm text-muted-foreground">
                      Train your AI model with datasets
                    </p>
                  </div>
                  <Badge className="bg-secondary/10 text-secondary border-secondary/20">
                    Coming Next →
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}