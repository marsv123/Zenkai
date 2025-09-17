'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useSwitchChain, useChainId } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { ShoppingCart, CheckCircle, AlertCircle, Clock, RefreshCw, ExternalLink, Zap, Network, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

// Import contract configurations
import contractAddresses from '@/lib/contracts/addresses.json';
import contractAbis from '@/lib/contracts/abis.json';

// Contract configurations
const ZAI_TOKEN_ADDRESS = contractAddresses.ZAI as `0x${string}`;
const DATASET_REGISTRY_ADDRESS = contractAddresses.DatasetRegistry as `0x${string}`;
const CHAIN_ID = contractAddresses.chainId;

const ZAI_TOKEN_ABI = contractAbis.ZAI as const;
const DATASET_REGISTRY_ABI = contractAbis.DatasetRegistry as const;

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
  step: 'idle' | 'checking' | 'wrong_chain' | 'approving' | 'ready_to_buy' | 'purchasing' | 'success' | 'error';
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
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [purchaseState, setPurchaseState] = useState<PurchaseState>({
    step: 'idle',
    needsApproval: false
  });

  // Contract interactions
  const { writeContract: approveZAI, data: approveHash, isPending: isApproving, error: approveError } = useWriteContract();
  const { writeContract: buyDataset, data: buyHash, isPending: isBuying, error: buyError } = useWriteContract();
  
  // Wait for approval transaction
  const { isSuccess: isApproveConfirmed, error: approveReceiptError } = useWaitForTransactionReceipt({
    hash: approveHash,
  });
  
  // Wait for buy transaction
  const { isSuccess: isBuyConfirmed, data: buyReceipt, error: buyReceiptError } = useWaitForTransactionReceipt({
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

  // Check allowance on approval confirmation and set to ready state
  useEffect(() => {
    if (isApproveConfirmed) {
      refetchAllowance();
      setPurchaseState(prev => ({ ...prev, step: 'ready_to_buy', needsApproval: false }));
      toast({
        title: "Approval Confirmed",
        description: "ZAI tokens approved. You can now purchase the dataset.",
      });
    }
  }, [isApproveConfirmed, refetchAllowance, toast]);

  // Handle approval errors
  useEffect(() => {
    if (approveError) {
      const errorMessage = getErrorMessage(approveError);
      setPurchaseState(prev => ({
        ...prev,
        step: 'error',
        error: errorMessage
      }));
      toast({
        title: "Approval Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [approveError, toast]);

  // Handle buy errors
  useEffect(() => {
    if (buyError) {
      const errorMessage = getErrorMessage(buyError);
      setPurchaseState(prev => ({
        ...prev,
        step: 'error',
        error: errorMessage
      }));
      toast({
        title: "Purchase Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [buyError, toast]);

  // Handle transaction receipt errors
  useEffect(() => {
    if (approveReceiptError || buyReceiptError) {
      const error = approveReceiptError || buyReceiptError;
      setPurchaseState(prev => ({
        ...prev,
        step: 'error',
        error: 'Transaction failed or was reverted'
      }));
      toast({
        title: "Transaction Failed",
        description: "The transaction was reverted. Please try again.",
        variant: "destructive"
      });
    }
  }, [approveReceiptError, buyReceiptError, toast]);

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

  // Helper function to get user-friendly error messages
  const getErrorMessage = useCallback((error: any): string => {
    if (!error) return 'Unknown error occurred';
    
    const message = error.message || error.toString();
    
    if (message.includes('User rejected')) {
      return 'Transaction was cancelled by user';
    }
    if (message.includes('insufficient funds')) {
      return 'Insufficient funds for transaction';
    }
    if (message.includes('ERC20InsufficientBalance')) {
      return 'Insufficient ZAI token balance';
    }
    if (message.includes('ERC20InsufficientAllowance')) {
      return 'Token allowance too low. Please approve more tokens.';
    }
    if (message.includes('network')) {
      return 'Please check your network connection and try again';
    }
    
    return 'Transaction failed. Please try again.';
  }, []);

  const checkApprovalNeeded = useCallback(async () => {
    if (!address || !currentAllowance || !dataset.price) return;

    setPurchaseState(prev => ({ ...prev, step: 'checking' }));

    try {
      // Check if user is on correct chain
      if (chainId !== CHAIN_ID) {
        setPurchaseState(prev => ({
          ...prev,
          step: 'wrong_chain',
          needsApproval: false
        }));
        return;
      }

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
  }, [address, currentAllowance, dataset.price, chainId]);

  const handleSwitchChain = useCallback(async () => {
    try {
      await switchChain({ chainId: CHAIN_ID });
      // Recheck approval after chain switch
      setTimeout(() => {
        checkApprovalNeeded();
      }, 1000);
    } catch (error) {
      toast({
        title: "Network Switch Failed",
        description: "Please manually switch to the correct network in your wallet.",
        variant: "destructive"
      });
    }
  }, [switchChain, checkApprovalNeeded, toast]);

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
      const errorMessage = getErrorMessage(error);
      setPurchaseState(prev => ({
        ...prev,
        step: 'error',
        error: errorMessage
      }));
      toast({
        title: "Approval Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [address, dataset.price, approveZAI, getErrorMessage, toast]);

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
      const errorMessage = getErrorMessage(error);
      setPurchaseState(prev => ({
        ...prev,
        step: 'error',
        error: errorMessage
      }));
      toast({
        title: "Purchase Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [address, dataset.contractId, buyDataset, getErrorMessage, toast]);

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
      case 'wrong_chain': return <Network className="w-4 h-4 text-orange-500" />;
      case 'approving': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'ready_to_buy': return <Zap className="w-4 h-4 text-green-500" />;
      case 'purchasing': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <ShoppingCart className="w-4 h-4" />;
    }
  };

  const getStepText = (step: string, needsApproval: boolean) => {
    switch (step) {
      case 'checking': return 'Checking allowance...';
      case 'wrong_chain': return 'Switch Network';
      case 'approving': return 'Approving ZAI tokens...';
      case 'ready_to_buy': return 'Purchase Dataset';
      case 'purchasing': return 'Purchasing dataset...';
      case 'success': return 'Purchase complete!';
      case 'error': return 'Purchase failed';
      default: return needsApproval ? 'Approve ZAI Tokens' : 'Purchase Dataset';
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
            <span className={hasInsufficientBalance ? 'text-red-500' : 'text-green-500'} data-testid="user-zai-balance">
              {parseFloat(userBalance).toFixed(2)} ZAI
            </span>
          </div>

          {/* Wrong Chain Alert */}
          {purchaseState.step === 'wrong_chain' && (
            <Alert>
              <Network className="h-4 w-4" />
              <AlertTitle>Wrong Network</AlertTitle>
              <AlertDescription>
                Please switch to the 0G Galileo Testnet (Chain ID: {CHAIN_ID}) to purchase this dataset.
              </AlertDescription>
            </Alert>
          )}

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
                    data-testid="link-view-transaction"
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
              <Button onClick={resetPurchase} className="flex-1" data-testid="button-close-purchase">
                Close
              </Button>
            ) : purchaseState.step === 'wrong_chain' ? (
              <Button
                onClick={handleSwitchChain}
                className="flex-1"
                data-testid="button-switch-chain"
              >
                <div className="flex items-center space-x-2">
                  {getStepIcon(purchaseState.step)}
                  <span>Switch to 0G Galileo Testnet</span>
                </div>
              </Button>
            ) : purchaseState.needsApproval && purchaseState.step !== 'purchasing' && purchaseState.step !== 'ready_to_buy' ? (
              <Button
                onClick={handleApprove}
                disabled={isApproving || hasInsufficientBalance || purchaseState.step === 'checking'}
                className="flex-1"
                data-testid="button-approve-tokens"
              >
                <div className="flex items-center space-x-2">
                  {getStepIcon(purchaseState.step)}
                  <span>{getStepText(purchaseState.step, purchaseState.needsApproval)}</span>
                </div>
              </Button>
            ) : (
              <Button
                onClick={handlePurchase}
                disabled={isBuying || hasInsufficientBalance || ['checking', 'approving', 'wrong_chain'].includes(purchaseState.step)}
                className="flex-1"
                data-testid="button-purchase-dataset"
              >
                <div className="flex items-center space-x-2">
                  {getStepIcon(purchaseState.step)}
                  <span>{getStepText(purchaseState.step, purchaseState.needsApproval)}</span>
                </div>
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsOpen(false)} data-testid="button-cancel-purchase">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}