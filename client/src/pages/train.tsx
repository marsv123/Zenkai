import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Play, Brain, Database, TrendingUp, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Dataset {
  id: string;
  name: string;
  size: string;
  category: string;
  price: string;
}

export default function TrainPage() {
  const [selectedDataset, setSelectedDataset] = useState<string>('dataset-1');
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [accuracy, setAccuracy] = useState(0);

  const mockDatasets: Dataset[] = [
    { id: 'dataset-1', name: 'E-commerce Reviews Dataset', size: '2.3 GB', category: 'Text Analysis', price: '50 ZAI' },
    { id: 'dataset-2', name: 'Financial Market Data', size: '1.8 GB', category: 'Time Series', price: '75 ZAI' },
    { id: 'dataset-3', name: 'Medical Image Collection', size: '5.1 GB', category: 'Computer Vision', price: '120 ZAI' },
    { id: 'dataset-4', name: 'Social Media Sentiment', size: '3.2 GB', category: 'NLP', price: '60 ZAI' },
  ];

  const handleStartTraining = () => {
    setIsTraining(true);
    setTrainingProgress(0);
    setAccuracy(0);
    
    // Simulate training progress
    const interval = setInterval(() => {
      setTrainingProgress((prev) => {
        const newProgress = prev + Math.random() * 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          setAccuracy(85.7 + Math.random() * 10); // Random accuracy between 85.7-95.7%
          return 100;
        }
        return newProgress;
      });
    }, 200);
  };

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
          <h1 className="text-2xl font-bold gradient-text-cyber">Train Your AI</h1>
          <Button 
            className="gradient-primary hover-cyber" 
            disabled={isTraining}
            onClick={handleStartTraining}
            data-testid="button-start-training"
          >
            <Play className="w-4 h-4 mr-2" />
            {isTraining ? 'Training...' : 'Start Training'}
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Dataset Selection */}
          <Card className="glass-cyber border-primary/30">
            <CardHeader>
              <CardTitle className="gradient-text-cyber flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Select Training Dataset
              </CardTitle>
              <CardDescription>Choose a dataset to train your AI model</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockDatasets.map((dataset) => (
                  <div
                    key={dataset.id}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                      selectedDataset === dataset.id
                        ? 'border-primary/50 glass-panel bg-primary/5'
                        : 'border-primary/20 glass-panel hover:border-primary/30'
                    }`}
                    onClick={() => setSelectedDataset(dataset.id)}
                    data-testid={`dataset-${dataset.id}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{dataset.name}</h4>
                      <Badge className="glass-panel border-primary/30 gradient-text-zen">
                        {dataset.category}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-foreground/70">
                      <span>Size: {dataset.size}</span>
                      <span className="text-primary font-medium">{dataset.price}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Selected Dataset Summary */}
              <div className="mt-6 p-4 glass-panel rounded-xl border border-primary/20">
                <h5 className="font-medium mb-2">Selected Dataset</h5>
                <div className="text-sm text-foreground/80">
                  <p><strong>Name:</strong> {mockDatasets.find(d => d.id === selectedDataset)?.name}</p>
                  <p><strong>Size:</strong> {mockDatasets.find(d => d.id === selectedDataset)?.size}</p>
                  <p><strong>Cost:</strong> {mockDatasets.find(d => d.id === selectedDataset)?.price}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Training Progress & Results */}
          <Card className="glass-cyber border-primary/30">
            <CardHeader>
              <CardTitle className="gradient-text-cyber flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                Training Progress
              </CardTitle>
              <CardDescription>Monitor your AI model training performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Training Progress</span>
                    <span className="text-sm text-foreground/70">{Math.round(trainingProgress)}%</span>
                  </div>
                  <Progress value={trainingProgress} className="h-2" />
                </div>

                {/* Training Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 glass-panel rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Accuracy</span>
                    </div>
                    <div className="text-2xl font-bold gradient-text-cyber" data-testid="accuracy-value">
                      {accuracy > 0 ? `${accuracy.toFixed(1)}%` : '--'}
                    </div>
                  </div>

                  <div className="p-4 glass-panel rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Time Elapsed</span>
                    </div>
                    <div className="text-2xl font-bold gradient-text-cyber">
                      {isTraining ? `${Math.floor(trainingProgress / 10)}:${(Math.floor(trainingProgress % 10) * 6).toString().padStart(2, '0')}` : '0:00'}
                    </div>
                  </div>
                </div>

                {/* Training Logs */}
                <div className="glass-panel p-4 rounded-xl border border-primary/10">
                  <h6 className="text-sm font-medium mb-3">Training Logs</h6>
                  <div className="text-xs font-mono text-foreground/70 space-y-1" data-testid="training-logs">
                    {trainingProgress > 0 && (
                      <>
                        <div>Initializing neural network...</div>
                        <div>Loading dataset: {mockDatasets.find(d => d.id === selectedDataset)?.name}</div>
                      </>
                    )}
                    {trainingProgress > 20 && <div>Epoch 1/10 - Loss: 0.8243, Accuracy: 0.3241</div>}
                    {trainingProgress > 40 && <div>Epoch 3/10 - Loss: 0.4521, Accuracy: 0.6784</div>}
                    {trainingProgress > 60 && <div>Epoch 5/10 - Loss: 0.2156, Accuracy: 0.7892</div>}
                    {trainingProgress > 80 && <div>Epoch 8/10 - Loss: 0.1243, Accuracy: 0.8567</div>}
                    {trainingProgress >= 100 && (
                      <>
                        <div className="text-green-400">Training completed successfully!</div>
                        <div className="text-green-400">Final accuracy: {accuracy.toFixed(1)}%</div>
                      </>
                    )}
                  </div>
                </div>

                {/* Model Performance */}
                {accuracy > 0 && (
                  <div className="glass-panel p-4 rounded-xl border border-primary/10">
                    <h6 className="text-sm font-medium mb-3 flex items-center">
                      <Zap className="w-4 h-4 mr-2 text-primary" />
                      Model Performance
                    </h6>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-foreground/70">Precision:</span>
                        <span className="ml-2 font-medium">{(accuracy - 2.3).toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-foreground/70">Recall:</span>
                        <span className="ml-2 font-medium">{(accuracy - 1.8).toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-foreground/70">F1-Score:</span>
                        <span className="ml-2 font-medium">{(accuracy - 1.1).toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-foreground/70">Loss:</span>
                        <span className="ml-2 font-medium">{(0.15 - accuracy/1000).toFixed(4)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}