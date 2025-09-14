import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Plus, Brain, Database, Zap, Settings, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Pipeline Block Component
function PipelineBlock({ title, description, icon: Icon, isConnected = false }: { 
  title: string; 
  description: string; 
  icon: any; 
  isConnected?: boolean;
}) {
  return (
    <div className="relative">
      <div className="glass-cyber hover-cyber p-6 rounded-2xl border border-primary/30 group cursor-pointer transition-all duration-500"
           data-testid={`block-${title.toLowerCase().replace(/\s+/g, '-')}`}>
        <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Icon className="w-6 h-6 text-primary-foreground" />
        </div>
        <h4 className="text-lg font-semibold gradient-text-cyber mb-2">{title}</h4>
        <p className="text-sm text-foreground/70">{description}</p>
      </div>
      {isConnected && (
        <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-8 h-0.5 bg-primary/50"></div>
      )}
    </div>
  );
}

export default function ComposePage() {
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>(['data-input', 'neural-network']);

  const availableBlocks = [
    { id: 'data-input', title: 'Data Input', description: 'Load and preprocess data', icon: Database },
    { id: 'neural-network', title: 'Neural Network', description: 'Core ML architecture', icon: Brain },
    { id: 'optimizer', title: 'Optimizer', description: 'Training optimization', icon: Zap },
    { id: 'hyperparams', title: 'Hyperparameters', description: 'Model configuration', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-primary/20 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold gradient-text-cyber">Compose Your AI</h1>
          <Button className="gradient-primary hover-cyber" data-testid="button-run-pipeline">
            <Play className="w-4 h-4 mr-2" />
            Run Pipeline
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Available Blocks */}
          <Card className="glass-cyber border-primary/30">
            <CardHeader>
              <CardTitle className="gradient-text-cyber">Available Blocks</CardTitle>
              <CardDescription>Drag and drop to build your pipeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availableBlocks.map((block) => (
                  <div key={block.id} className="glass-panel p-4 rounded-xl border border-primary/20 cursor-pointer hover:border-primary/40 transition-colors"
                       data-testid={`available-block-${block.id}`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                        <block.icon className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div>
                        <h5 className="font-medium">{block.title}</h5>
                        <p className="text-sm text-foreground/70">{block.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full border-primary/30 hover:border-primary/50 hover-cyber"
                        data-testid="button-add-custom-block">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Custom Block
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pipeline Canvas */}
          <div className="lg:col-span-2">
            <Card className="glass-cyber border-primary/30 h-full">
              <CardHeader>
                <CardTitle className="gradient-text-cyber">Pipeline Canvas</CardTitle>
                <CardDescription>Your AI model architecture</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="min-h-96 p-8 bg-background/20 rounded-xl border border-primary/10">
                  {/* Pipeline Flow */}
                  <div className="flex flex-wrap gap-6 items-center justify-center">
                    <PipelineBlock 
                      title="Data Input" 
                      description="Dataset loader"
                      icon={Database}
                      isConnected={true}
                    />
                    <PipelineBlock 
                      title="Neural Network" 
                      description="Deep learning model"
                      icon={Brain}
                      isConnected={true}
                    />
                    <PipelineBlock 
                      title="Output Layer" 
                      description="Model predictions"
                      icon={Zap}
                    />
                  </div>
                  
                  {/* Pipeline Stats */}
                  <div className="mt-12 grid grid-cols-3 gap-4">
                    <div className="text-center p-4 glass-panel rounded-xl">
                      <div className="text-2xl font-bold gradient-text-cyber">3</div>
                      <div className="text-sm text-foreground/70">Blocks</div>
                    </div>
                    <div className="text-center p-4 glass-panel rounded-xl">
                      <div className="text-2xl font-bold gradient-text-cyber">2.1M</div>
                      <div className="text-sm text-foreground/70">Parameters</div>
                    </div>
                    <div className="text-center p-4 glass-panel rounded-xl">
                      <div className="text-2xl font-bold gradient-text-cyber">~5min</div>
                      <div className="text-sm text-foreground/70">Est. Training</div>
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