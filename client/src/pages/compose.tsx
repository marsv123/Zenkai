import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Plus, Brain, Database, Zap, Settings, Play, Layers, Code2, GitBranch, Sparkles, Workflow, Monitor, ArrowRight } from 'lucide-react';
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

                    {/* Enhanced Available Blocks Grid */}
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {filteredBlocks.length > 0 ? (
                        filteredBlocks.map((block) => (
                          <div key={block.id} 
                               className="glass-panel p-5 rounded-xl border border-primary/20 cursor-move hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 group h-full"
                               data-testid={`available-block-${block.id}`}>
                            <div className="text-center space-y-4 h-full flex flex-col">
                              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                <block.icon className="w-6 h-6 text-primary-foreground" />
                              </div>
                              <div className="flex-1">
                                <h5 className="font-semibold text-sm mb-2 line-clamp-1">{block.title}</h5>
                                <p className="text-xs text-foreground/70 line-clamp-3 leading-relaxed mb-3">{block.description}</p>
                                <Badge 
                                  className={`text-xs ${
                                    block.category === 'input' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700' :
                                    block.category === 'processing' ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-700' :
                                    block.category === 'output' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700' :
                                    'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700'
                                  }`}
                                  variant="outline"
                                >
                                  {block.category}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        // Coming Soon Placeholders
                        <div className="col-span-full">
                          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((index) => (
                              <div key={`placeholder-${index}`} 
                                   className="glass-panel p-5 rounded-xl border border-border/30 h-full opacity-60"
                                   data-testid={`placeholder-block-${index}`}>
                                <div className="text-center space-y-4 h-full flex flex-col">
                                  <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto">
                                    <Sparkles className="w-6 h-6 text-muted-foreground" />
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="font-semibold text-sm mb-2 text-muted-foreground">Coming Soon</h5>
                                    <p className="text-xs text-muted-foreground/70 line-clamp-3 leading-relaxed mb-3">
                                      New AI building blocks for {activeCategory !== 'all' ? activeCategory : 'all categories'} are being developed
                                    </p>
                                    <Badge className="text-xs bg-muted/50 text-muted-foreground border-muted" variant="outline">
                                      In Development
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Enhanced Pipeline Builder */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center">
                      <Workflow className="w-5 h-5 mr-2 text-primary" />
                      {content.buildPage.sections.pipeline.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{content.buildPage.sections.pipeline.description}</p>
                  </div>
                  
                  <div className="min-h-80 p-8 bg-gradient-to-br from-background/30 via-primary/5 to-background/30 rounded-xl border border-primary/20 relative overflow-hidden">
                    {/* Pipeline Flow */}
                    <div className="relative z-10">
                      <div className="flex flex-col gap-8 items-center justify-center min-h-64">
                        <div className="flex flex-wrap gap-8 items-center justify-center">
                          <PipelineBlock 
                            title="Data Input" 
                            description="Dataset loader"
                            icon={Database}
                            category="input"
                            isConnected={true}
                          />
                          <div className="hidden md:flex items-center">
                            <div className="w-12 h-0.5 bg-gradient-to-r from-primary to-secondary animate-pulse"></div>
                            <ArrowRight className="w-6 h-6 text-primary mx-2" />
                            <div className="w-12 h-0.5 bg-gradient-to-r from-secondary to-accent animate-pulse"></div>
                          </div>
                          <PipelineBlock 
                            title="Neural Network" 
                            description="Deep learning model"
                            icon={Brain}
                            category="processing"
                            isConnected={true}
                          />
                          <div className="hidden md:flex items-center">
                            <div className="w-12 h-0.5 bg-gradient-to-r from-secondary to-accent animate-pulse"></div>
                            <ArrowRight className="w-6 h-6 text-secondary mx-2" />
                            <div className="w-12 h-0.5 bg-gradient-to-r from-accent to-primary animate-pulse"></div>
                          </div>
                          <PipelineBlock 
                            title="API Output" 
                            description="Model predictions"
                            icon={Code2}
                            category="output"
                          />
                        </div>
                        
                        {/* Pipeline Stats */}
                        <div className="flex items-center space-x-6 mt-6 text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                            <span className="text-muted-foreground">Data Flow: Active</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                            <span className="text-muted-foreground">Processing: Ready</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                            <span className="text-muted-foreground">Output: Configured</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Drop Zone Indicator */}
                    <div className="absolute inset-6 border-2 border-dashed border-primary/20 rounded-xl pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center bg-primary/5">
                      <div className="text-center">
                        <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                          <Plus className="w-8 h-8 text-primary-foreground" />
                        </div>
                        <p className="text-primary font-medium mb-2">Drop AI Blocks Here</p>
                        <p className="text-sm text-primary/70">Drag blocks from above to customize your pipeline</p>
                      </div>
                    </div>
                    
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
                      <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-accent/20 rounded-full blur-2xl"></div>
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