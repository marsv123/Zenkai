import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Play, Brain, Database, TrendingUp, Clock, Zap, TestTube2, Link as LinkIcon, Settings, FlaskConical, Activity, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import content from '@/lib/config/content.json';

interface Dataset {
  id: string;
  name: string;
  size: string;
  category: string;
  price: string;
}

interface Model {
  id: string;
  name: string;
  architecture: string;
  blocks: number;
  status: 'draft' | 'ready' | 'training';
}

export default function TrainPage() {
  const [selectedDataset, setSelectedDataset] = useState<string>('dataset-1');
  const [selectedModel, setSelectedModel] = useState<string>('model-1');
  const [isTraining, setIsTraining] = useState(false);
  const [isTestRun, setIsTestRun] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [trainingStatus, setTrainingStatus] = useState<'idle' | 'preparing' | 'training' | 'testing' | 'completed' | 'failed'>('idle');

  const mockDatasets: Dataset[] = [
    { id: 'dataset-1', name: 'E-commerce Reviews Dataset', size: '2.3 GB', category: 'Text Analysis', price: '50 ZAI' },
    { id: 'dataset-2', name: 'Financial Market Data', size: '1.8 GB', category: 'Time Series', price: '75 ZAI' },
    { id: 'dataset-3', name: 'Medical Image Collection', size: '5.1 GB', category: 'Computer Vision', price: '120 ZAI' },
    { id: 'dataset-4', name: 'Social Media Sentiment', size: '3.2 GB', category: 'NLP', price: '60 ZAI' },
  ];

  const mockModels: Model[] = [
    { id: 'model-1', name: 'Text Classifier v1', architecture: 'BERT-based', blocks: 12, status: 'ready' },
    { id: 'model-2', name: 'Time Series Predictor', architecture: 'LSTM', blocks: 8, status: 'ready' },
    { id: 'model-3', name: 'Image Recognition Model', architecture: 'ResNet-50', blocks: 15, status: 'draft' },
    { id: 'model-4', name: 'Sentiment Analyzer', architecture: 'Transformer', blocks: 24, status: 'ready' },
  ];

  const handleStartTraining = () => {
    setIsTraining(true);
    setIsTestRun(false);
    setTrainingProgress(0);
    setAccuracy(0);
    setTrainingStatus('preparing');
    
    // Simulate training progress
    setTimeout(() => setTrainingStatus('training'), 1000);
    
    const interval = setInterval(() => {
      setTrainingProgress((prev) => {
        const newProgress = prev + Math.random() * 8;
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          setTrainingStatus('completed');
          setAccuracy(85.7 + Math.random() * 10);
          return 100;
        }
        return newProgress;
      });
    }, 300);
  };

  const handleTestRun = () => {
    setIsTestRun(true);
    setIsTraining(false);
    setTrainingProgress(0);
    setTrainingStatus('testing');
    
    // Simulate quick test run
    const interval = setInterval(() => {
      setTrainingProgress((prev) => {
        const newProgress = prev + Math.random() * 15;
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsTestRun(false);
          setTrainingStatus('completed');
          setAccuracy(78.2 + Math.random() * 8);
          return 100;
        }
        return newProgress;
      });
    }, 150);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12" data-testid="train-header">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 gradient-text-cyber">
              {content.trainPage.headline}
            </h1>
            <p className="text-xl md:text-2xl text-accent/90 leading-relaxed max-w-3xl mx-auto">
              {content.trainPage.subHeadline}
            </p>
          </div>

          <div className="space-y-8">
            {/* Unified Training Form */}
            <Card className="max-w-6xl mx-auto glass-cyber hover-cyber" data-testid="card-training-form">
              <CardHeader>
                <CardTitle className="text-2xl font-display gradient-text-cyber">
                  AI Model Training
                </CardTitle>
                
              </CardHeader>
              <CardContent className="space-y-8">
                
                {/* Step 1: Select AI Model */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center">
                      <Brain className="w-5 h-5 mr-2 text-primary" />
                      Step 1: Select AI Model
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">Choose your AI model to train with datasets</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {mockModels.map((model) => (
                      <div
                        key={model.id}
                        className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                          selectedModel === model.id
                            ? 'border-primary/50 glass-panel bg-primary/5'
                            : 'border-primary/20 glass-panel hover:border-primary/30'
                        }`}
                        onClick={() => setSelectedModel(model.id)}
                        data-testid={`model-${model.id}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{model.name}</h4>
                          <Badge className={`text-xs ${
                            model.status === 'ready' ? 'bg-primary/10 text-primary border-primary/20' :
                            model.status === 'training' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                            'bg-muted/10 text-muted-foreground border-muted/20'
                          }`}>
                            {model.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-foreground/70 space-y-1">
                          <div>Architecture: {model.architecture}</div>
                          <div>Blocks: {model.blocks}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step 2: Select Dataset */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center">
                      <Database className="w-5 h-5 mr-2 text-secondary" />
                      Step 2: Select Dataset
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">{content.trainPage.sections.datasetSelection.description}</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {mockDatasets.map((dataset) => (
                      <div
                        key={dataset.id}
                        className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                          selectedDataset === dataset.id
                            ? 'border-secondary/50 glass-panel bg-secondary/5'
                            : 'border-border hover:border-secondary/30 glass-panel'
                        }`}
                        onClick={() => setSelectedDataset(dataset.id)}
                        data-testid={`dataset-${dataset.id}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{dataset.name}</h4>
                          <Badge className="bg-secondary/10 text-secondary border-secondary/20 text-xs">
                            {dataset.category}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-foreground/70">
                          <span>{dataset.size}</span>
                          <span className="text-primary font-medium">{dataset.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step 3: Training Configuration */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center">
                      <Settings className="w-5 h-5 mr-2 text-accent" />
                      Step 3: Training Configuration
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">{content.trainPage.sections.trainingConfig.description}</p>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-3 glass-panel rounded-xl">
                      <div className="flex items-center">
                        <Target className="w-4 h-4 mr-2 text-accent" />
                        <span className="text-sm font-medium">Epochs</span>
                      </div>
                      <span className="text-sm font-bold">10</span>
                    </div>
                    <div className="flex items-center justify-between p-3 glass-panel rounded-xl">
                      <div className="flex items-center">
                        <Zap className="w-4 h-4 mr-2 text-primary" />
                        <span className="text-sm font-medium">Batch Size</span>
                      </div>
                      <span className="text-sm font-bold">32</span>
                    </div>
                    <div className="flex items-center justify-between p-3 glass-panel rounded-xl">
                      <div className="flex items-center">
                        <Activity className="w-4 h-4 mr-2 text-secondary" />
                        <span className="text-sm font-medium">Learning Rate</span>
                      </div>
                      <span className="text-sm font-bold">0.001</span>
                    </div>
                  </div>
                </div>

                {/* Step 4: Performance Monitoring */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-primary" />
                        Step 4: Performance Monitoring
                      </h3>
                      <p className="text-sm text-muted-foreground">{content.trainPage.sections.performance.description}</p>
                    </div>
                    <Badge className={`${
                      trainingStatus === 'idle' ? 'bg-muted/10 text-muted-foreground border-muted/20' :
                      trainingStatus === 'preparing' ? 'bg-accent/10 text-accent border-accent/20' :
                      trainingStatus === 'training' ? 'bg-primary/10 text-primary border-primary/20' :
                      trainingStatus === 'testing' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                      trainingStatus === 'completed' ? 'bg-primary/10 text-primary border-primary/20' :
                      'bg-destructive/10 text-destructive border-destructive/20'
                    } animate-pulse`}>
                      {content.trainPage.status[trainingStatus]}
                    </Badge>
                  </div>

                  {/* Training Buttons */}
                  <div className="flex items-center space-x-4 mb-6">
                    <Button 
                      className="gradient-primary hover-cyber flex-1" 
                      disabled={isTraining || isTestRun}
                      onClick={handleStartTraining}
                      data-testid="button-start-training"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {content.trainPage.button}
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-secondary/30 hover:border-secondary/50 hover-cyber text-secondary flex-1" 
                      disabled={isTraining || isTestRun}
                      onClick={handleTestRun}
                      data-testid="button-test-run"
                    >
                      <TestTube2 className="w-4 h-4 mr-2" />
                      {content.trainPage.testButton}
                    </Button>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {isTestRun ? 'Test Progress' : 'Training Progress'}
                      </span>
                      <span className="text-sm text-foreground/70">{Math.round(trainingProgress)}%</span>
                    </div>
                    <Progress value={trainingProgress} className="h-3" />
                  </div>

                  {/* Enhanced Training Stats - Always Show Values */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 glass-panel rounded-xl">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Accuracy</span>
                      </div>
                      <div className="text-2xl font-bold gradient-text-cyber" data-testid="accuracy-value">
                        {accuracy > 0 ? `${accuracy.toFixed(1)}%` : '91.7%'}
                      </div>
                      {accuracy === 0 && (
                        <div className="text-xs text-muted-foreground mt-1">Last session</div>
                      )}
                    </div>

                    <div className="p-4 glass-panel rounded-xl">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="w-4 h-4 text-secondary" />
                        <span className="text-sm font-medium">Time</span>
                      </div>
                      <div className="text-2xl font-bold text-secondary">
                        {(isTraining || isTestRun) ? `${Math.floor(trainingProgress / 10)}:${(Math.floor(trainingProgress % 10) * 6).toString().padStart(2, '0')}` : '4:32'}
                      </div>
                      {!isTraining && !isTestRun && (
                        <div className="text-xs text-muted-foreground mt-1">Previous training</div>
                      )}
                    </div>

                    <div className="p-4 glass-panel rounded-xl">
                      <div className="flex items-center space-x-2 mb-2">
                        <Zap className="w-4 h-4 text-accent" />
                        <span className="text-sm font-medium">Loss</span>
                      </div>
                      <div className="text-2xl font-bold text-accent">
                        {accuracy > 0 ? (0.15 - accuracy/1000).toFixed(4) : '0.1156'}
                      </div>
                      {accuracy === 0 && (
                        <div className="text-xs text-muted-foreground mt-1">Final loss</div>
                      )}
                    </div>

                    <div className="p-4 glass-panel rounded-xl">
                      <div className="flex items-center space-x-2 mb-2">
                        <LinkIcon className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Status</span>
                      </div>
                      <div className="text-2xl font-bold gradient-text-cyber">
                        {(isTraining || isTestRun) ? '⚡' : (selectedModel && selectedDataset ? '✓' : '–')}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {(isTraining || isTestRun) ? 'Training...' : (selectedModel && selectedDataset ? 'Ready' : 'Select model & data')}
                      </div>
                    </div>
                  </div>

                  {/* Model Performance Details */}
                  {accuracy > 0 && (
                    <div className="mt-6">
                      <h4 className="text-md font-semibold flex items-center mb-4">
                        <FlaskConical className="w-4 h-4 mr-2 text-primary" />
                        Model Performance Metrics
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="p-3 glass-panel rounded-xl text-center">
                          <span className="block text-foreground/70 mb-1">Precision</span>
                          <span className="text-lg font-bold text-primary">{(accuracy - 2.3).toFixed(1)}%</span>
                        </div>
                        <div className="p-3 glass-panel rounded-xl text-center">
                          <span className="block text-foreground/70 mb-1">Recall</span>
                          <span className="text-lg font-bold text-secondary">{(accuracy - 1.8).toFixed(1)}%</span>
                        </div>
                        <div className="p-3 glass-panel rounded-xl text-center">
                          <span className="block text-foreground/70 mb-1">F1-Score</span>
                          <span className="text-lg font-bold text-accent">{(accuracy - 1.1).toFixed(1)}%</span>
                        </div>
                        <div className="p-3 glass-panel rounded-xl text-center">
                          <span className="block text-foreground/70 mb-1">Loss</span>
                          <span className="text-lg font-bold text-primary">{(0.15 - accuracy/1000).toFixed(4)}</span>
                        </div>
                      </div>
                      
                      <div className="text-center mt-4">
                        <Badge className="bg-primary/10 text-primary border-primary/20">
                          Next Step: Tokenize Your AI →
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 5: Training Logs */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Step 5: Training Logs
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">Real-time training process logs and updates</p>
                  </div>
                  
                  <div className="glass-panel p-4 rounded-xl border border-primary/10 h-64 overflow-y-auto">
                    <div className="text-xs font-mono text-foreground/70 space-y-1" data-testid="training-logs">
                      {trainingProgress > 0 ? (
                        <>
                          <div className="text-accent">→ Initializing training session...</div>
                          <div className="text-foreground/60">Model: {mockModels.find(m => m.id === selectedModel)?.name}</div>
                          <div className="text-foreground/60">Dataset: {mockDatasets.find(d => d.id === selectedDataset)?.name}</div>
                          <div className="text-accent">→ {isTestRun ? 'Starting test run...' : 'Starting full training...'}</div>
                          {trainingProgress > 10 && <div>Loading data... [{Math.round(trainingProgress/5)}%]</div>}
                          {trainingProgress > 20 && <div>Epoch 1/{isTestRun ? '3' : '10'} - Loss: 0.8243, Accuracy: 0.3241</div>}
                          {trainingProgress > 40 && <div>Epoch 2/{isTestRun ? '3' : '10'} - Loss: 0.4521, Accuracy: 0.6784</div>}
                          {trainingProgress > 60 && !isTestRun && <div>Epoch 5/10 - Loss: 0.2156, Accuracy: 0.7892</div>}
                          {trainingProgress > 80 && !isTestRun && <div>Epoch 8/10 - Loss: 0.1243, Accuracy: 0.8567</div>}
                          {trainingProgress >= 100 && (
                            <>
                              <div className="text-primary">✓ {isTestRun ? 'Test run' : 'Training'} completed successfully!</div>
                              <div className="text-primary">✓ Final accuracy: {accuracy.toFixed(1)}%</div>
                              <div className="text-accent">→ Model ready for {isTestRun ? 'full training or tokenization' : 'tokenization'}</div>
                            </>
                          )}
                        </>
                      ) : (
                        // Demo Output Placeholder - Always show sample logs when idle
                        <>
                          <div className="text-muted-foreground mb-4">
                            <div className="text-accent/70">📋 Demo Training Session Output</div>
                            <div className="text-foreground/50 mt-1">--- Previous successful training logs ---</div>
                          </div>
                          
                          <div className="text-accent/70">→ Initializing training session...</div>
                          <div className="text-foreground/50">Model: Text Classifier v1 (BERT-based)</div>
                          <div className="text-foreground/50">Dataset: E-commerce Reviews Dataset (2.3 GB)</div>
                          <div className="text-accent/70">→ Starting full training...</div>
                          <div className="text-foreground/50">Loading data... [100%]</div>
                          <div className="text-foreground/50">Epoch 1/10 - Loss: 0.8243, Accuracy: 0.3241</div>
                          <div className="text-foreground/50">Epoch 2/10 - Loss: 0.4521, Accuracy: 0.6784</div>
                          <div className="text-foreground/50">Epoch 3/10 - Loss: 0.3156, Accuracy: 0.7432</div>
                          <div className="text-foreground/50">Epoch 4/10 - Loss: 0.2789, Accuracy: 0.7891</div>
                          <div className="text-foreground/50">Epoch 5/10 - Loss: 0.2156, Accuracy: 0.8234</div>
                          <div className="text-foreground/50">Epoch 6/10 - Loss: 0.1894, Accuracy: 0.8567</div>
                          <div className="text-foreground/50">Epoch 7/10 - Loss: 0.1634, Accuracy: 0.8789</div>
                          <div className="text-foreground/50">Epoch 8/10 - Loss: 0.1423, Accuracy: 0.8912</div>
                          <div className="text-foreground/50">Epoch 9/10 - Loss: 0.1287, Accuracy: 0.9034</div>
                          <div className="text-foreground/50">Epoch 10/10 - Loss: 0.1156, Accuracy: 0.9167</div>
                          <div className="text-primary/70">✓ Training completed successfully!</div>
                          <div className="text-primary/70">✓ Final accuracy: 91.7%</div>
                          <div className="text-accent/70">→ Model ready for tokenization</div>
                          
                          <div className="text-muted-foreground/50 mt-4 pt-2 border-t border-border/20">
                            💡 Click "Run Training" above to start a new session
                          </div>
                        </>
                      )}
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