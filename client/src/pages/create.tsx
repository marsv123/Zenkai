import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { createAuthenticatedRequest } from '@/lib/auth';
import { apiRequest } from '@/lib/queryClient';
import contractAddresses from '@/lib/contracts/addresses.json';
import contractABIs from '@/lib/contracts/abis.json';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  ChevronRight, 
  ChevronLeft, 
  Upload, 
  Brain, 
  Coins,
  CheckCircle2,
  Database,
  Shield,
  Zap,
  Play,
  TestTube2,
  Target,
  DollarSign,
  Hash,
  Activity,
  Sparkles,
  FileText,
  Settings
} from 'lucide-react';

import content from '@/lib/config/content.json';

// Form schemas
const uploadSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  tags: z.string().optional(),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  ipfsHash: z.string().optional(),
  storageProvider: z.enum(['ipfs', '0g']),
  zkProtected: z.boolean(),
});

const inftSchema = z.object({
  name: z.string().min(3, 'INFT name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  datasetURI: z.string().optional(),
  modelURI: z.string().optional(),
  encryptedMetaURI: z.string().optional(),
  royaltyPercentage: z.number().min(0).max(10),
  attributes: z.string().optional(),
});

type UploadFormData = z.infer<typeof uploadSchema>;
type INFTFormData = z.infer<typeof inftSchema>;

interface WorkflowData {
  uploadedDataset?: any;
  trainedModel?: any;
  inferenceResult?: any;
}

export default function CreatePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [workflowData, setWorkflowData] = useState<WorkflowData>({});
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  // Training state
  const [activeTab, setActiveTab] = useState('inference');
  const [inferencePrompt, setInferencePrompt] = useState('');
  const [inferenceProvider, setInferenceProvider] = useState('0x742B5c3B0E2E8f2b8e5b5F5B5E5B5F5B5E5B5F5B');
  const [inferenceModel, setInferenceModel] = useState('llama-3.3-70b-instruct');
  const [inferenceResult, setInferenceResult] = useState<any>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingStatus, setTrainingStatus] = useState<'idle' | 'preparing' | 'training' | 'completed' | 'failed'>('idle');
  
  // INFT state
  const [royaltyPercentage, setRoyaltyPercentage] = useState<number[]>([5]);
  const [minted, setMinted] = useState(false);
  const [mintedTokenId, setMintedTokenId] = useState<string>('');

  const { address, isConnected, chainId } = useAccount();
  const { writeContract, data: hash, isPending: isContractPending } = useWriteContract();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Transaction confirmation for minting
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Forms
  const uploadForm = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      tags: '',
      price: 10,
      ipfsHash: '',
      storageProvider: '0g',
      zkProtected: false,
    },
  });

  const inftForm = useForm<INFTFormData>({
    resolver: zodResolver(inftSchema),
    defaultValues: {
      name: '',
      description: '',
      datasetURI: '',
      modelURI: '',
      encryptedMetaURI: '',
      royaltyPercentage: 5,
      attributes: '',
    },
  });

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
      setWorkflowData(prev => ({ ...prev, inferenceResult: result }));
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
    mutationFn: async (data: { datasetURI: string; modelConfig: any }) => {
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
    onSuccess: (result) => {
      setWorkflowData(prev => ({ ...prev, trainedModel: result }));
      setTrainingStatus('completed');
      setTrainingProgress(100);
      setIsTraining(false);
      handleTrainComplete(); // Auto-advance to Mint step and populate INFT form
      toast({
        title: "Training completed",
        description: "Model training simulation completed successfully"
      });
    },
    onError: (error: any) => {
      setTrainingStatus('failed');
      setIsTraining(false);
      toast({
        title: "Training failed",
        description: error.message || "Failed to complete training",
        variant: "destructive"
      });
    }
  });

  // Steps configuration
  const steps = [
    {
      number: 1,
      title: "Upload Dataset",
      description: "Register your dataset with metadata and pricing",
      icon: Upload,
      color: "text-blue-400",
    },
    {
      number: 2,
      title: "Train AI",
      description: "Run inference or train models with your data",
      icon: Brain,
      color: "text-purple-400",
    },
    {
      number: 3,
      title: "Mint INFT",
      description: "Tokenize your AI assets as Intelligence NFTs",
      icon: Coins,
      color: "text-orange-400",
    }
  ];

  const handleStepComplete = (stepNumber: number, data?: any) => {
    if (!completedSteps.includes(stepNumber)) {
      setCompletedSteps(prev => [...prev, stepNumber]);
    }
    if (data) {
      setWorkflowData(prev => ({ ...prev, ...data }));
    }
  };

  // Dataset upload mutation (real API call)
  const uploadMutation = useMutation({
    mutationFn: async (data: UploadFormData) => {
      if (!address) {
        throw new Error('Wallet not connected');
      }
      
      const authRequest = await createAuthenticatedRequest(address, 'dataset-upload', data);
      const response = await fetch('/api/datasets', {
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
      handleStepComplete(1, { uploadedDataset: result });
      toast({
        title: "Dataset uploaded",
        description: "Your dataset has been registered successfully"
      });
      setCurrentStep(2);
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload dataset",
        variant: "destructive"
      });
    }
  });

  const handleUploadSubmit = (data: UploadFormData) => {
    uploadMutation.mutate(data);
  };

  const handleInference = () => {
    if (!inferencePrompt.trim()) {
      toast({
        title: "Prompt required",
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

  const handleTraining = () => {
    if (!workflowData.uploadedDataset) {
      toast({
        title: "Dataset required",
        description: "Please upload a dataset first",
        variant: "destructive"
      });
      return;
    }

    setIsTraining(true);
    setTrainingStatus('preparing');
    setTrainingProgress(0);

    // Simulate training progress
    const progressInterval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          setTrainingStatus('training');
          
          // Trigger actual training API call
          trainingMutation.mutate({
            datasetURI: workflowData.uploadedDataset.ogStorageUri || workflowData.uploadedDataset.ipfsHash,
            modelConfig: {
              architecture: 'transformer',
              epochs: 10,
              learningRate: 0.001
            }
          });
          
          return 100;
        }
        return prev + Math.random() * 10;
      });
    }, 500);
  };

  const handleTrainComplete = () => {
    handleStepComplete(2);
    setCurrentStep(3);
    
    // Auto-populate INFT form with workflow data
    if (workflowData.uploadedDataset) {
      inftForm.setValue('name', `${workflowData.uploadedDataset.title} INFT`);
      inftForm.setValue('description', workflowData.uploadedDataset.description);
      inftForm.setValue('datasetURI', workflowData.uploadedDataset.ogStorageUri || workflowData.uploadedDataset.ipfsHash);
      
      if (workflowData.trainedModel) {
        inftForm.setValue('modelURI', workflowData.trainedModel.modelURI);
      }
    }
    
    toast({
      title: "Ready for tokenization",
      description: "Your model is trained and ready to be minted as an INFT"
    });
  };

  const handleINFTSubmit = async (data: INFTFormData) => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to mint an INFT",
        variant: "destructive"
      });
      return;
    }

    try {
      // Mint INFT on blockchain
      const royaltyBasisPoints = Math.round(data.royaltyPercentage * 100); // Convert to basis points
      
      await writeContract({
        address: contractAddresses.ZenkaiINFT as `0x${string}`,
        abi: contractABIs.ZenkaiINFT,
        functionName: 'mintINFT',
        args: [
          address,
          data.name,
          data.description,
          data.datasetURI || '',
          data.modelURI || '',
          data.encryptedMetaURI || '',
          BigInt(royaltyBasisPoints),
          data.attributes || ''
        ],
      });

      toast({
        title: "INFT minting initiated",
        description: "Transaction submitted to blockchain"
      });
    } catch (error: any) {
      toast({
        title: "Minting failed",
        description: error.message || "Failed to mint INFT",
        variant: "destructive"
      });
    }
  };

  // Handle successful minting
  useEffect(() => {
    if (isConfirmed && hash) {
      setMinted(true);
      setMintedTokenId(`${hash.slice(0, 10)}...`);
      handleStepComplete(3);
      toast({
        title: "INFT minted successfully!",
        description: "Your Intelligence NFT has been created"
      });
    }
  }, [isConfirmed, hash]);

  if (minted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="glass-cyber max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <CardTitle className="text-3xl font-display gradient-text-cyber">
              🎉 INFT Created Successfully!
            </CardTitle>
            <CardDescription className="text-lg">
              Your Intelligence NFT has been minted and is now available on the blockchain
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Token ID</div>
                <div className="font-mono text-lg">{mintedTokenId}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Status</div>
                <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                  <Shield className="w-4 h-4 mr-1" />
                  ZK Protected
                </Badge>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex gap-3 justify-center">
              <Button onClick={() => setLocation('/marketplace')} className="glass-cyber">
                <Target className="w-4 h-4 mr-2" />
                View in Marketplace
              </Button>
              <Button onClick={() => setLocation('/dashboard')} variant="outline" className="glass-cyber">
                <Activity className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 gradient-text-cyber">
              Create Your Intelligence Asset
            </h1>
            <p className="text-xl text-accent/90 leading-relaxed max-w-3xl mx-auto">
              Follow the step-by-step workflow to upload, train, and tokenize your AI assets
            </p>
          </div>

          {/* Progress Stepper */}
          <div className="mb-12">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`flex flex-col items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                    <div
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center mb-2 transition-all duration-300 ${
                        completedSteps.includes(step.number)
                          ? 'bg-green-500/20 border-green-400 text-green-400'
                          : currentStep === step.number
                          ? 'bg-primary/20 border-primary text-primary'
                          : 'bg-muted/20 border-muted-foreground/20 text-muted-foreground'
                      }`}
                      data-testid={`step-${step.number}`}
                    >
                      {completedSteps.includes(step.number) ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <step.icon className="w-6 h-6" />
                      )}
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-medium ${step.color}`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-muted-foreground max-w-24">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <ChevronRight className="w-5 h-5 text-muted-foreground mx-4 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="space-y-8">
            
            {/* Step 1: Upload Dataset */}
            {currentStep === 1 && (
              <Card className="glass-cyber">
                <CardHeader>
                  <CardTitle className="text-2xl font-display gradient-text-cyber flex items-center">
                    <Upload className="w-6 h-6 mr-2 text-blue-400" />
                    Step 1: Upload Dataset
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Register your dataset with rich metadata and set your pricing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...uploadForm}>
                    <form onSubmit={uploadForm.handleSubmit(handleUploadSubmit)} className="space-y-6">
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={uploadForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{content.uploadPage.fields.title}</FormLabel>
                              <FormControl>
                                <Input placeholder={content.uploadPage.fields.titlePlaceholder} {...field} data-testid="input-dataset-title" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={uploadForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{content.uploadPage.fields.category}</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Machine Learning, NLP" {...field} data-testid="input-dataset-category" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={uploadForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{content.uploadPage.fields.description}</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder={content.uploadPage.fields.descriptionPlaceholder}
                                className="min-h-24"
                                {...field} 
                                data-testid="textarea-dataset-description"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={uploadForm.control}
                          name="tags"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{content.uploadPage.fields.tags}</FormLabel>
                              <FormControl>
                                <Input placeholder={content.uploadPage.fields.tagsPlaceholder} {...field} data-testid="input-dataset-tags" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={uploadForm.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{content.uploadPage.fields.price}</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0.01" 
                                  step="0.01" 
                                  placeholder="10"
                                  value={field.value || ''}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  data-testid="input-dataset-price"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={uploadForm.control}
                          name="storageProvider"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Storage Provider</FormLabel>
                              <FormControl>
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      checked={field.value === '0g'}
                                      onCheckedChange={(checked) => field.onChange(checked ? '0g' : 'ipfs')}
                                      data-testid="switch-storage-provider"
                                    />
                                    <span className="text-sm">{field.value === '0g' ? '0G Storage' : 'IPFS'}</span>
                                  </div>
                                  <Badge variant="secondary" className="text-xs">
                                    {field.value === '0g' ? 'Recommended' : 'Traditional'}
                                  </Badge>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={uploadForm.control}
                          name="zkProtected"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ZK Privacy Protection</FormLabel>
                              <FormControl>
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                      data-testid="switch-zk-protection"
                                    />
                                    <span className="text-sm">{field.value ? 'Protected' : 'Public'}</span>
                                  </div>
                                  {field.value && (
                                    <Badge variant="secondary" className="text-xs bg-orange-500/20 text-orange-400">
                                      <Shield className="w-3 h-3 mr-1" />
                                      ZK Protected
                                    </Badge>
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={uploadForm.control}
                        name="ipfsHash"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{content.uploadPage.fields.ipfsHash}</FormLabel>
                            <FormControl>
                              <Input placeholder={content.uploadPage.fields.ipfsPlaceholder} {...field} data-testid="input-ipfs-hash" />
                            </FormControl>
                            <FormDescription>
                              Optional: Pre-existing IPFS hash if you've already uploaded your dataset
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end pt-4">
                        <Button
                          type="submit"
                          disabled={uploadMutation.isPending}
                          className="glass-cyber"
                          data-testid="button-register-dataset"
                        >
                          {uploadMutation.isPending ? (
                            <>
                              <Activity className="w-4 h-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              {content.uploadPage.button}
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Train AI */}
            {currentStep === 2 && (
              <Card className="glass-cyber">
                <CardHeader>
                  <CardTitle className="text-2xl font-display gradient-text-cyber flex items-center">
                    <Brain className="w-6 h-6 mr-2 text-purple-400" />
                    Step 2: Train AI
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Run inference or train models using 0G Compute infrastructure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="inference" className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Inference (Live)
                      </TabsTrigger>
                      <TabsTrigger value="training" className="flex items-center gap-2">
                        <TestTube2 className="w-4 h-4" />
                        Training (Simulated)
                      </TabsTrigger>
                    </TabsList>

                    {/* Inference Tab */}
                    <TabsContent value="inference" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Provider Address</label>
                            <Input
                              value={inferenceProvider}
                              onChange={(e) => setInferenceProvider(e.target.value)}
                              placeholder="0x742B5c3B0E2E8f2b8e5b5F5B5E5B5F5B5E5B5F5B"
                              data-testid="input-provider-address"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Model Name</label>
                            <Input
                              value={inferenceModel}
                              onChange={(e) => setInferenceModel(e.target.value)}
                              placeholder="llama-3.3-70b-instruct"
                              data-testid="input-model-name"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-2 block">Prompt</label>
                          <Textarea
                            value={inferencePrompt}
                            onChange={(e) => setInferencePrompt(e.target.value)}
                            placeholder="Enter your prompt for AI inference..."
                            className="min-h-32"
                            data-testid="textarea-inference-prompt"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <Button
                          onClick={handleInference}
                          disabled={!isConnected || inferenceMutation.isPending}
                          className="glass-cyber"
                          data-testid="button-run-inference"
                        >
                          {inferenceMutation.isPending ? (
                            <>
                              <Activity className="w-4 h-4 mr-2 animate-spin" />
                              Running Inference...
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Run Inference
                            </>
                          )}
                        </Button>

                        {inferenceResult && (
                          <Button
                            onClick={handleTrainComplete}
                            className="glass-cyber"
                            data-testid="button-continue-to-mint"
                          >
                            Continue to Mint
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        )}
                      </div>

                      {/* Results */}
                      {inferenceResult && (
                        <Card className="glass-panel">
                          <CardHeader>
                            <CardTitle className="flex items-center text-lg">
                              <Sparkles className="w-5 h-5 mr-2 text-primary" />
                              Inference Results
                              <Badge variant="secondary" className="ml-2">
                                <Shield className="w-3 h-3 mr-1" />
                                ZK Verified
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div>
                                <div className="text-sm text-muted-foreground mb-1">Response</div>
                                <div className="bg-muted/20 p-3 rounded-lg font-mono text-sm">
                                  {inferenceResult.response || 'Processing...'}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <div className="text-muted-foreground">Provider</div>
                                  <div className="font-mono">{inferenceResult.provider || 'N/A'}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">Cost</div>
                                  <div>{inferenceResult.cost || '0.001 ZAI'}</div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>

                    {/* Training Tab */}
                    <TabsContent value="training" className="space-y-6">
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-yellow-400 mb-2">
                          <TestTube2 className="w-5 h-5" />
                          <span className="font-medium">Training Simulation</span>
                        </div>
                        <p className="text-sm text-yellow-300/80">
                          Training is currently simulated. This generates mock training results and model artifacts for the tokenization process.
                        </p>
                      </div>

                      {workflowData.uploadedDataset && (
                        <Card className="glass-panel">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center">
                              <Database className="w-5 h-5 mr-2" />
                              Selected Dataset
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="text-muted-foreground">Name</div>
                                <div>{workflowData.uploadedDataset.title}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Category</div>
                                <div>{workflowData.uploadedDataset.category}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Storage</div>
                                <div>{workflowData.uploadedDataset.storageProvider.toUpperCase()}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Price</div>
                                <div>{workflowData.uploadedDataset.price} ZAI</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Training Progress */}
                      {isTraining && (
                        <Card className="glass-panel">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center">
                              <Activity className="w-5 h-5 mr-2 animate-spin" />
                              Training Progress
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div>
                                <div className="flex justify-between text-sm mb-2">
                                  <span>Progress</span>
                                  <span>{trainingProgress.toFixed(0)}%</span>
                                </div>
                                <Progress value={trainingProgress} className="h-2" />
                              </div>
                              <Badge variant="secondary">
                                Status: {trainingStatus}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      <div className="flex justify-between">
                        <Button
                          onClick={handleTraining}
                          disabled={!workflowData.uploadedDataset || isTraining}
                          className="glass-cyber"
                          data-testid="button-start-training"
                        >
                          {isTraining ? (
                            <>
                              <Activity className="w-4 h-4 mr-2 animate-spin" />
                              Training in Progress...
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Start Training
                            </>
                          )}
                        </Button>

                        {workflowData.trainedModel && (
                          <Button
                            onClick={handleTrainComplete}
                            className="glass-cyber"
                            data-testid="button-continue-to-mint"
                          >
                            Continue to Mint
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Mint INFT */}
            {currentStep === 3 && (
              <Card className="glass-cyber">
                <CardHeader>
                  <CardTitle className="text-2xl font-display gradient-text-cyber flex items-center">
                    <Coins className="w-6 h-6 mr-2 text-orange-400" />
                    Step 3: Mint INFT
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Tokenize your AI assets as Intelligence NFTs with custom royalties
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...inftForm}>
                    <form onSubmit={inftForm.handleSubmit(handleINFTSubmit)} className="space-y-6">
                      
                      {/* Asset Preview */}
                      {workflowData.uploadedDataset && (
                        <Card className="glass-panel">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center">
                              <FileText className="w-5 h-5 mr-2" />
                              Asset Preview
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="text-muted-foreground">Dataset</div>
                                <div className="font-mono text-xs">
                                  {workflowData.uploadedDataset.ogStorageUri || workflowData.uploadedDataset.ipfsHash}
                                </div>
                              </div>
                              {workflowData.trainedModel && (
                                <div>
                                  <div className="text-muted-foreground">Model</div>
                                  <div className="font-mono text-xs">
                                    {workflowData.trainedModel.modelURI}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={inftForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>INFT Name</FormLabel>
                              <FormControl>
                                <Input placeholder="My Intelligence NFT" {...field} data-testid="input-inft-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={inftForm.control}
                          name="royaltyPercentage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Royalty Percentage: {field.value}%</FormLabel>
                              <FormControl>
                                <Slider
                                  min={0}
                                  max={10}
                                  step={0.5}
                                  value={[field.value]}
                                  onValueChange={([value]) => field.onChange(value)}
                                  className="w-full"
                                  data-testid="slider-royalty"
                                />
                              </FormControl>
                              <FormDescription>
                                Percentage of future sales you'll receive as royalties
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={inftForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe your Intelligence NFT..."
                                className="min-h-24"
                                {...field} 
                                data-testid="textarea-inft-description"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={inftForm.control}
                        name="attributes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Attributes (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="accuracy:0.95,training_time:24h,dataset_size:1GB"
                                {...field} 
                                data-testid="input-inft-attributes"
                              />
                            </FormControl>
                            <FormDescription>
                              Comma-separated key:value pairs for NFT metadata
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-between items-center pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCurrentStep(2)}
                          className="glass-cyber"
                        >
                          <ChevronLeft className="w-4 h-4 mr-2" />
                          Back to Training
                        </Button>

                        <Button
                          type="submit"
                          disabled={!isConnected || isContractPending || isConfirming}
                          className="glass-cyber"
                          data-testid="button-mint-inft"
                        >
                          {isContractPending || isConfirming ? (
                            <>
                              <Activity className="w-4 h-4 mr-2 animate-spin" />
                              Minting INFT...
                            </>
                          ) : (
                            <>
                              <Coins className="w-4 h-4 mr-2" />
                              Mint Intelligence NFT
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}