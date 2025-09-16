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
              {content.buildPage.headline}
            </h1>
            <p className="text-xl md:text-2xl text-accent/90 leading-relaxed max-w-3xl mx-auto">
              {content.buildPage.subHeadline}
            </p>
          </div>

          <div className="space-y-8">
            {/* Unified AI Builder Form */}
            <Card className="max-w-6xl mx-auto glass-cyber hover-cyber" data-testid="card-ai-builder">
              <CardHeader>
                <CardTitle className="text-2xl font-display gradient-text-cyber">
                  AI Model Builder
                </CardTitle>
                
              </CardHeader>
              <CardContent className="space-y-8">
                
                {/* Available Building Blocks */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">{content.buildPage.sections.blocks.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{content.buildPage.sections.blocks.description}</p>
                    </div>
                    
                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {categories.map((category) => (
                        <Button
                          key={category.id}
                          variant={activeCategory === category.id ? "default" : "ghost"}
                          className={`${
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
                    </div>

                    {/* Available Blocks Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {filteredBlocks.map((block) => (
                        <div key={block.id} 
                             className="glass-panel p-4 rounded-xl border border-primary/20 cursor-move hover:border-primary/40 transition-colors group"
                             data-testid={`available-block-${block.id}`}>
                          <div className="text-center space-y-3">
                            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                              <block.icon className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <div>
                              <h5 className="font-medium text-sm">{block.title}</h5>
                              <p className="text-xs text-foreground/70 line-clamp-2 mt-1">{block.description}</p>
                              <Badge className="mt-2 text-xs" variant="outline">{block.category}</Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pipeline Builder */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">{content.buildPage.sections.pipeline.title}</h3>
                    <p className="text-sm text-muted-foreground">{content.buildPage.sections.pipeline.description}</p>
                  </div>
                  
                  <div className="min-h-64 p-8 bg-background/20 rounded-xl border border-primary/10 relative">
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
                  
                  
                </div>

                {/* Pipeline Preview */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">{content.buildPage.sections.preview.title}</h3>
                    <p className="text-sm text-muted-foreground">{content.buildPage.sections.preview.description}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
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
                    
                    {/* Start Pipeline Button */}
                    <div className="text-center">
                      <Button className="gradient-primary hover-cyber" data-testid="button-start-pipeline">
                        <Play className="w-4 h-4 mr-2" />
                        Start Pipeline
                      </Button>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}