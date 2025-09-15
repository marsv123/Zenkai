'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from 'wagmi';
import { parseEther, formatEther, BaseError as ViemBaseError } from 'viem';
import { Link, DollarSign, Upload, ExternalLink, AlertCircle, CheckCircle, Clock, RefreshCw, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
  price: string;
  category: string;
  title: string;
  description: string;
  tags: string;
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
    price: '',
    category: 'Machine Learning',
    title: '',
    description: '',
    tags: ''
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
          price: formData.price,
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
    const uriValid = formData.uri.trim() !== '' && formData.uri.startsWith('ipfs://');
    const titleValid = formData.title.trim() !== '';
    const priceValid = formData.price.trim() !== '' && parseFloat(formData.price) > 0;
    
    // Debug logging for form validation
    console.log('Form validation check:', {
      uri: formData.uri,
      uriValid,
      title: formData.title,
      titleValid,
      price: formData.price,
      priceValid,
      overall: uriValid && titleValid && priceValid
    });
    
    return uriValid && titleValid && priceValid;
  }, [formData]);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData({
      uri: '',
      price: '',
      category: 'Machine Learning',
      title: '',
      description: '',
      tags: ''
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
    if (!formData.uri || !formData.price || !formData.title) {
      toast({
        variant: "destructive",
        title: "Missing Required Fields",
        description: "Please fill in URI, price, and title.",
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

    const priceValue = parseFloat(formData.price);
    if (isNaN(priceValue) || priceValue <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Price",
        description: "Please enter a valid price greater than 0.",
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
      const transactionId = await createTransactionRecord(datasetId, formData.price);
      
      setTxState(prev => ({ 
        ...prev, 
        status: 'waiting_for_wallet',
        transactionId 
      }));

      // Phase 3: Submit blockchain transaction
      const priceInWei = parseEther(formData.price);
      
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
  }, [address, chainId, switchChain, formData, toast, createDraftDataset, createTransactionRecord, writeContract]);

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string
  ) => {
    const value = typeof e === 'string' ? e : e.target.value;
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
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          <Upload className="w-6 h-6 text-primary" />
          <span>Register Dataset</span>
        </CardTitle>
        <CardDescription>
          Upload your AI dataset to the decentralized marketplace on 0G Network
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
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
                <Label htmlFor="uri">IPFS URI *</Label>
                <div className="relative">
                  <Input
                    id="uri"
                    value={formData.uri}
                    onChange={handleInputChange('uri')}
                    className="pl-10"
                    placeholder="ipfs://QmExampleHashHere123456789..."
                    required
                    data-testid="input-uri"
                  />
                  <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="price">Price (IMT) *</Label>
                <div className="relative">
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange('price')}
                    className="pl-10"
                    placeholder="10.50"
                    step="0.01"
                    min="0"
                    required
                    data-testid="input-price"
                  />
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
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
          
          {/* Submit Button */}
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
              onClick={(e) => {
                console.log('Button clicked, validation state:', {
                  address: !!address,
                  isFormValid: isFormValid(),
                  txStatus: txState.status,
                  formData
                });
              }}
            >
              {txState.status === 'preparing' && 'Preparing...'}
              {txState.status === 'waiting_for_wallet' && 'Waiting for Wallet...'}
              {txState.status === 'submitting' && 'Submitting...'}
              {txState.status === 'confirming' && 'Confirming...'}
              {txState.status === 'success' && 'Dataset Registered!'}
              {(txState.status === 'idle' || txState.status === 'error') && 'Register Dataset'}
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
        </form>
      </CardContent>
    </Card>
  );
}