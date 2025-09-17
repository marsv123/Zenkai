'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from 'wagmi';
import { parseEther, formatEther, BaseError as ViemBaseError } from 'viem';
import { Link, Upload, ExternalLink, AlertCircle, CheckCircle, Clock, RefreshCw, Info, Shield, Eye, EyeOff, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  const { toast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    uri: '',
    category: 'Machine Learning',
    title: '',
    description: '',
    tags: '',
    zkPrivacy: false,
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
      const response = await fetch('/api/datasets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId: address,
          title: formData.title || 'Untitled Dataset',
          description: formData.description,
          category: formData.category,
          ipfsHash: formData.uri,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          isActive: false // Keep inactive until blockchain confirmation
        })
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
    const isValid = formData.uri.trim() !== '' && 
           formData.uri.startsWith('ipfs://') &&
           formData.title.trim() !== '';
    
    // Debug logging for testing
    if (import.meta.env.DEV) {
      console.log('Form validation:', {
        uri: formData.uri,
        uriValid: formData.uri.trim() !== '' && formData.uri.startsWith('ipfs://'),
        title: formData.title,
        titleValid: formData.title.trim() !== '',
        isValid,
        address
      });
    }
    
    return isValid;
  }, [formData, address]);

  // Upload file to IPFS
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

    // Auto-upload to IPFS
    const ipfsUri = await uploadFileToIPFS(file);
    if (ipfsUri) {
      setFormData(prev => ({ ...prev, uri: ipfsUri }));
    }
  }, [uploadFileToIPFS, toast]);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData({
      uri: '',
      category: 'Machine Learning',
      title: '',
      description: '',
      tags: '',
      zkPrivacy: false,
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

    if (!formData.uri.startsWith('ipfs://')) {
      toast({
        variant: "destructive",
        title: "Invalid URI",
        description: "URI must start with ipfs://",
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

  return (
    <Card className="max-w-4xl mx-auto">
      
      <CardContent>
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
                      <span className="text-sm text-primary">Uploading to IPFS...</span>
                    ) : formData.file ? (
                      <div>
                        <span className="text-sm font-medium text-green-600">✓ {formData.file.name}</span>
                        <p className="text-xs text-muted-foreground">
                          {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <span className="text-sm font-medium">Click to upload or drag and drop</span>
                        <p className="text-xs text-muted-foreground">CSV, JSON, TXT, Parquet, Excel, ZIP files up to 100MB</p>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* IPFS URI & Description - Same Row */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="uri">IPFS URI *</Label>
                <div className="relative">
                  <Input
                    id="uri"
                    value={formData.uri}
                    onChange={handleInputChange('uri')}
                    className="pl-10"
                    placeholder={formData.file ? "Auto-filled from upload..." : "ipfs://QmExampleHashHere123456789..."}
                    required
                    data-testid="input-uri"
                    readOnly={isUploading}
                  />
                  <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  {formData.uri && formData.uri.startsWith('ipfs://') && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  )}
                </div>
                {formData.uri && formData.uri.startsWith('ipfs://') && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Hash: {formData.uri.replace('ipfs://', '').substring(0, 20)}...
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

            {/* Protection Options */}
            <div className="space-y-4">
              {/* Ownership Protection - Static Indicator */}
              <div className="flex items-center p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center justify-center w-5 h-5 bg-green-500 rounded-full">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">Ownership Protection</span>
                    <p className="text-xs text-green-600 dark:text-green-400">Always enabled by 0G Network</p>
                  </div>
                </div>
              </div>

              {/* Zero-Knowledge Privacy - Toggle */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  {formData.zkPrivacy ? (
                    <EyeOff className="w-4 h-4 text-primary" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                  <div>
                    <Label htmlFor="zkPrivacy" className="text-sm font-medium">Zero-Knowledge Privacy</Label>
                    <p className="text-xs text-muted-foreground">Optional privacy protection for dataset content</p>
                  </div>
                </div>
                <Switch
                  id="zkPrivacy"
                  checked={formData.zkPrivacy}
                  onCheckedChange={(checked) => handleInputChange('zkPrivacy')(checked)}
                  data-testid="switch-zk-privacy"
                />
              </div>
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