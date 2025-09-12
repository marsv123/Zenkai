'use client';

import { useState } from 'react';
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

  const { writeContract, data: hash } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({
      hash,
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    if (!formData.uri || !formData.price) {
      alert('Please fill in all required fields');
      return;
    }

    if (!formData.uri.startsWith('ipfs://')) {
      alert('URI must start with ipfs://');
      return;
    }

    try {
      setIsLoading(true);
      
      const priceInWei = parseEther(formData.price);
      
      writeContract({
        address: addresses.DatasetRegistry as `0x${string}`,
        abi: datasetRegistryAbi,
        functionName: 'register',
        args: [formData.uri, priceInWei],
      });
      
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Reset form on successful confirmation
  if (isConfirmed) {
    setFormData({
      uri: '',
      price: '',
      category: 'Machine Learning',
      description: ''
    });
  }

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
      
      <div className="md:col-span-2">
        <button 
          type="submit"
          disabled={!address || isLoading || isConfirming}
          className="w-full px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
        >
          {isLoading || isConfirming ? (
            <div className="animate-spin w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full" />
          ) : (
            <Upload className="w-5 h-5" />
          )}
          <span>
            {isLoading ? 'Preparing...' : 
             isConfirming ? 'Confirming...' : 
             isConfirmed ? 'Dataset Published!' : 
             'Publish Dataset'}
          </span>
        </button>
      </div>
    </form>
  );
}
