import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Wallet, Upload, Store, User, ShoppingCart, Eye, Wand2, Star, TrendingUp, Database, ArrowRight, Zap, Brain, Network, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import zenkaiLogoUrl from '@assets/zenkai-logo.png';

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

// Enhanced Featured Dataset Card Component
function FeaturedDatasetCard({ dataset }: { dataset: Dataset }) {
  return (
    <div className="card-elevated glow-primary p-6 h-full" data-testid={`dataset-card-${dataset.id}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="text-lg font-medium text-foreground mb-3 line-clamp-2">
            {dataset.title}
          </h4>
          <Badge className="bg-primary/10 text-primary border-primary/20 font-accent">
            {dataset.category}
          </Badge>
        </div>
        <div className="ml-4">
          <div className="px-3 py-1 text-accent glow-accent text-sm font-medium rounded-lg">
            {dataset.price} IMT
          </div>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-6 line-clamp-3 leading-relaxed">
        {dataset.description}
      </p>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Star className="w-4 h-4 text-accent fill-current" />
          <span className="text-sm font-medium text-foreground">{parseFloat(dataset.rating || '0').toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">({dataset.reviewCount})</span>
        </div>
        <div className="text-xs text-muted-foreground flex items-center space-x-1">
          <TrendingUp className="w-3 h-3" />
          <span>{dataset.downloads} downloads</span>
        </div>
      </div>
      
      <div className="flex gap-3">
        <button 
          className="flex-1 btn-primary text-sm"
          data-testid={`button-buy-${dataset.id}`}
        >
          <ShoppingCart className="w-4 h-4 mr-2 inline" />
          acquire
        </button>
        <button 
          className="btn-ghost"
          data-testid={`button-view-${dataset.id}`}
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const { address, isConnected } = useAccount();
  const [stats, setStats] = useState({
    datasetCount: 0,
    totalVolume: 0,
    contributorCount: 0,
    avgScore: 0
  });

  // Fetch datasets from database API for stats only
  const { data: datasets = [], isLoading: isLoadingDatasets } = useQuery({
    queryKey: ['/api/datasets'],
    refetchInterval: 30000,
  }) as { data: Dataset[], isLoading: boolean };

  // Update stats when datasets change
  useEffect(() => {
    if (datasets && datasets.length > 0) {
      const activeDatasets = datasets.filter((d: Dataset) => d.isActive);
      const totalDownloads = activeDatasets.reduce((sum: number, d: Dataset) => sum + d.downloads, 0);
      const avgRating = activeDatasets.length > 0 
        ? activeDatasets.reduce((sum: number, d: Dataset) => sum + parseFloat(d.rating || '0'), 0) / activeDatasets.length 
        : 0;

      setStats({
        datasetCount: activeDatasets.length,
        totalVolume: totalDownloads,
        contributorCount: new Set(activeDatasets.map((d: Dataset) => d.ownerId)).size,
        avgScore: avgRating
      });
    }
  }, [datasets]);

  const featuredDatasets = (datasets || []).slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      {/* === CYBERPUNK-ZEN HERO SECTION === */}
      <section className="relative min-h-screen flex items-center justify-center px-4 lg:px-6 overflow-hidden">
        <div className="container mx-auto max-w-6xl text-center relative z-10">
          
          {/* Stunning Samurai Logo Centerpiece */}
          <div className="flex justify-center mb-16">
            <div className="relative">
              <img
                src={zenkaiLogoUrl}
                alt="zenkai - meditating samurai with glowing eyes"
                className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 cyber-pulse hover-cyber transition-all duration-700"
                loading="eager"
              />
              {/* Ambient glow effect */}
              <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-transparent to-transparent blur-2xl scale-150 animate-pulse" />
            </div>
          </div>
          
          {/* Enhanced Typography with Cyberpunk Styling */}
          <div className="space-y-8 mb-16">
            <h1 className="text-cyber-xl gradient-text-cyber font-display">
              zenkai
            </h1>
            <p className="text-zen gradient-text-zen font-accent tracking-wider">
              intelligence economy at scale
            </p>
            <div className="glass-cyber p-8 rounded-2xl max-w-4xl mx-auto">
              <p className="text-lg md:text-xl text-foreground/90 leading-relaxed">
                The decentralized marketplace where data meets AI, fueling the next digital economy.
              </p>
            </div>
          </div>
          
          {/* Premium Cyberpunk CTAs */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
            <Link 
              href="/marketplace"
              className="gradient-primary hover-cyber px-10 py-4 rounded-xl font-medium text-primary-foreground transition-all duration-500 text-lg flex items-center space-x-3 group"
              data-testid="button-explore-marketplace"
            >
              <Store className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Explore Marketplace</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            {address ? (
              <Link 
                href="/upload"
                className="glass-cyber hover-cyber px-10 py-4 rounded-xl font-medium text-foreground transition-all duration-500 text-lg flex items-center space-x-3 group border border-primary/30"
                data-testid="button-upload-dataset"
              >
                <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Upload Dataset</span>
              </Link>
            ) : (
              <button 
                className="glass-panel px-10 py-4 rounded-xl text-muted-foreground cursor-not-allowed text-lg flex items-center space-x-3"
                disabled
              >
                <Wallet className="w-5 h-5" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
          
          {/* Enhanced Live Stats with Glass Morphism */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="glass-panel p-6 rounded-xl hover-cyber transition-all duration-500">
              <div className="flex items-center justify-center space-x-3">
                <Database className="w-6 h-6 text-primary" />
                <div className="text-center">
                  <div className="text-2xl font-bold gradient-text-cyber">{stats.datasetCount}</div>
                  <div className="text-sm text-muted-foreground tracking-wide">datasets</div>
                </div>
              </div>
            </div>
            <div className="glass-panel p-6 rounded-xl hover-cyber transition-all duration-500">
              <div className="flex items-center justify-center space-x-3">
                <User className="w-6 h-6 text-accent" />
                <div className="text-center">
                  <div className="text-2xl font-bold gradient-text-cyber">{stats.contributorCount}</div>
                  <div className="text-sm text-muted-foreground tracking-wide">contributors</div>
                </div>
              </div>
            </div>
            <div className="glass-panel p-6 rounded-xl hover-cyber transition-all duration-500">
              <div className="flex items-center justify-center space-x-3">
                <TrendingUp className="w-6 h-6 text-secondary" />
                <div className="text-center">
                  <div className="text-2xl font-bold gradient-text-cyber">{stats.totalVolume}</div>
                  <div className="text-sm text-muted-foreground tracking-wide">downloads</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Ambient Background Effects */}
        <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-accent/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}} />
      </section>

      {/* === SIMPLE STATS SECTION === */}
      <section className="py-16 px-4 border-t border-border">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-light text-foreground mb-4">
              Platform Overview
            </h3>
            <p className="text-muted-foreground">
              Live data from the zenkai intelligence network
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center" data-testid="stat-datasets">
              <Database className="w-8 h-8 text-orange-500 mx-auto mb-3" />
              <div className="text-2xl font-light text-foreground mb-1">
                {isLoadingDatasets ? "..." : stats.datasetCount}
              </div>
              <div className="text-sm text-muted-foreground">
                datasets
              </div>
            </div>

            <div className="text-center" data-testid="stat-downloads">
              <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-3" />
              <div className="text-2xl font-light text-foreground mb-1">
                {isLoadingDatasets ? "..." : stats.totalVolume.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                downloads
              </div>
            </div>

            <div className="text-center" data-testid="stat-contributors">
              <User className="w-8 h-8 text-orange-500 mx-auto mb-3" />
              <div className="text-2xl font-light text-foreground mb-1">
                {isLoadingDatasets ? "..." : stats.contributorCount}
              </div>
              <div className="text-sm text-muted-foreground">
                contributors
              </div>
            </div>

            <div className="text-center" data-testid="stat-rating">
              <Star className="w-8 h-8 text-orange-500 mx-auto mb-3" />
              <div className="text-2xl font-light text-foreground mb-1">
                {isLoadingDatasets ? "..." : stats.avgScore.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">
                avg rating
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Datasets */}
      {featuredDatasets.length > 0 && (
        <section className="py-16 px-4 border-t border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row items-center justify-between mb-12">
              <div>
                <h3 className="text-2xl font-light text-foreground mb-2">
                  Featured Datasets
                </h3>
                <p className="text-muted-foreground">
                  Curated intelligence for AI innovation
                </p>
              </div>
              <Link 
                href="/marketplace"
                className="px-6 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors text-sm font-medium mt-4 md:mt-0"
                data-testid="button-view-all-datasets"
              >
                View All Datasets
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredDatasets.map((dataset: Dataset) => (
                <FeaturedDatasetCard key={dataset.id} dataset={dataset} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* === HOW IT WORKS === */}
      <section className="py-16 px-4 border-t border-border">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-light text-foreground mb-4">
              How It Works
            </h3>
            <p className="text-muted-foreground">
              Simple steps to join the decentralized intelligence economy
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1: Share */}
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Upload className="w-6 h-6 text-orange-500" />
              </div>
              <h4 className="text-lg font-medium text-foreground mb-3">
                Upload Datasets
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Share your data on IPFS, set pricing, and earn from every download.
              </p>
            </div>

            {/* Step 2: Discover */}
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Store className="w-6 h-6 text-orange-500" />
              </div>
              <h4 className="text-lg font-medium text-foreground mb-3">
                Discover Intelligence
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Browse curated datasets and purchase using IMT tokens.
              </p>
            </div>

            {/* Step 3: Build */}
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Wand2 className="w-6 h-6 text-orange-500" />
              </div>
              <h4 className="text-lg font-medium text-foreground mb-3">
                Build the Future
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Create AI applications powered by decentralized intelligence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* === SIMPLE FOOTER CTA === */}
      <section className="py-16 px-4 text-center border-t border-border">
        <div className="container mx-auto max-w-3xl">
          <h3 className="text-2xl font-light text-foreground mb-4">
            Ready to Join the Intelligence Economy?
          </h3>
          <p className="text-muted-foreground mb-8">
            Start trading datasets on the decentralized marketplace
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/marketplace"
              className="btn-primary text-base"
              data-testid="button-get-started-marketplace"
            >
              Explore Marketplace
            </Link>
            {address ? (
              <Link 
                href="/upload"
                className="px-8 py-3 border border-border text-foreground rounded-lg hover:bg-muted transition-colors text-base font-medium"
                data-testid="button-get-started-upload"
              >
                Upload Your First Dataset
              </Link>
            ) : (
              <button 
                className="px-8 py-3 border border-border text-muted-foreground rounded-lg cursor-not-allowed text-base font-medium"
                disabled
              >
                Connect Wallet to Upload
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}