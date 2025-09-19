'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain, useSignMessage } from 'wagmi';
import { parseEther, formatEther, BaseError as ViemBaseError } from 'viem';
import { Link, Upload, ExternalLink, AlertCircle, CheckCircle, Clock, RefreshCw, Info, Shield, Eye, EyeOff, Check, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

// Contract configurations
const DATASET_REGISTRY_ADDRESS = (import.meta.env.VITE_DATASET_REGISTRY_ADDRESS || '0xa7502234A9e90172F237075a1872Ec7fF108FE77') as `0x${string}`;
const DATASET_REGISTRY_ABI = [
  {
    name: 'register',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'uri', type: 'string' },
      { name: 'price', type: 'uint256' }
    ],
    outputs: [{ name: 'id', type: 'uint256' }]
  }
] as const;

const OG_GALILEO_CHAIN_ID = 16601; // 0G Galileo testnet

interface FormData {
  uri: string;
  category: string;
  title: string;
  description: string;
  tags: string;
  zkPrivacy: boolean;
  storageProvider: '0g' | 'ipfs';
  file?: File | null;
  price: string;
}

interface TransactionState {
  status: 'idle' | 'preparing' | 'waiting_for_wallet' | 'submitting' | 'confirming' | 'success' | 'error';
  transactionId?: string | null;
  txHash?: string;
  blockNumber?: number;
  explorerUrl?: string;
  error?: {
    code: string;
    message: string;
    suggestion?: string;
  };
  retryCount: number;
  gasInfo?: {
    gasUsed?: string;
    gasPrice?: string;
    txFee?: string;
  };
}

// Error classification helper
function classifyError(error: any): { code: string; message: string; suggestion?: string } {
  const errorMessage = error?.message || error?.toString() || 'Unknown error';
  
  // Wallet connection errors
  if (errorMessage.includes('User rejected')) {
    return {
      code: 'userRejectedRequest',
      message: 'Transaction was rejected by the user',
      suggestion: 'Please approve the transaction in your wallet to continue.'
    };
  }
  
  if (errorMessage.includes('insufficient funds') || errorMessage.includes('insufficient balance')) {
    return {
      code: 'insufficientFunds',
      message: 'Insufficient funds for transaction',
      suggestion: 'Please add more funds to your wallet to cover the transaction cost and gas fees.'
    };
  }
  
  if (errorMessage.includes('wrong chain') || errorMessage.includes('chain')) {
    return {
      code: 'chainMismatch',
      message: 'Wrong network selected',
      suggestion: 'Please switch to the 0G Galileo testnet in your wallet.'
    };
  }
  
  if (errorMessage.includes('gas') && errorMessage.includes('limit')) {
    return {
      code: 'gasEstimationFailed',
      message: 'Gas estimation failed',
      suggestion: 'Please try again or increase gas limit manually.'
    };
  }
  
  if (errorMessage.includes('nonce')) {
    return {
      code: 'nonceError',
      message: 'Transaction nonce error',
      suggestion: 'Please reset your wallet account or wait for pending transactions to confirm.'
    };
  }
  
  if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
    return {
      code: 'timeout',
      message: 'Transaction timed out',
      suggestion: 'The network might be congested. Please try again with higher gas fees.'
    };
  }
  
  // Contract-specific errors
  if (errorMessage.includes('already registered')) {
    return {
      code: 'alreadyRegistered',
      message: 'Dataset already registered',
      suggestion: 'This IPFS hash has already been registered. Please use a different dataset.'
    };
  }
  
  return {
    code: 'unknownError',
    message: errorMessage.slice(0, 100) + (errorMessage.length > 100 ? '...' : ''),
    suggestion: 'Please try again or contact support if the issue persists.'
  };
}

// Block explorer URL generator
function generateExplorerUrl(txHash: string, chainId: number): string {
  // For 0G Galileo testnet
  if (chainId === OG_GALILEO_CHAIN_ID) {
    return `https://chainscan-galileo.0g.ai/tx/${txHash}`;
  }
  return `https://etherscan.io/tx/${txHash}`;
}

export default function DatasetRegistration() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { signMessageAsync } = useSignMessage();
  const { toast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    uri: '',
    category: 'Machine Learning',
    title: '',
    description: '',
    tags: '',
    zkPrivacy: true, // ON by default as requested
    storageProvider: '0g', // Default to 0G Storage
    file: null,
    price: '0'
  });

  const [txState, setTxState] = useState<TransactionState>({
    status: 'idle',
    retryCount: 0
  });

  const { writeContract, data: hash, error: writeError, isPending: isWritePending } = useWriteContract();
  
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    data: receipt,
    error: receiptError 
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Update transaction state based on wagmi states
  useEffect(() => {
    if (isWritePending && txState.status !== 'waiting_for_wallet' && txState.status !== 'submitting') {
      setTxState(prev => ({ ...prev, status: 'waiting_for_wallet' }));
    }
    
    if (hash && !isConfirming && !isConfirmed && txState.status !== 'confirming') {
      setTxState(prev => ({ 
        ...prev, 
        status: 'confirming',
        txHash: hash,
        explorerUrl: generateExplorerUrl(hash, chainId)
      }));
    }
    
    if (isConfirming && txState.status !== 'confirming') {
      setTxState(prev => ({ ...prev, status: 'confirming' }));
    }
    
    if (isConfirmed && receipt && txState.status !== 'success') {
      const gasUsed = receipt.gasUsed?.toString();
      const gasPrice = receipt.effectiveGasPrice?.toString();
      const txFee = gasUsed && gasPrice ? formatEther(BigInt(gasUsed) * BigInt(gasPrice)) : undefined;
      
      setTxState(prev => ({ 
        ...prev, 
        status: 'success',
        blockNumber: Number(receipt.blockNumber),
        gasInfo: {
          gasUsed,
          gasPrice,
          txFee
        }
      }));
      
      // Update transaction record as confirmed
      if (txState.transactionId) {
        updateTransactionStatus(txState.transactionId, {
          status: 'confirmed',
          blockNumber: Number(receipt.blockNumber),
          gasUsed,
          gasPrice
        });
      }
      
      toast({
        title: "Dataset Registered Successfully!",
        description: `Your dataset has been registered on the blockchain. Block: ${receipt.blockNumber}`,
      });
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/datasets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/datasets/owner/wallet', address] });
      
      // Reset form after successful registration
      setTimeout(() => {
        resetForm();
      }, 3000);
    }
    
    if ((writeError || receiptError) && txState.status !== 'error') {
      const error = writeError || receiptError;
      const classifiedError = classifyError(error);
      
      setTxState(prev => ({ 
        ...prev, 
        status: 'error',
        error: classifiedError
      }));
      
      // Update transaction record as failed
      if (txState.transactionId) {
        updateTransactionStatus(txState.transactionId, {
          status: 'failed',
          errorCode: classifiedError.code,
          errorMessage: classifiedError.message
        });
      }
      
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: classifiedError.message,
      });
    }
  }, [isWritePending, hash, isConfirming, isConfirmed, receipt, writeError, receiptError, chainId, address, toast, txState.status, txState.transactionId]);

  // Create transaction record in database
  const createTransactionRecord = useCallback(async (datasetId: string, amount: string): Promise<string | null> => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initiatorId: address,
          datasetId,
          transactionType: 'registration',
          amount,
          status: 'draft',
          explorerUrl: hash ? generateExplorerUrl(hash, chainId) : undefined
        })
      });
      
      if (!response.ok) throw new Error('Failed to create transaction record');
      
      const transaction = await response.json();
      return transaction.id;
    } catch (error) {
      console.error('Failed to create transaction record:', error);
      return null;
    }
  }, [address, hash, chainId]);

  // Update transaction record status
  const updateTransactionStatus = useCallback(async (transactionId: string, updates: any) => {
    try {
      await fetch(`/api/transactions/${transactionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (error) {
      console.error('Failed to update transaction status:', error);
    }
  }, []);

  // Create draft dataset record
  const createDraftDataset = useCallback(async (): Promise<string | null> => {
    try {
      // Prepare payload with proper field mapping based on storage provider
      const payload: any = {
        ownerId: address,
        title: formData.title || 'Untitled Dataset',
        description: formData.description,
        category: formData.category,
        storageProvider: formData.storageProvider,
        zkProtected: formData.zkPrivacy && formData.storageProvider === '0g',
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        isActive: false // Keep inactive until blockchain confirmation
      };

      // Add appropriate URI field based on storage provider
      if (formData.storageProvider === '0g') {
        payload.ogStorageUri = formData.uri;
      } else {
        payload.ipfsHash = formData.uri;
      }

      const response = await fetch('/api/datasets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) throw new Error('Failed to create dataset record');
      
      const dataset = await response.json();
      return dataset.id;
    } catch (error) {
      console.error('Failed to create dataset record:', error);
      return null;
    }
  }, [address, formData]);

  // Form validation helper
  const isFormValid = useCallback(() => {
    const hasValidUri = formData.uri.trim() !== '' && 
           (formData.uri.startsWith('ipfs://') || formData.uri.startsWith('0g://'));
    const isValid = hasValidUri && formData.title.trim() !== '';
    
    // Debug logging for testing
    if (import.meta.env.DEV) {
      console.log('Form validation:', {
        uri: formData.uri,
        uriValid: hasValidUri,
        title: formData.title,
        titleValid: formData.title.trim() !== '',
        storageProvider: formData.storageProvider,
        isValid,
        address
      });
    }
    
    return isValid;
  }, [formData, address]);

  // Upload file to storage providers
  const [isUploading, setIsUploading] = useState(false);
  
  const uploadFileToIPFS = useCallback(async (file: File): Promise<string | null> => {
    setIsUploading(true);
    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const response = await fetch('/api/upload-to-ipfs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: base64,
          filename: file.name,
          contentType: file.type,
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      toast({
        title: "File Uploaded Successfully!",
        description: `File uploaded to IPFS: ${result.ipfsHash}`,
      });

      return result.ipfsUri;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'Failed to upload file',
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [toast]);

  const uploadFileToOGStorage = useCallback(async (file: File, zkProtected: boolean): Promise<string | null> => {
    if (!address) {
      toast({
        variant: "destructive",
        title: "Wallet Not Connected",
        description: "Please connect your wallet to upload to 0G Storage",
      });
      return null;
    }

    setIsUploading(true);
    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Create wallet signature for authentication
      const timestamp = Date.now();
      const message = `Upload to 0G Storage\nTimestamp: ${timestamp}\nAddress: ${address}`;
      
      // Sign the message with the wallet
      const signature = await signMessageAsync({ message });
      
      const walletSignature = {
        message,
        signature,
        timestamp,
        address: address!
      };

      const response = await fetch('/api/og-storage/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: base64,
          filename: file.name,
          contentType: file.type,
          zkProtected,
          walletSignature
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      toast({
        title: "File Uploaded Successfully!",
        description: `File uploaded to 0G Storage${zkProtected ? ' with ZK protection' : ''}`,
      });

      return result.ogStorageUri;
    } catch (error) {
      console.error('0G Storage upload error:', error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'Failed to upload to 0G Storage',
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [address, toast]);

  // Handle file selection and upload
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: "Maximum file size is 100MB",
      });
      return;
    }

    setFormData(prev => ({ ...prev, file }));

    // Auto-upload based on selected storage provider
    let uri: string | null = null;
    if (formData.storageProvider === '0g') {
      uri = await uploadFileToOGStorage(file, formData.zkPrivacy);
    } else {
      uri = await uploadFileToIPFS(file);
    }
    
    if (uri) {
      setFormData(prev => ({ ...prev, uri }));
    }
  }, [uploadFileToIPFS, uploadFileToOGStorage, formData.storageProvider, formData.zkPrivacy, toast]);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData({
      uri: '',
      category: 'Machine Learning',
      title: '',
      description: '',
      tags: '',
      zkPrivacy: true, // Keep consistent with initial default
      storageProvider: '0g',
      file: null,
      price: '0'
    });
    setTxState({ status: 'idle', retryCount: 0 });
  }, []);

  // Handle form submission with two-phase commit pattern
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      toast({
        variant: "destructive",
        title: "Wallet Not Connected",
        description: "Please connect your wallet first.",
      });
      return;
    }

    if (chainId !== OG_GALILEO_CHAIN_ID) {
      toast({
        variant: "destructive",
        title: "Wrong Network",
        description: "Please switch to 0G Galileo testnet.",
      });
      try {
        await switchChain({ chainId: OG_GALILEO_CHAIN_ID });
      } catch (error) {
        console.error('Failed to switch chain:', error);
      }
      return;
    }

    // Validate form
    if (!formData.uri || !formData.title) {
      toast({
        variant: "destructive",
        title: "Missing Required Fields",
        description: "Please fill in URI and title.",
      });
      return;
    }

    if (!formData.uri.startsWith('ipfs://') && !formData.uri.startsWith('0g://')) {
      toast({
        variant: "destructive",
        title: "Invalid URI",
        description: "URI must start with ipfs:// or 0g://",
      });
      return;
    }

    if (isUploading) {
      toast({
        variant: "destructive",
        title: "Upload in Progress",
        description: "Please wait for file upload to complete.",
      });
      return;
    }

    try {
      setTxState(prev => ({ ...prev, status: 'preparing' }));

      // Phase 1: Create draft dataset record
      const datasetId = await createDraftDataset();
      if (!datasetId) {
        throw new Error('Failed to create dataset record');
      }

      // Phase 2: Create transaction record
      const transactionId = await createTransactionRecord(datasetId, formData.price || '0');
      
      setTxState(prev => ({ 
        ...prev, 
        status: 'waiting_for_wallet',
        transactionId 
      }));

      // Phase 3: Submit blockchain transaction
      const priceInWei = parseEther(formData.price || '0');
      
      writeContract({
        address: DATASET_REGISTRY_ADDRESS,
        abi: DATASET_REGISTRY_ABI,
        functionName: 'register',
        args: [formData.uri, priceInWei],
      });

      setTxState(prev => ({ ...prev, status: 'submitting' }));

    } catch (error: any) {
      const classifiedError = classifyError(error);
      setTxState(prev => ({ 
        ...prev, 
        status: 'error', 
        error: classifiedError 
      }));

      toast({
        variant: "destructive",
        title: "Registration Failed", 
        description: classifiedError.message,
      });
    }
  }, [address, chainId, switchChain, formData, toast, createDraftDataset, createTransactionRecord, writeContract, isUploading]);

  // Handle retry
  const handleRetry = useCallback(() => {
    setTxState(prev => ({ 
      ...prev, 
      status: 'idle', 
      error: undefined,
      retryCount: prev.retryCount + 1 
    }));
  }, []);

  const handleInputChange = useCallback((field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string | boolean
  ) => {
    const value = typeof e === 'string' ? e : typeof e === 'boolean' ? e : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Status indicator component
  const StatusIndicator = () => {
    const statusConfig = {
      idle: { icon: Upload, color: 'text-muted-foreground', text: 'Ready to submit' },
      preparing: { icon: Clock, color: 'text-blue-500', text: 'Preparing transaction...' },
      waiting_for_wallet: { icon: AlertCircle, color: 'text-orange-500', text: 'Waiting for wallet approval...' },
      submitting: { icon: RefreshCw, color: 'text-blue-500 animate-spin', text: 'Submitting to blockchain...' },
      confirming: { icon: Clock, color: 'text-blue-500', text: 'Confirming transaction...' },
      success: { icon: CheckCircle, color: 'text-green-500', text: 'Registration successful!' },
      error: { icon: AlertCircle, color: 'text-red-500', text: 'Registration failed' }
    };

    const config = statusConfig[txState.status];
    const Icon = config.icon;

    return (
      <div className="flex items-center space-x-2 text-sm">
        <Icon className={`w-4 h-4 ${config.color}`} />
        <span>{config.text}</span>
      </div>
    );
  };

  // Calculate form completion percentage for progress indicator
  const calculateFormCompletion = (): { percentage: number; completedFields: number; totalFields: number; status: string } => {
    const requiredFields = ['title', 'uri']; // Only actually required fields
    const completedFields = requiredFields.filter(field => {
      const value = formData[field as keyof FormData];
      return value && value.toString().trim().length > 0;
    }).length;
    
    // Add file upload progress if applicable
    const hasFile = formData.file !== null;
    const adjustedTotal = requiredFields.length + (hasFile ? 1 : 0);
    const adjustedCompleted = completedFields + (hasFile ? 1 : 0);
    
    const percentage = Math.round((adjustedCompleted / adjustedTotal) * 100);
    const status = percentage === 100 ? 'Ready to submit' : 
                  percentage >= 75 ? 'Almost complete' : 
                  percentage >= 50 ? 'Halfway there' : 
                  percentage >= 25 ? 'Getting started' : 'Just beginning';
    
    return { percentage, completedFields: adjustedCompleted, totalFields: adjustedTotal, status };
  };

  const formProgress = calculateFormCompletion();

  return (
    <Card className="max-w-4xl mx-auto">
      
      <CardContent>
        {/* Form Completion Progress Indicator */}
        <div 
          className="mb-8 p-4 glass-panel rounded-xl border border-primary/10"
          role="region"
          aria-labelledby="form-progress-label"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 id="form-progress-label" className="text-sm font-semibold flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-primary" />
              Form Completion Progress
            </h3>
            <span className="text-sm text-muted-foreground">
              {formProgress.completedFields}/{formProgress.totalFields} fields
            </span>
          </div>
          
          <Progress 
            value={formProgress.percentage} 
            className="h-3 mb-2"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={formProgress.percentage}
            aria-valuetext={`Form ${formProgress.percentage}% complete - ${formProgress.status}`}
            data-testid="form-progress"
          />
          
          <div 
            className="text-xs text-center text-muted-foreground"
            aria-live="polite"
            aria-atomic="true"
          >
            {formProgress.percentage}% complete - {formProgress.status}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            {/* Title & Category - Same Row */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="title">Dataset Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={handleInputChange('title')}
                  placeholder="My AI Dataset"
                  required
                  data-testid="input-title"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={handleInputChange('category')}>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                    <SelectItem value="Natural Language Processing">Natural Language Processing</SelectItem>
                    <SelectItem value="Computer Vision">Computer Vision</SelectItem>
                    <SelectItem value="Audio Processing">Audio Processing</SelectItem>
                    <SelectItem value="Financial Data">Financial Data</SelectItem>
                    <SelectItem value="Bioinformatics">Bioinformatics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Storage Provider Selection */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-primary" />
                  Storage & Privacy Settings
                </h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Storage Provider Selection */}
                <div>
                  <Label htmlFor="storage-provider">Storage Provider</Label>
                  <Select 
                    value={formData.storageProvider} 
                    onValueChange={(value: '0g' | 'ipfs') => handleInputChange('storageProvider')(value)}
                  >
                    <SelectTrigger data-testid="select-storage-provider">
                      <SelectValue placeholder="Select storage provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0g">0G Storage (Recommended)</SelectItem>
                      <SelectItem value="ipfs">IPFS</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.storageProvider === '0g' ? 
                      'Decentralized storage with ZK privacy options' : 
                      'Traditional IPFS distributed storage'
                    }
                  </p>
                </div>

                {/* ZK Privacy Toggle - Only for 0G Storage */}
                <div>
                  <Label htmlFor="zkPrivacy" className="text-sm font-semibold">Zero-Knowledge Privacy</Label>
                  <div className="flex items-center justify-between p-3 border rounded-lg mt-1">
                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center justify-center w-5 h-5 rounded-full transition-colors ${
                        formData.zkPrivacy && formData.storageProvider === '0g'
                          ? 'bg-accent text-accent-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {formData.zkPrivacy && formData.storageProvider === '0g' ? (
                          <EyeOff className="w-3 h-3" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                      </div>
                      <span className="text-sm">
                        {formData.storageProvider === '0g' ? 
                          (formData.zkPrivacy ? 'Enhanced privacy enabled' : 'Standard privacy') :
                          'Only available with 0G Storage'
                        }
                      </span>
                    </div>
                    <Switch
                      id="zkPrivacy"
                      checked={formData.zkPrivacy && formData.storageProvider === '0g'}
                      onCheckedChange={(checked) => handleInputChange('zkPrivacy')(checked)}
                      disabled={formData.storageProvider !== '0g'}
                      data-testid="switch-zk-privacy"
                      className="data-[state=checked]:bg-accent"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.storageProvider === '0g' ?
                      'Protects metadata using zero-knowledge proofs' :
                      'Switch to 0G Storage to enable privacy protection'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* File Upload Section */}
            <div>
              <Label htmlFor="file-upload">Upload Dataset File</Label>
              <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 text-center transition-colors hover:border-primary/50">
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".csv,.json,.txt,.parquet,.xlsx,.zip,.tar.gz"
                  data-testid="input-file-upload"
                />
                <label 
                  htmlFor="file-upload" 
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className={`w-8 h-8 ${isUploading ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
                  <div>
                    {isUploading ? (
                      <span className="text-sm text-primary">
                        Uploading to {formData.storageProvider === '0g' ? '0G Storage' : 'IPFS'}...
                      </span>
                    ) : formData.file ? (
                      <div>
                        <span className="text-sm font-medium text-green-600">✓ {formData.file.name}</span>
                        <p className="text-xs text-muted-foreground">
                          {(formData.file.size / 1024 / 1024).toFixed(2)} MB - 
                          {formData.storageProvider === '0g' ? ' 0G Storage' : ' IPFS'}
                          {formData.zkPrivacy && formData.storageProvider === '0g' ? ' (ZK Protected)' : ''}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <span className="text-sm font-medium">Click to upload or drag and drop</span>
                        <p className="text-xs text-muted-foreground">
                          CSV, JSON, TXT, Parquet, Excel, ZIP files up to 100MB to {formData.storageProvider === '0g' ? '0G Storage' : 'IPFS'}
                        </p>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Storage URI & Description - Same Row */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="uri">
                  {formData.storageProvider === '0g' ? '0G Storage URI *' : 'IPFS URI *'}
                </Label>
                <div className="relative">
                  <Input
                    id="uri"
                    value={formData.uri}
                    onChange={handleInputChange('uri')}
                    className="pl-10"
                    placeholder={formData.file ? "Auto-filled from upload..." : 
                      formData.storageProvider === '0g' ? 
                        "0g://example-hash-here..." : 
                        "ipfs://QmExampleHashHere123456789..."}
                    required
                    data-testid="input-uri"
                    readOnly={isUploading}
                  />
                  <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  {formData.uri && (formData.uri.startsWith('ipfs://') || formData.uri.startsWith('0g://')) && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  )}
                </div>
                {formData.uri && (formData.uri.startsWith('ipfs://') || formData.uri.startsWith('0g://')) && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Hash: {formData.uri.replace(/^(ipfs|0g):\/\//, '').substring(0, 20)}...
                    {formData.storageProvider === '0g' && formData.zkPrivacy && (
                      <span className="ml-2 text-accent">🔒 ZK Protected</span>
                    )}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={handleInputChange('description')}
                  rows={3}
                  placeholder="Brief description of your dataset..."
                  data-testid="textarea-description"
                />
              </div>
            </div>

            {/* Tags - Full Width */}
            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={handleInputChange('tags')}
                placeholder="machine-learning, nlp, classification"
                data-testid="input-tags"
              />
            </div>

            {/* Protection Options - Enhanced Layout */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-primary" />
                  Data Protection Settings
                </h3>
              </div>
              
              {/* Ownership Protection - Always ON */}
              <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-primary rounded-full">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-primary">Ownership Protection</Label>
                    <p className="text-xs text-primary/80 mt-1">Always enabled by 0G Network - Immutable ownership</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-lg">
                  ON
                </div>
              </div>

              {/* Zero-Knowledge Privacy - Enhanced Toggle */}
              <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl hover:border-primary/30 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full transition-colors ${
                    formData.zkPrivacy 
                      ? 'bg-accent text-accent-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {formData.zkPrivacy ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <Label htmlFor="zkPrivacy" className="text-sm font-semibold cursor-pointer">Zero-Knowledge Privacy</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.zkPrivacy 
                        ? 'Enhanced privacy protection enabled' 
                        : 'Standard privacy (click to enable enhanced protection)'}
                    </p>
                  </div>
                </div>
                <Switch
                  id="zkPrivacy"
                  checked={formData.zkPrivacy}
                  onCheckedChange={(checked) => handleInputChange('zkPrivacy')(checked)}
                  data-testid="switch-zk-privacy"
                  className="data-[state=checked]:bg-accent"
                />
              </div>
              
              {/* Privacy Information Panel */}
              {formData.zkPrivacy && (
                <div className="p-3 bg-accent/5 border border-accent/20 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Info className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="text-accent font-medium mb-1">Enhanced Privacy Active</p>
                      <p className="text-accent/80 text-xs leading-relaxed">
                        Your dataset metadata will be protected using zero-knowledge proofs, ensuring privacy while maintaining verifiability on the blockchain.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Transaction Status Display */}
          {txState.status !== 'idle' && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 border rounded-lg">
                <StatusIndicator />
                
                {txState.txHash && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Transaction Hash:</span>
                      <div className="flex items-center space-x-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {txState.txHash.slice(0, 10)}...{txState.txHash.slice(-8)}
                        </code>
                        {txState.explorerUrl && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            asChild
                            data-testid="button-view-explorer"
                          >
                            <a 
                              href={txState.explorerUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>View</span>
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {txState.blockNumber && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Block Number:</span>
                        <span>{txState.blockNumber.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {txState.gasInfo?.txFee && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Transaction Fee:</span>
                        <span>{parseFloat(txState.gasInfo.txFee).toFixed(6)} ETH</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {txState.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error: {txState.error.code}</AlertTitle>
                  <AlertDescription className="space-y-2">
                    <p>{txState.error.message}</p>
                    {txState.error.suggestion && (
                      <p className="font-medium">{txState.error.suggestion}</p>
                    )}
                    {txState.retryCount > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Retry attempt: {txState.retryCount}
                      </p>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Network Status Warning */}
          {chainId !== OG_GALILEO_CHAIN_ID && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Network Mismatch</AlertTitle>
              <AlertDescription>
                Please switch to 0G Galileo testnet to register datasets.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Submit Button with Status */}
          <div className="space-y-4">
            {/* Wallet and Form Validation Status */}
            {!address && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Wallet Required</AlertTitle>
                <AlertDescription>
                  Please connect your wallet to register datasets on the blockchain.
                </AlertDescription>
              </Alert>
            )}
            
            {address && !isFormValid() && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Form Validation</AlertTitle>
                <AlertDescription>
                  Please fill all required fields: IPFS URI (starting with ipfs://), Dataset Title, and Price (&gt; 0).
                </AlertDescription>
              </Alert>
            )}

            <div className="flex space-x-4">
              <Button 
                type="submit"
                disabled={!address || 
                         !isFormValid() ||
                         txState.status === 'preparing' || 
                         txState.status === 'waiting_for_wallet' || 
                         txState.status === 'submitting' || 
                         txState.status === 'confirming' || 
                         txState.status === 'success'}
                className="flex-1"
                data-testid="button-register-dataset"
                data-wallet-connected={!!address}
                aria-disabled={!address || !isFormValid() || ['preparing', 'waiting_for_wallet', 'submitting', 'confirming', 'success'].includes(txState.status)}
              >
                {!address && 'Connect Wallet to Register'}
                {address && !isFormValid() && 'Complete Form to Register'}
                {address && isFormValid() && txState.status === 'preparing' && 'Preparing...'}
                {address && isFormValid() && txState.status === 'waiting_for_wallet' && 'Waiting for Wallet...'}
                {address && isFormValid() && txState.status === 'submitting' && 'Submitting...'}
                {address && isFormValid() && txState.status === 'confirming' && 'Confirming...'}
                {address && isFormValid() && txState.status === 'success' && 'Dataset Registered!'}
                {address && isFormValid() && (txState.status === 'idle' || txState.status === 'error') && 'Register Dataset'}
              </Button>
            
            {txState.status === 'error' && (
              <Button 
                type="button"
                variant="outline"
                onClick={handleRetry}
                data-testid="button-retry"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            )}

            {(txState.status === 'success' || txState.status === 'error') && (
              <Button 
                type="button"
                variant="secondary"
                onClick={resetForm}
                data-testid="button-reset"
              >
                New Dataset
              </Button>
            )}
          </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}