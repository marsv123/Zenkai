import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Play, Brain, Database, TrendingUp, Clock, Zap, TestTube2, Link as LinkIcon, Settings, FlaskConical, Activity, Target, Sparkles, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAccount } from 'wagmi';
import { createAuthenticatedRequest } from '@/lib/auth';
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
  const [activeTab, setActiveTab] = useState('inference');
  
  // Inference state
  const [inferencePrompt, setInferencePrompt] = useState('');
  const [inferenceProvider, setInferenceProvider] = useState('0x742B5c3B0E2E8f2b8e5b5F5B5E5B5F5B5E5B5F5B');
  const [inferenceModel, setInferenceModel] = useState('llama-3.3-70b-instruct');
  const [inferenceResult, setInferenceResult] = useState<any>(null);
  
  const { toast } = useToast();
  const { address, isConnected } = useAccount();

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

  // Inference mutation
  const inferenceMutation = useMutation({
    mutationFn: async (data: { provider: string; prompt: string; model: string }) => {
      if (!address) {
        throw new Error('Wallet not connected');
      }
      
      const authRequest = await createAuthenticatedRequest(address, 'og-inference', data);
      const response = await fetch('/api/og-compute/inference', {
        method: 'POST',
        headers: authRequest.headers,
        body: JSON.stringify(authRequest.body),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }
      
      return await response.json();
    },
    onSuccess: (result) => {
      setInferenceResult(result);
      toast({
        title: "Inference completed",
        description: "0G Compute inference completed successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Inference failed",
        description: error.message || "Failed to run inference",
        variant: "destructive"
      });
    }
  });

  // Training mutation (simulated)
  const trainingMutation = useMutation({
    mutationFn: async (data: { datasetURI: string; modelConfig: any; computeParams?: any }) => {
      if (!address) {
        throw new Error('Wallet not connected');
      }
      
      const authRequest = await createAuthenticatedRequest(address, 'og-training', data);
      const response = await fetch('/api/og-compute/train', {
        method: 'POST',
        headers: authRequest.headers,
        body: JSON.stringify(authRequest.body),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }
      
      return await response.json();
    },
    onSuccess: (result: any) => {
      toast({
        title: "Training simulation started",
        description: result.message || "Training started"
      });
      // Start training simulation UI
      handleStartTraining();
    },
    onError: (error: any) => {
      toast({
        title: "Training failed",
        description: error.message || "Failed to start training",
        variant: "destructive"
      });
    }
  });

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

  const handleInferenceSubmit = () => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet required",
        description: "Please connect your wallet to run inference on 0G Compute",
        variant: "destructive"
      });
      return;
    }

    if (!inferencePrompt.trim()) {
      toast({
        title: "Invalid input",
        description: "Please enter a prompt for inference",
        variant: "destructive"
      });
      return;
    }

    inferenceMutation.mutate({
      provider: inferenceProvider,
      prompt: inferencePrompt,
      model: inferenceModel
    });
  };

  const handleTrainingSubmit = () => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet required",
        description: "Please connect your wallet to start training simulation",
        variant: "destructive"
      });
      return;
    }

    const selectedDatasetObj = mockDatasets.find(d => d.id === selectedDataset);
    const selectedModelObj = mockModels.find(m => m.id === selectedModel);
    
    if (!selectedDatasetObj || !selectedModelObj) {
      toast({
        title: "Invalid selection",
        description: "Please select both a dataset and model",
        variant: "destructive"
      });
      return;
    }

    trainingMutation.mutate({
      datasetURI: `ipfs://mock-dataset-${selectedDataset}`,
      modelConfig: {
        name: selectedModelObj.name,
        architecture: selectedModelObj.architecture,
        blocks: selectedModelObj.blocks
      },
      computeParams: {
        epochs: 10,
        batchSize: 32,
        learningRate: 0.001
      }
    });
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
              Run decentralized inference today with 0G Compute. Training support is coming soon and will integrate seamlessly.
            </p>
          </div>

          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 glass-cyber">
              <TabsTrigger value="inference" className="data-[state=active]:bg-primary/20">
                <Sparkles className="w-4 h-4 mr-2" />
                Inference (Live)
              </TabsTrigger>
              <TabsTrigger value="training" className="data-[state=active]:bg-secondary/20">
                <Brain className="w-4 h-4 mr-2" />
                Training (Simulated)
              </TabsTrigger>
            </TabsList>

            {/* Inference Tab - REAL 0G COMPUTE */}
            <TabsContent value="inference">
              <Card className="max-w-6xl mx-auto glass-cyber hover-cyber" data-testid="card-inference-form">
                <CardHeader>
                  <CardTitle className="text-2xl font-display gradient-text-cyber flex items-center">
                    <Sparkles className="w-6 h-6 mr-2" />
                    0G Compute Inference
                    <Badge className="ml-2 bg-primary/10 text-primary border-primary/20">LIVE</Badge>
                  </CardTitle>
                  <CardDescription>
                    Outputs are computed on 0G Compute testnet nodes, verified via zk/TEE.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Provider Configuration */}
                  <div className="space-y-4">
                    <Label htmlFor="provider" className="text-sm font-medium">Provider Address</Label>
                    <Input
                      id="provider"
                      value={inferenceProvider}
                      onChange={(e) => setInferenceProvider(e.target.value)}
                      placeholder="0x..."
                      data-testid="input-provider"
                    />
                  </div>

                  {/* Model Selection */}
                  <div className="space-y-4">
                    <Label htmlFor="model" className="text-sm font-medium">Model</Label>
                    <Input
                      id="model"
                      value={inferenceModel}
                      onChange={(e) => setInferenceModel(e.target.value)}
                      placeholder="llama-3.3-70b-instruct"
                      data-testid="input-model"
                    />
                  </div>

                  {/* Prompt Input */}
                  <div className="space-y-4">
                    <Label htmlFor="prompt" className="text-sm font-medium">Prompt</Label>
                    <Textarea
                      id="prompt"
                      value={inferencePrompt}
                      onChange={(e) => setInferencePrompt(e.target.value)}
                      placeholder="Enter your query for 0G Compute inference..."
                      className="min-h-[100px]"
                      data-testid="textarea-prompt"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={handleInferenceSubmit}
                    disabled={inferenceMutation.isPending || !isConnected}
                    className="w-full"
                    data-testid="button-run-inference"
                  >
                    {inferenceMutation.isPending ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Running Inference on 0G Compute...
                      </>
                    ) : !isConnected ? (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Connect Wallet to Run Inference
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Run Inference on 0G Compute
                      </>
                    )}
                  </Button>

                  {/* Inference Results */}
                  {inferenceResult && (
                    <Card className="glass-cyber">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <Shield className="w-5 h-5 mr-2 text-primary" />
                          Inference Results
                          {inferenceResult.verification?.zkEnabled && (
                            <Badge className="ml-2 bg-primary/10 text-primary border-primary/20">ZK Verified</Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="bg-muted/20 p-4 rounded-lg">
                          <p className="text-sm whitespace-pre-wrap">{inferenceResult.content}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Provider:</span>
                            <p className="font-mono text-xs break-all">{inferenceResult.provider}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Model:</span>
                            <p>{inferenceResult.model}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Cost:</span>
                            <p>{inferenceResult.cost?.totalCost}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Tokens:</span>
                            <p>{inferenceResult.usage?.total_tokens}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                </CardContent>
              </Card>
            </TabsContent>

            {/* Training Tab - SIMULATED */}
            <TabsContent value="training">
              <Card className="max-w-6xl mx-auto glass-cyber hover-cyber" data-testid="card-training-form">
                <CardHeader>
                  <CardTitle className="text-2xl font-display gradient-text-cyber flex items-center">
                    <Brain className="w-6 h-6 mr-2" />
                    0G Compute Training
                    <Badge className="ml-2 bg-secondary/10 text-secondary border-secondary/20">SIMULATED</Badge>
                  </CardTitle>
                  <CardDescription>
                    This is a simulation until 0G Compute enables decentralized training.
                  </CardDescription>
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
                              ? 'border-primary/50 glass-cyber bg-primary/5'
                              : 'border-primary/20 glass-cyber hover:border-primary/30'
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
                      <p className="text-sm text-muted-foreground mb-4">Choose your dataset for training</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      {mockDatasets.map((dataset) => (
                        <div
                          key={dataset.id}
                          className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                            selectedDataset === dataset.id
                              ? 'border-secondary/50 glass-cyber bg-secondary/5'
                              : 'border-border hover:border-secondary/30 glass-cyber'
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
                      <p className="text-sm text-muted-foreground mb-4">Configure training parameters</p>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-3 glass-cyber rounded-xl">
                        <div className="flex items-center">
                          <Target className="w-4 h-4 mr-2 text-accent" />
                          <span className="text-sm font-medium">Epochs</span>
                        </div>
                        <span className="text-sm font-bold">10</span>
                      </div>
                      <div className="flex items-center justify-between p-3 glass-cyber rounded-xl">
                        <div className="flex items-center">
                          <Zap className="w-4 h-4 mr-2 text-primary" />
                          <span className="text-sm font-medium">Batch Size</span>
                        </div>
                        <span className="text-sm font-bold">32</span>
                      </div>
                      <div className="flex items-center justify-between p-3 glass-cyber rounded-xl">
                        <div className="flex items-center">
                          <Activity className="w-4 h-4 mr-2 text-secondary" />
                          <span className="text-sm font-medium">Learning Rate</span>
                        </div>
                        <span className="text-sm font-bold">0.001</span>
                      </div>
                    </div>
                  </div>

                  {/* Training Actions */}
                  <div className="flex gap-4">
                    <Button 
                      onClick={handleTrainingSubmit}
                      disabled={trainingMutation.isPending || isTraining || !isConnected}
                      className="flex-1"
                      data-testid="button-start-training"
                    >
                      {trainingMutation.isPending || isTraining ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Training in Progress...
                        </>
                      ) : !isConnected ? (
                        <>
                          <Shield className="w-4 h-4 mr-2" />
                          Connect Wallet for Training
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Start Training (Simulated)
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleTestRun}
                      disabled={isTestRun || isTraining}
                      data-testid="button-test-run"
                    >
                      <TestTube2 className="w-4 h-4 mr-2" />
                      Test Run
                    </Button>
                  </div>

                  {/* Training Progress */}
                  {(isTraining || isTestRun || trainingStatus === 'completed') && (
                    <Card className="glass-cyber">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                          <span>Training Progress (Simulation)</span>
                          <Badge className={`${
                            trainingStatus === 'completed' ? 'bg-primary/10 text-primary border-primary/20' :
                            trainingStatus === 'training' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                            'bg-muted/10 text-muted-foreground border-muted/20'
                          }`}>
                            {trainingStatus}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{Math.round(trainingProgress)}%</span>
                          </div>
                          <Progress value={trainingProgress} className="w-full" />
                        </div>
                        {trainingStatus === 'completed' && (
                          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/20">
                            <div>
                              <span className="text-sm text-muted-foreground">Final Accuracy</span>
                              <p className="text-lg font-bold text-primary">{accuracy.toFixed(1)}%</p>
                            </div>
                            <div>
                              <span className="text-sm text-muted-foreground">Model URI</span>
                              <p className="text-xs font-mono break-all">ipfs://simulated-model-{Date.now()}</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}