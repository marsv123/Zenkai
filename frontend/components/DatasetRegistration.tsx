'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { Link, DollarSign, Upload } from 'lucide-react';
import addresses from '@/constants/addresses.json';
import datasetRegistryAbi from '@/constants/abi/DatasetRegistry.json';

export default function DatasetRegistration() {
  const { address } = useAccount();
  const [formData, setFormData] = useState({
    uri: '',
    price: '',
    category: 'Machine Learning',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<'idle' | 'preparing' | 'waiting' | 'confirming' | 'success' | 'error'>('idle');

  const { writeContract, data: hash, error: writeError } = useWriteContract();
  
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed, 
    error: receiptError 
  } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset previous errors
    setError(null);
    setTxStatus('preparing');
    
    if (!address) {
      setError('Please connect your wallet first');
      setTxStatus('error');
      return;
    }

    if (!formData.uri || !formData.price) {
      setError('Please fill in all required fields');
      setTxStatus('error');
      return;
    }

    if (!formData.uri.startsWith('ipfs://')) {
      setError('URI must start with ipfs://');
      setTxStatus('error');
      return;
    }

    try {
      setIsLoading(true);
      setTxStatus('waiting');
      
      const priceInWei = parseEther(formData.price);
      
      // Store dataset in database first
      const response = await fetch('/api/datasets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerId: address,
          title: formData.description || 'Dataset',
          description: formData.description,
          category: formData.category,
          ipfsHash: formData.uri,
          price: formData.price,
          tags: [formData.category],
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to store dataset metadata');
      }
      
      // Now register on blockchain
      writeContract({
        address: addresses.DatasetRegistry as `0x${string}`,
        abi: datasetRegistryAbi,
        functionName: 'register',
        args: [formData.uri, priceInWei],
      });
      
    } catch (error: any) {
      console.error('Registration failed:', error);
      setError(error.message || 'Registration failed. Please try again.');
      setTxStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Track transaction status changes
  useEffect(() => {
    if (writeError) {
      setError(writeError.message || 'Transaction failed');
      setTxStatus('error');
    } else if (receiptError) {
      setError(receiptError.message || 'Transaction confirmation failed');
      setTxStatus('error');
    } else if (hash && !isConfirming && !isConfirmed) {
      setTxStatus('confirming');
    } else if (isConfirming) {
      setTxStatus('confirming');
    } else if (isConfirmed) {
      setTxStatus('success');
      // Reset form on successful confirmation
      setTimeout(() => {
        setFormData({
          uri: '',
          price: '',
          category: 'Machine Learning',
          description: ''
        });
        setTxStatus('idle');
        setError(null);
      }, 3000);
    }
  }, [writeError, receiptError, hash, isConfirming, isConfirmed]);

  return (
    <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Dataset URI</label>
          <div className="relative">
            <input 
              type="text" 
              name="uri"
              value={formData.uri}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent pl-12"
              placeholder="ipfs://QmExampleHashHere123456789..."
              required
            />
            <Link className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Price (IMT)</label>
          <div className="relative">
            <input 
              type="number" 
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent pl-12"
              placeholder="10.50"
              required
            />
            <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <select 
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            <option>Machine Learning</option>
            <option>Natural Language Processing</option>
            <option>Computer Vision</option>
            <option>Audio Processing</option>
            <option>Financial Data</option>
            <option>Bioinformatics</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea 
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
            rows={3}
            placeholder="Brief description of your dataset..."
          />
        </div>
      </div>
      
      <div className="md:col-span-2 space-y-4">
        {/* Transaction Status Display */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {hash && (
          <div className="p-4 bg-muted/50 border border-border rounded-lg text-sm">
            <div className="flex items-center justify-between">
              <span>Transaction Hash:</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">
                {hash.slice(0, 10)}...{hash.slice(-8)}
              </code>
            </div>
            <div className="mt-2 flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                txStatus === 'confirming' ? 'bg-yellow-500 animate-pulse' :
                txStatus === 'success' ? 'bg-green-500' :
                txStatus === 'error' ? 'bg-red-500' : 'bg-gray-500'
              }`}></div>
              <span className="capitalize text-muted-foreground">
                {txStatus === 'confirming' ? 'Confirming on blockchain...' :
                 txStatus === 'success' ? 'Transaction confirmed!' :
                 txStatus === 'error' ? 'Transaction failed' :
                 'Processing...'}
              </span>
            </div>
          </div>
        )}
        
        <button 
          type="submit"
          disabled={!address || isLoading || isConfirming || txStatus === 'success'}
          className="w-full px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
        >
          {(isLoading || isConfirming) ? (
            <div className="animate-spin w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full" />
          ) : txStatus === 'success' ? (
            <div className="w-5 h-5 text-green-400">✓</div>
          ) : (
            <Upload className="w-5 h-5" />
          )}
          <span>
            {txStatus === 'preparing' ? 'Preparing...' :
             txStatus === 'waiting' ? 'Waiting for wallet...' :
             txStatus === 'confirming' ? 'Confirming...' :
             txStatus === 'success' ? 'Dataset Published!' :
             txStatus === 'error' ? 'Try Again' :
             'Publish Dataset'}
          </span>
        </button>
      </div>
    </form>
  );
}
