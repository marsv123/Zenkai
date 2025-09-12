'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { useQuery } from '@tanstack/react-query';
import { Brain, Wallet, Upload, Store, User, Plus, ShoppingCart, Eye, Wand2, Star } from 'lucide-react';
import WalletConnect from '@/components/WalletConnect';
import DatasetRegistration from '@/components/DatasetRegistration';
import DatasetCard from '@/components/DatasetCard';
// Dataset type definition for frontend
interface Dataset {
  id: string;
  contractId?: number;
  ownerId: string;
  title: string;
  description: string;
  category: string;
  tags?: string[];
  ipfsHash: string;
  metadataUrl?: string;
  price: string;
  isActive: boolean;
  downloads: number;
  rating?: string;
  reviewCount: number;
  aiSummary?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Transaction {
  id: string;
  txHash: string;
  buyerId: string;
  sellerId: string;
  datasetId: string;
  amount: string;
  status: string;
  blockNumber?: number;
  gasUsed?: string;
  gasPrice?: string;
  createdAt: Date;
  confirmedAt?: Date;
}

// Import contract addresses and ABIs
import addresses from '@/constants/addresses.json';
import datasetRegistryAbi from '@/constants/abi/DatasetRegistry.json';

export default function Home() {
  const { address } = useAccount();
  const [stats, setStats] = useState({
    datasetCount: 0,
    totalVolume: 0,
    contributorCount: 0,
    avgScore: 0
  });

  // Fetch datasets from database API
  const { data: datasets = [], isLoading: isLoadingDatasets } = useQuery({
    queryKey: ['/api/datasets'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch user's owned datasets if connected
  const { data: userDatasets = [] } = useQuery({
    queryKey: ['/api/datasets/owner/wallet', address],
    enabled: !!address,
  });

  // Fetch user's transactions if connected
  const { data: userTransactions = [] } = useQuery({
    queryKey: ['/api/transactions/user/wallet', address],
    enabled: !!address,
  });

  // Update stats when datasets change
  useEffect(() => {
    if (datasets.length > 0) {
      const totalVolume = userTransactions.reduce((sum, tx) => 
        sum + parseFloat(tx.amount || '0'), 0
      );
      const avgRating = datasets.reduce((sum, ds) => 
        sum + parseFloat(ds.rating || '0'), 0
      ) / datasets.length;

      setStats({
        datasetCount: datasets.length,
        totalVolume: Math.round(totalVolume),
        contributorCount: new Set(datasets.map(ds => ds.ownerId)).size,
        avgScore: Math.round(avgRating * 10) / 10
      });
    }
  }, [datasets, userTransactions]);

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
          
          {/* Real Dataset Cards from Database */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingDatasets ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-6 animate-pulse">
                  <div className="h-4 bg-muted rounded mb-3"></div>
                  <div className="h-3 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded mb-4"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              ))
            ) : datasets.length > 0 ? (
              // Real datasets from database
              datasets.slice(0, 6).map((dataset) => (
                <DatasetCard
                  key={dataset.id}
                  id={parseInt(dataset.contractId?.toString() || '0')}
                  title={dataset.title}
                  description={dataset.description}
                  category={dataset.category}
                  price={dataset.price}
                  score={parseFloat(dataset.rating || '0')}
                  owner={dataset.ownerId.slice(0, 6) + '...' + dataset.ownerId.slice(-4)}
                  onBuy={() => console.log('Buy dataset:', dataset.id)}
                  onViewMetadata={() => console.log('View metadata:', dataset.ipfsHash)}
                  onAiSummarize={async () => {
                    if (dataset.aiSummary) {
                      alert(`AI Summary: ${dataset.aiSummary}`);
                    } else {
                      console.log('Generate AI summary for:', dataset.ipfsHash);
                    }
                  }}
                />
              ))
            ) : (
              // Empty state
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <Store className="mx-auto mb-4 text-4xl opacity-50" />
                <h4 className="text-lg font-medium mb-2">No datasets available</h4>
                <p>Be the first to publish a dataset to the marketplace!</p>
              </div>
            )}
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
                  Your Published Datasets ({userDatasets.length})
                </h4>
                
                <div className="space-y-3">
                  {userDatasets.length > 0 ? (
                    <>
                      {userDatasets.slice(0, 3).map((dataset) => (
                        <div key={dataset.id} className="p-3 bg-muted/50 rounded-lg">
                          <div className="font-medium text-sm">{dataset.title}</div>
                          <div className="text-xs text-muted-foreground">{dataset.price} IMT</div>
                        </div>
                      ))}
                      {userDatasets.length > 3 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{userDatasets.length - 3} more datasets
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No published datasets yet
                    </div>
                  )}
                  
                  <button className="w-full py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors">
                    View All Published
                  </button>
                </div>
              </div>
              
              {/* Purchased Datasets */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h4 className="font-semibold mb-4 flex items-center">
                  <ShoppingCart className="text-secondary mr-2" />
                  Your Purchased Datasets ({userTransactions.filter(tx => tx.buyerId === address).length})
                </h4>
                
                <div className="space-y-3">
                  {userTransactions.filter(tx => tx.buyerId === address).length > 0 ? (
                    <>
                      {userTransactions.filter(tx => tx.buyerId === address).slice(0, 3).map((transaction) => (
                        <div key={transaction.id} className="p-3 bg-muted/50 rounded-lg">
                          <div className="font-medium text-sm">Transaction {transaction.txHash?.slice(0, 8)}...</div>
                          <div className="text-xs text-muted-foreground">{transaction.amount} IMT</div>
                        </div>
                      ))}
                      {userTransactions.filter(tx => tx.buyerId === address).length > 3 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{userTransactions.filter(tx => tx.buyerId === address).length - 3} more purchases
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No purchased datasets yet
                    </div>
                  )}
                  
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
