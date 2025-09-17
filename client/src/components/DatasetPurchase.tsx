'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { ShoppingCart, CheckCircle, AlertCircle, Clock, RefreshCw, ExternalLink, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

// Contract configurations
const ZAI_TOKEN_ADDRESS = '0x604966d7123963291058c323B19D293335EcC92a' as `0x${string}`;
const DATASET_REGISTRY_ADDRESS = '0xa7502234A9e90172F237075a1872Ec7fF108FE77' as `0x${string}`;

const ZAI_TOKEN_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const;

const DATASET_REGISTRY_ABI = [
  {
    name: 'buy',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'datasetId', type: 'uint256' }],
    outputs: []
  },
  {
    name: 'hasAccess',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'buyer', type: 'address' },
      { name: 'datasetId', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'getDataset',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'datasetId', type: 'uint256' }],
    outputs: [{
      type: 'tuple',
      components: [
        { name: 'owner', type: 'address' },
        { name: 'uri', type: 'string' },
        { name: 'price', type: 'uint256' },
        { name: 'score', type: 'uint256' },
        { name: 'active', type: 'bool' },
        { name: 'totalSales', type: 'uint256' }
      ]
    }]
  }
] as const;

interface Dataset {
  id: string;
  contractId?: number | null;
  title: string;
  description: string;
  price: string;
  category: string;
  isActive: boolean;
  owner?: {
    walletAddress: string;
  };
}

interface PurchaseState {
  step: 'idle' | 'checking' | 'approving' | 'purchasing' | 'success' | 'error';
  needsApproval: boolean;
  txHash?: string;
  error?: string;
  explorerUrl?: string;
}

function generateExplorerUrl(txHash: string): string {
  return `https://chainscan-galileo.0g.ai/tx/${txHash}`;
}

interface DatasetPurchaseProps {
  dataset: Dataset;
  onPurchaseSuccess?: (dataset: Dataset) => void;
  children?: React.ReactNode;
}

export default function DatasetPurchase({ dataset, onPurchaseSuccess, children }: DatasetPurchaseProps) {
  const { address } = useAccount();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [purchaseState, setPurchaseState] = useState<PurchaseState>({
    step: 'idle',
    needsApproval: false
  });

  // Contract interactions
  const { writeContract: approveZAI, data: approveHash, isPending: isApproving } = useWriteContract();
  const { writeContract: buyDataset, data: buyHash, isPending: isBuying } = useWriteContract();
  
  // Wait for approval transaction
  const { isSuccess: isApproveConfirmed } = useWaitForTransactionReceipt({
    hash: approveHash,
  });
  
  // Wait for buy transaction
  const { isSuccess: isBuyConfirmed, data: buyReceipt } = useWaitForTransactionReceipt({
    hash: buyHash,
  });

  // Check user's ZAI token balance
  const { data: zaiBalance } = useReadContract({
    address: ZAI_TOKEN_ADDRESS,
    abi: ZAI_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Check current allowance
  const { data: currentAllowance, refetch: refetchAllowance } = useReadContract({
    address: ZAI_TOKEN_ADDRESS,
    abi: ZAI_TOKEN_ABI,
    functionName: 'allowance',
    args: address ? [address, DATASET_REGISTRY_ADDRESS] : undefined,
  });

  // Check if user already has access
  const { data: hasAccess } = useReadContract({
    address: DATASET_REGISTRY_ADDRESS,
    abi: DATASET_REGISTRY_ABI,
    functionName: 'hasAccess',
    args: address && dataset.contractId ? [address, BigInt(dataset.contractId)] : undefined,
  });

  // Check allowance on approval confirmation
  useEffect(() => {
    if (isApproveConfirmed) {
      refetchAllowance();
      setPurchaseState(prev => ({ ...prev, step: 'purchasing' }));
    }
  }, [isApproveConfirmed, refetchAllowance]);

  // Handle buy confirmation
  useEffect(() => {
    if (isBuyConfirmed && buyReceipt) {
      setPurchaseState({
        step: 'success',
        needsApproval: false,
        txHash: buyHash,
        explorerUrl: buyHash ? generateExplorerUrl(buyHash) : undefined
      });
      
      toast({
        title: "Purchase Successful!",
        description: `You now have access to ${dataset.title}`,
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/datasets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/user/wallet', address] });
      
      if (onPurchaseSuccess) {
        onPurchaseSuccess(dataset);
      }
    }
  }, [isBuyConfirmed, buyReceipt, buyHash, dataset, toast, onPurchaseSuccess, address]);

  const checkApprovalNeeded = useCallback(async () => {
    if (!address || !currentAllowance || !dataset.price) return;

    setPurchaseState(prev => ({ ...prev, step: 'checking' }));

    try {
      const priceInWei = parseEther(dataset.price);
      const needsApproval = currentAllowance < priceInWei;
      
      setPurchaseState(prev => ({
        ...prev,
        step: 'idle',
        needsApproval
      }));
    } catch (error) {
      console.error('Error checking approval:', error);
      setPurchaseState(prev => ({
        ...prev,
        step: 'error',
        error: 'Failed to check token approval status'
      }));
    }
  }, [address, currentAllowance, dataset.price]);

  // Check approval status when dialog opens
  useEffect(() => {
    if (isOpen && address) {
      checkApprovalNeeded();
    }
  }, [isOpen, address, checkApprovalNeeded]);

  const handleApprove = useCallback(async () => {
    if (!address || !dataset.price) return;

    try {
      setPurchaseState(prev => ({ ...prev, step: 'approving' }));
      const priceInWei = parseEther(dataset.price);
      
      approveZAI({
        address: ZAI_TOKEN_ADDRESS,
        abi: ZAI_TOKEN_ABI,
        functionName: 'approve',
        args: [DATASET_REGISTRY_ADDRESS, priceInWei],
      });
    } catch (error: any) {
      console.error('Approval failed:', error);
      setPurchaseState(prev => ({
        ...prev,
        step: 'error',
        error: error.message || 'Token approval failed'
      }));
    }
  }, [address, dataset.price, approveZAI]);

  const handlePurchase = useCallback(async () => {
    if (!address || !dataset.contractId) return;

    try {
      setPurchaseState(prev => ({ ...prev, step: 'purchasing' }));
      
      buyDataset({
        address: DATASET_REGISTRY_ADDRESS,
        abi: DATASET_REGISTRY_ABI,
        functionName: 'buy',
        args: [BigInt(dataset.contractId)],
      });
    } catch (error: any) {
      console.error('Purchase failed:', error);
      setPurchaseState(prev => ({
        ...prev,
        step: 'error',
        error: error.message || 'Dataset purchase failed'
      }));
    }
  }, [address, dataset.contractId, buyDataset]);

  const resetPurchase = useCallback(() => {
    setPurchaseState({
      step: 'idle',
      needsApproval: false
    });
    setIsOpen(false);
  }, []);

  // Don't show purchase option if user already has access or owns the dataset
  if (hasAccess || (address && dataset.owner?.walletAddress.toLowerCase() === address.toLowerCase())) {
    return null;
  }

  const userBalance = zaiBalance ? formatEther(zaiBalance) : '0';
  const hasInsufficientBalance = parseFloat(userBalance) < parseFloat(dataset.price);

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'checking': return <Clock className="w-4 h-4 animate-pulse" />;
      case 'approving': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'purchasing': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <ShoppingCart className="w-4 h-4" />;
    }
  };

  const getStepText = (step: string, needsApproval: boolean) => {
    switch (step) {
      case 'checking': return 'Checking allowance...';
      case 'approving': return 'Approving ZAI tokens...';
      case 'purchasing': return 'Purchasing dataset...';
      case 'success': return 'Purchase complete!';
      case 'error': return 'Purchase failed';
      default: return needsApproval ? 'Approve & Purchase' : 'Purchase Dataset';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button 
            className="btn-primary flex-1 text-sm group"
            data-testid={`button-purchase-${dataset.id}`}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Purchase
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-primary" />
            <span>Purchase Dataset</span>
          </DialogTitle>
          <DialogDescription>
            Get access to "{dataset.title}" for {dataset.price} ZAI tokens
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Dataset Info */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">{dataset.title}</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">{dataset.description}</p>
            <div className="flex items-center justify-between mt-3">
              <Badge variant="outline">{dataset.category}</Badge>
              <div className="text-lg font-bold text-primary">{dataset.price} ZAI</div>
            </div>
          </div>

          {/* Balance Check */}
          <div className="flex items-center justify-between text-sm">
            <span>Your ZAI Balance:</span>
            <span className={hasInsufficientBalance ? 'text-red-500' : 'text-green-500'}>
              {parseFloat(userBalance).toFixed(2)} ZAI
            </span>
          </div>

          {hasInsufficientBalance && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Insufficient Balance</AlertTitle>
              <AlertDescription>
                You need {dataset.price} ZAI to purchase this dataset. Please add funds to your wallet.
              </AlertDescription>
            </Alert>
          )}

          {purchaseState.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Purchase Failed</AlertTitle>
              <AlertDescription>{purchaseState.error}</AlertDescription>
            </Alert>
          )}

          {purchaseState.step === 'success' && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Purchase Successful!</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>You now have access to this dataset.</p>
                {purchaseState.explorerUrl && (
                  <a
                    href={purchaseState.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-primary hover:underline text-sm"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>View on Explorer</span>
                  </a>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            {purchaseState.step === 'success' ? (
              <Button onClick={resetPurchase} className="flex-1">
                Close
              </Button>
            ) : purchaseState.needsApproval && purchaseState.step !== 'purchasing' ? (
              <Button
                onClick={handleApprove}
                disabled={isApproving || hasInsufficientBalance}
                className="flex-1"
              >
                <div className="flex items-center space-x-2">
                  {getStepIcon(purchaseState.step)}
                  <span>Approve ZAI Tokens</span>
                </div>
              </Button>
            ) : (
              <Button
                onClick={handlePurchase}
                disabled={isBuying || hasInsufficientBalance || purchaseState.step === 'checking'}
                className="flex-1"
              >
                <div className="flex items-center space-x-2">
                  {getStepIcon(purchaseState.step)}
                  <span>{getStepText(purchaseState.step, purchaseState.needsApproval)}</span>
                </div>
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}