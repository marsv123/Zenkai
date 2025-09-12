'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { ShoppingCart, Package, Trash2, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import addresses from '@/constants/addresses.json';

interface Dataset {
  id: string;
  title: string;
  price: string;
  category: string;
  owner: string;
}

interface BatchOperationsProps {
  selectedDatasets: Dataset[];
  onClearSelection: () => void;
  onPurchaseComplete: (datasetIds: string[]) => void;
}

export default function BatchOperations({ 
  selectedDatasets, 
  onClearSelection, 
  onPurchaseComplete 
}: BatchOperationsProps) {
  const { address } = useAccount();
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedItems, setProcessedItems] = useState<string[]>([]);
  const [failedItems, setFailedItems] = useState<string[]>([]);

  const { writeContract, isPending: isContractPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt();

  if (selectedDatasets.length === 0) {
    return null;
  }

  const totalPrice = selectedDatasets.reduce((sum, dataset) => 
    sum + parseFloat(dataset.price), 0
  );

  const uniqueOwners = [...new Set(selectedDatasets.map(d => d.owner))];
  const datasetsByOwner = uniqueOwners.reduce((acc, owner) => {
    acc[owner] = selectedDatasets.filter(d => d.owner === owner);
    return acc;
  }, {} as Record<string, Dataset[]>);

  const handleBatchPurchase = async () => {
    if (!address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to make purchases.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessedItems([]);
    setFailedItems([]);

    try {
      // Process purchases by owner to batch efficiently
      for (const [owner, datasets] of Object.entries(datasetsByOwner)) {
        try {
          const datasetIds = datasets.map(d => BigInt(d.id));
          const totalOwnerPrice = datasets.reduce((sum, d) => sum + parseFloat(d.price), 0);

          // Call smart contract for batch purchase
          await writeContract({
            address: addresses.ZatoriMarketplace as `0x${string}`,
            abi: [
              {
                name: "batchPurchaseDatasets",
                type: "function",
                stateMutability: "payable",
                inputs: [
                  { name: "datasetIds", type: "uint256[]" },
                  { name: "seller", type: "address" }
                ],
                outputs: []
              }
            ],
            functionName: 'batchPurchaseDatasets',
            args: [datasetIds, owner as `0x${string}`],
            value: parseEther(totalOwnerPrice.toString()),
          });

          // Record successful purchases
          const purchasedIds = datasets.map(d => d.id);
          setProcessedItems(prev => [...prev, ...purchasedIds]);

          // Store purchase records in database
          for (const dataset of datasets) {
            try {
              const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  txHash: `batch_${Date.now()}_${dataset.id}`, // Temporary hash
                  datasetId: dataset.id,
                  buyerId: address,
                  sellerId: dataset.owner,
                  amount: dataset.price,
                  status: 'pending',
                  transactionType: 'purchase',
                }),
              });

              if (!response.ok) {
                console.error(`Failed to record purchase for dataset ${dataset.id}`);
              }
            } catch (error) {
              console.error(`Database error for dataset ${dataset.id}:`, error);
            }
          }

          toast({
            title: "Batch Purchase Successful",
            description: `Successfully purchased ${datasets.length} datasets from ${owner.slice(0, 6)}...${owner.slice(-4)}`,
          });

        } catch (error) {
          console.error(`Failed to purchase from ${owner}:`, error);
          const failedIds = datasets.map(d => d.id);
          setFailedItems(prev => [...prev, ...failedIds]);
          
          toast({
            title: "Purchase Failed",
            description: `Failed to purchase datasets from ${owner.slice(0, 6)}...${owner.slice(-4)}`,
            variant: "destructive",
          });
        }
      }

      // Notify parent component of successful purchases
      onPurchaseComplete(processedItems);

    } catch (error) {
      console.error('Batch purchase error:', error);
      toast({
        title: "Batch Purchase Error",
        description: "An error occurred during batch purchase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getItemStatus = (datasetId: string) => {
    if (failedItems.includes(datasetId)) return 'failed';
    if (processedItems.includes(datasetId)) return 'success';
    if (isProcessing) return 'processing';
    return 'pending';
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-card border border-border rounded-lg shadow-lg p-4 min-w-96 max-w-2xl z-50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Package className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">
            {selectedDatasets.length} Dataset{selectedDatasets.length > 1 ? 's' : ''} Selected
          </h3>
        </div>
        
        <button
          onClick={onClearSelection}
          className="text-muted-foreground hover:text-foreground transition-colors"
          data-testid="button-clear-selection"
          disabled={isProcessing}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Selected Items List */}
      <div className="max-h-48 overflow-y-auto mb-4">
        <div className="space-y-2">
          {selectedDatasets.map((dataset) => {
            const status = getItemStatus(dataset.id);
            return (
              <div 
                key={dataset.id} 
                className="flex items-center justify-between p-2 bg-muted/30 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <div className="text-sm font-medium truncate">{dataset.title}</div>
                    <div className="text-xs text-muted-foreground">{dataset.category}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Owner: {dataset.owner.slice(0, 6)}...{dataset.owner.slice(-4)}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="text-sm font-medium">{dataset.price} IMT</div>
                  
                  {status === 'success' && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  {status === 'failed' && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  {status === 'processing' && (
                    <Loader className="w-4 h-4 text-primary animate-spin" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Purchase Summary */}
      <div className="border-t border-border pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            {uniqueOwners.length} seller{uniqueOwners.length > 1 ? 's' : ''} • 
            {selectedDatasets.length} item{selectedDatasets.length > 1 ? 's' : ''}
          </div>
          <div className="text-lg font-bold text-primary">
            Total: {totalPrice.toFixed(2)} IMT
          </div>
        </div>

        {/* Batch by Owner Breakdown */}
        {uniqueOwners.length > 1 && (
          <div className="mb-4 text-xs text-muted-foreground">
            <div className="font-medium mb-1">Grouped by seller:</div>
            {Object.entries(datasetsByOwner).map(([owner, datasets]) => (
              <div key={owner} className="flex justify-between">
                <span>{owner.slice(0, 6)}...{owner.slice(-4)}</span>
                <span>{datasets.length} items - {datasets.reduce((sum, d) => sum + parseFloat(d.price), 0).toFixed(2)} IMT</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex space-x-2">
          <button
            onClick={handleBatchPurchase}
            disabled={isProcessing || isContractPending || isConfirming || !address}
            className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium"
            data-testid="button-batch-purchase"
          >
            {(isProcessing || isContractPending || isConfirming) ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>
                  {isContractPending ? 'Waiting for wallet...' :
                   isConfirming ? 'Confirming...' : 'Processing...'}
                </span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Purchase All ({totalPrice.toFixed(2)} IMT)</span>
              </>
            )}
          </button>
          
          <button
            onClick={onClearSelection}
            disabled={isProcessing}
            className="px-4 py-3 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
            data-testid="button-cancel-batch"
          >
            Cancel
          </button>
        </div>

        {/* Progress Indicator */}
        {isProcessing && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{processedItems.length + failedItems.length} / {selectedDatasets.length}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all"
                style={{ 
                  width: `${((processedItems.length + failedItems.length) / selectedDatasets.length) * 100}%` 
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}