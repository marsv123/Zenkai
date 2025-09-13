import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Brain, Wallet, Upload, Store, User, Plus, ShoppingCart, Eye, Wand2, Star, TrendingUp, Database, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

// Featured dataset card component
function FeaturedDatasetCard({ dataset }: { dataset: Dataset }) {
  return (
    <div className="cyber-card h-full group" data-testid={`dataset-card-${dataset.id}`}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h4 className="font-display text-xl font-semibold text-card-foreground mb-2 line-clamp-2 group-hover:neon-text-primary transition-colors duration-300">
              {dataset.title}
            </h4>
            <div className="inline-block px-3 py-1 text-xs uppercase tracking-wider bg-muted text-muted-foreground rounded-full">
              {dataset.category}
            </div>
          </div>
          <div className="ml-4">
            <div className="px-3 py-1 bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-bold rounded-full">
              {dataset.price} IMT
            </div>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-6 line-clamp-3 leading-relaxed">
          {dataset.description}
        </p>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4 neon-text-accent fill-current" />
            <span className="text-sm font-medium">{parseFloat(dataset.rating || '0').toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({dataset.reviewCount})</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {dataset.downloads} downloads
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            className="flex-1 bg-gradient-to-r from-primary to-secondary text-primary-foreground px-4 py-2 rounded-lg font-medium text-sm hover:neon-glow-primary transition-all duration-300"
            data-testid={`button-buy-${dataset.id}`}
          >
            <ShoppingCart className="w-4 h-4 mr-2 inline" />
            acquire
          </button>
          <button 
            className="px-4 py-2 border border-accent text-accent rounded-lg hover:neon-glow-accent hover:bg-accent hover:text-accent-foreground transition-all duration-300"
            data-testid={`button-view-${dataset.id}`}
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
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
  });

  // Update stats when datasets change
  useEffect(() => {
    if (datasets.length > 0) {
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

  const featuredDatasets = datasets.slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-primary to-secondary blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-secondary to-accent blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10 container mx-auto max-w-6xl text-center">
          {/* Samurai Logo with Glow */}
          <div className="flex justify-center mb-12">
            <div className="samurai-glow">
              <Brain className="w-32 h-32 neon-text-primary" />
            </div>
          </div>
          
          {/* Main Heading */}
          <h1 className="font-display text-6xl md:text-8xl font-bold mb-6">
            <span className="neon-text-primary">zatorai</span>
          </h1>
          
          {/* Subheading */}
          <h2 className="text-2xl md:text-3xl text-muted-foreground mb-8 font-light">
            — the economy of intelligence.
          </h2>
          
          {/* Tagline */}
          <p className="text-xl md:text-2xl text-accent font-medium mb-12 max-w-3xl mx-auto">
            where data meets ai, a new economy emerges.
          </p>
          
          {/* Description */}
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Decentralized intelligence marketplace built on the 0G Galileo testnet. 
            Trade datasets, power AI innovation, and shape the future of digital intelligence.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/marketplace">
              <button className="btn-primary text-lg px-10 py-4" data-testid="button-explore-marketplace">
                explore marketplace
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </Link>
            
            {address ? (
              <Link href="/upload">
                <button className="btn-secondary text-lg px-10 py-4" data-testid="button-upload-data">
                  <Upload className="w-5 h-5 mr-2" />
                  upload dataset
                </button>
              </Link>
            ) : (
              <button className="btn-secondary text-lg px-10 py-4 opacity-60 cursor-not-allowed" disabled>
                <Wallet className="w-5 h-5 mr-2" />
                connect wallet
              </button>
            )}
          </div>
          
          {/* Built on 0G Badge */}
          <div className="mt-16">
            <div className="inline-flex items-center px-6 py-3 rounded-full border border-border bg-card/50 backdrop-blur-sm">
              <div className="w-2 h-2 bg-primary rounded-full mr-3 animate-pulse"></div>
              <span className="text-sm text-muted-foreground">powered by 0G galileo testnet</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-6 relative">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="font-display text-4xl font-bold mb-4 neon-text-primary">
              intelligence metrics
            </h3>
            <p className="text-lg text-muted-foreground">
              real-time data from the zatorai ecosystem
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="stat-card group" data-testid="stat-datasets">
              <Database className="w-16 h-16 neon-text-primary mx-auto mb-6 group-hover:scale-110 transition-transform duration-300" />
              <div className="text-4xl font-display font-bold neon-text-primary mb-3">
                {isLoadingDatasets ? '...' : stats.datasetCount}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">
                active datasets
              </div>
            </div>

            <div className="stat-card group" data-testid="stat-downloads">
              <TrendingUp className="w-16 h-16 neon-text-accent mx-auto mb-6 group-hover:scale-110 transition-transform duration-300" />
              <div className="text-4xl font-display font-bold neon-text-accent mb-3">
                {isLoadingDatasets ? '...' : stats.totalVolume.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">
                total downloads
              </div>
            </div>

            <div className="stat-card group" data-testid="stat-contributors">
              <User className="w-16 h-16 text-secondary mx-auto mb-6 group-hover:scale-110 transition-transform duration-300" />
              <div className="text-4xl font-display font-bold text-secondary mb-3">
                {isLoadingDatasets ? '...' : stats.contributorCount}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">
                contributors
              </div>
            </div>

            <div className="stat-card group" data-testid="stat-rating">
              <Star className="w-16 h-16 neon-text-accent mx-auto mb-6 group-hover:scale-110 transition-transform duration-300" />
              <div className="text-4xl font-display font-bold neon-text-accent mb-3">
                {isLoadingDatasets ? '...' : stats.avgScore.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">
                avg rating
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Datasets */}
      {featuredDatasets.length > 0 && (
        <section className="py-24 px-6 bg-gradient-to-br from-muted/20 to-card/20">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between mb-16">
              <div>
                <h3 className="font-display text-4xl font-bold neon-text-primary mb-4">
                  featured intelligence
                </h3>
                <p className="text-lg text-muted-foreground">
                  curated datasets driving innovation
                </p>
              </div>
              <Link href="/marketplace">
                <button className="btn-secondary mt-6 md:mt-0" data-testid="button-view-all-datasets">
                  explore all datasets
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredDatasets.map((dataset: Dataset) => (
                <FeaturedDatasetCard key={dataset.id} dataset={dataset} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it Works */}
      <section className="py-24 px-6 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h3 className="font-display text-4xl font-bold neon-text-primary mb-6">
              the intelligence protocol
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              three simple steps to join the decentralized economy of intelligence
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="cyber-card text-center group">
              <div className="p-8">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl"></div>
                  <Upload className="w-20 h-20 neon-text-primary mx-auto relative z-10 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="text-2xl font-display font-bold neon-text-primary mb-4">
                  01. share data
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Upload datasets to IPFS and register on the 0G blockchain. 
                  Set your price and earn from every download.
                </p>
              </div>
            </div>

            <div className="cyber-card text-center group">
              <div className="p-8">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-accent/20 rounded-full blur-2xl"></div>
                  <Store className="w-20 h-20 neon-text-accent mx-auto relative z-10 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="text-2xl font-display font-bold neon-text-accent mb-4">
                  02. discover intelligence
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Browse curated datasets, read community reviews, 
                  and purchase using IMT tokens on the decentralized marketplace.
                </p>
              </div>
            </div>

            <div className="cyber-card text-center group">
              <div className="p-8">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-secondary/20 rounded-full blur-2xl"></div>
                  <Wand2 className="w-20 h-20 text-secondary mx-auto relative z-10 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="text-2xl font-display font-bold text-secondary mb-4">
                  03. build the future
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Train AI models, create intelligent applications, 
                  and contribute to the next generation of digital intelligence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 text-center relative">
        {/* Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-card/50 to-transparent"></div>
        
        <div className="container mx-auto max-w-4xl relative z-10">
          <h3 className="font-display text-5xl font-bold mb-6">
            <span className="neon-text-primary">ready to join</span>
            <br />
            <span className="text-muted-foreground">the revolution?</span>
          </h3>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Step into the future of decentralized intelligence. 
            Where data becomes value, and AI meets humanity.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/marketplace">
              <button className="btn-primary text-lg px-10 py-4">
                <Store className="w-5 h-5 mr-2" />
                explore intelligence
              </button>
            </Link>
            
            {address && (
              <Link href="/dashboard">
                <button className="btn-secondary text-lg px-10 py-4">
                  <User className="w-5 h-5 mr-2" />
                  enter dashboard
                </button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="container mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            zatorai — the economy of intelligence, built on 0G
          </p>
        </div>
      </footer>
    </div>
  );
}