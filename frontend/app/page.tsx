'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { Brain, Wallet, Upload, Store, User, Plus, ShoppingCart, Eye, Wand2, Star } from 'lucide-react';
import WalletConnect from '@/components/WalletConnect';
import DatasetRegistration from '@/components/DatasetRegistration';
import DatasetCard from '@/components/DatasetCard';

// Import contract addresses and ABIs
import addresses from '@/constants/addresses.json';
import datasetRegistryAbi from '@/constants/abi/DatasetRegistry.json';

interface Dataset {
  id: number;
  owner: string;
  uri: string;
  price: bigint;
  score: number;
  active: boolean;
  totalSales: number;
}

export default function Home() {
  const { address } = useAccount();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [stats, setStats] = useState({
    datasetCount: 0,
    totalVolume: 0,
    contributorCount: 0,
    avgScore: 0
  });

  // Read dataset count from contract
  const { data: datasetCount } = useReadContract({
    address: addresses.DatasetRegistry as `0x${string}`,
    abi: datasetRegistryAbi,
    functionName: 'getDatasetCount',
  });

  // Load datasets when count changes
  useEffect(() => {
    if (datasetCount && typeof datasetCount === 'bigint') {
      loadDatasets(Number(datasetCount));
    }
  }, [datasetCount]);

  const loadDatasets = async (count: number) => {
    const loadedDatasets: Dataset[] = [];
    
    for (let i = 1; i <= count; i++) {
      try {
        // This would normally use useReadContract in a loop, but for simplicity
        // we'll create empty dataset objects. In production, you'd batch these calls.
        const dataset: Dataset = {
          id: i,
          owner: '0x0000000000000000000000000000000000000000',
          uri: '',
          price: 0n,
          score: 0,
          active: true,
          totalSales: 0
        };
        
        loadedDatasets.push(dataset);
      } catch (error) {
        console.error(`Failed to load dataset ${i}:`, error);
      }
    }
    
    setDatasets(loadedDatasets);
    
    // Update stats
    setStats({
      datasetCount: count,
      totalVolume: 1247, // This would be calculated from actual data
      contributorCount: 89, // This would come from ContributorNFT contract
      avgScore: 4.7 // This would be calculated from dataset scores
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Brain className="text-lg text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Zatori</h1>
              <p className="text-sm text-muted-foreground">Intelligence Marketplace</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Network Status */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-secondary/10 rounded-full">
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
              <span className="text-sm text-secondary-foreground">0G Galileo</span>
            </div>
            
            {/* Wallet Connection */}
            <WalletConnect />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero Section */}
        <section className="text-center py-12">
          <h2 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Decentralized Intelligence Marketplace
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Register, trade, and consume AI datasets on the 0G Network. 
            Powered by IPFS storage and smart contract security.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-card p-4 rounded-lg border border-border">
              <div className="text-2xl font-bold text-primary">{stats.datasetCount}</div>
              <div className="text-sm text-muted-foreground">Active Datasets</div>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <div className="text-2xl font-bold text-secondary">{stats.totalVolume.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">IMT Volume</div>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <div className="text-2xl font-bold text-accent">{stats.contributorCount}</div>
              <div className="text-sm text-muted-foreground">Contributors</div>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <div className="text-2xl font-bold text-foreground">{stats.avgScore}</div>
              <div className="text-sm text-muted-foreground">Avg Score</div>
            </div>
          </div>
        </section>

        {/* Dataset Registration */}
        <section className="max-w-4xl mx-auto">
          <div className="gradient-border">
            <div className="gradient-border-content p-8">
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <Plus className="text-primary mr-3" />
                Register New Dataset
              </h3>
              <DatasetRegistration />
            </div>
          </div>
        </section>

        {/* Marketplace */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold flex items-center">
              <Store className="text-secondary mr-3" />
              Dataset Marketplace
            </h3>
            
            {/* Filters */}
            <div className="flex items-center space-x-4">
              <select className="px-4 py-2 bg-input border border-border rounded-lg">
                <option>All Categories</option>
                <option>Machine Learning</option>
                <option>NLP</option>
                <option>Computer Vision</option>
              </select>
              
              <select className="px-4 py-2 bg-input border border-border rounded-lg">
                <option>Sort by Latest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Highest Rated</option>
              </select>
            </div>
          </div>
          
          {/* Mock Dataset Cards for Visual Display */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Mock Data for UI Display - Replace with real data */}
            <DatasetCard
              id={1}
              title="ImageNet Classification Dataset"
              description="High-quality labeled image dataset for computer vision training with over 1M samples."
              category="Machine Learning"
              price="25.5"
              score={4.8}
              owner="0x742d...5678"
              onBuy={() => console.log('Buy clicked')}
              onViewMetadata={() => console.log('View metadata clicked')}
              onAiSummarize={() => console.log('AI summarize clicked')}
            />
            
            <DatasetCard
              id={2}
              title="Sentiment Analysis Corpus"
              description="Large-scale sentiment analysis dataset with 500K labeled tweets and reviews."
              category="NLP"
              price="18.0"
              score={4.6}
              owner="0x891a...9012"
              onBuy={() => console.log('Buy clicked')}
              onViewMetadata={() => console.log('View metadata clicked')}
              onAiSummarize={() => console.log('AI summarize clicked')}
            />
            
            <DatasetCard
              id={3}
              title="Crypto Market Data"
              description="Real-time and historical cryptocurrency market data across 200+ assets."
              category="Financial"
              price="45.0"
              score={4.9}
              owner="0x1234...abcd"
              onBuy={() => console.log('Buy clicked')}
              onViewMetadata={() => console.log('View metadata clicked')}
              onAiSummarize={() => console.log('AI summarize clicked')}
            />
          </div>
          
          {/* Load More */}
          <div className="text-center mt-8">
            <button className="px-8 py-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors font-medium">
              Load More Datasets
            </button>
          </div>
        </section>

        {/* User Dashboard */}
        {address && (
          <section className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-6 flex items-center">
              <User className="text-accent mr-3" />
              Your Dashboard
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Published Datasets */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h4 className="font-semibold mb-4 flex items-center">
                  <Upload className="text-primary mr-2" />
                  Your Published Datasets
                </h4>
                
                <div className="space-y-3">
                  <div className="text-center py-8 text-muted-foreground">
                    No published datasets yet
                  </div>
                  
                  <button className="w-full py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors">
                    View All Published
                  </button>
                </div>
              </div>
              
              {/* Purchased Datasets */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h4 className="font-semibold mb-4 flex items-center">
                  <ShoppingCart className="text-secondary mr-2" />
                  Your Purchased Datasets
                </h4>
                
                <div className="space-y-3">
                  <div className="text-center py-8 text-muted-foreground">
                    No purchased datasets yet
                  </div>
                  
                  <button className="w-full py-2 text-sm text-secondary hover:bg-secondary/10 rounded-lg transition-colors">
                    View All Purchases
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <Brain className="text-sm text-primary-foreground" />
                </div>
                <span className="font-bold">Zatori</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Decentralized intelligence marketplace powered by the 0G Network.
              </p>
            </div>
            
            <div>
              <h5 className="font-semibold mb-3">Platform</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Browse Datasets</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Publish Data</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-3">Network</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="https://chainscan-galileo.0g.ai" target="_blank" className="hover:text-foreground transition-colors">0G Explorer</a></li>
                <li><a href="https://evmrpc-testnet.0g.ai" target="_blank" className="hover:text-foreground transition-colors">RPC Endpoint</a></li>
                <li><span className="text-xs">Chain ID: 16601</span></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-3">Community</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">GitHub</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Zatori. Built on the 0G Network. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
