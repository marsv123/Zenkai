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
    <div className="card-interactive h-full" data-testid={`dataset-card-${dataset.id}`}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h4 className="font-display text-xl font-semibold text-foreground mb-3 line-clamp-2 group-hover:text-glow-primary transition-colors duration-300">
              {dataset.title}
            </h4>
            <Badge className="bg-primary/10 text-primary border-primary/20 font-accent">
              {dataset.category}
            </Badge>
          </div>
          <div className="ml-4">
            <div className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-bold rounded-xl shadow-lg">
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
            className="btn-primary flex-1 text-sm"
            data-testid={`button-buy-${dataset.id}`}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            acquire
          </button>
          <button 
            className="btn-ghost px-4 py-2 border border-accent/30 text-accent hover:border-accent"
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
      {/* === MINIMALISTIC HERO SECTION === */}
      <section className="relative min-h-screen flex items-center justify-center px-4 lg:px-6">
        <div className="container mx-auto max-w-4xl text-center">
          
          {/* Centered Logo */}
          <div className="flex justify-center mb-12">
            <img
              src={zenkaiLogoUrl}
              alt="zenkai - meditating samurai with glowing eyes"
              className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48"
              loading="eager"
            />
          </div>
          
          {/* Clean Typography Hierarchy */}
          <div className="space-y-6 mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-foreground">
              zenkai
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-light">
              intelligence economy at scale
            </p>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              The decentralized marketplace where data meets AI, fueling the next digital economy.
            </p>
          </div>
          
          {/* Clean CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link 
              href="/marketplace"
              className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-base font-medium"
              data-testid="button-explore-marketplace"
            >
              Explore Marketplace
            </Link>
            {address ? (
              <Link 
                href="/upload"
                className="px-8 py-3 border border-border text-foreground rounded-lg hover:bg-muted transition-colors text-base font-medium"
                data-testid="button-upload-dataset"
              >
                Upload Dataset
              </Link>
            ) : (
              <button 
                className="px-8 py-3 border border-border text-muted-foreground rounded-lg cursor-not-allowed text-base font-medium"
                disabled
              >
                Connect Wallet
              </button>
            )}
          </div>
          
          {/* Subtle Stats */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <span className="w-1 h-1 bg-orange-500 rounded-full"></span>
              <span>{stats.datasetCount} datasets</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-1 h-1 bg-orange-500 rounded-full"></span>
              <span>{stats.contributorCount} contributors</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-1 h-1 bg-orange-500 rounded-full"></span>
              <span>{stats.totalVolume} downloads</span>
            </div>
          </div>
        </div>
      </section>

      {/* === INTELLIGENCE METRICS === */}
      <section className="py-24 lg:py-32 px-4 lg:px-6 relative">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-panel mb-6">
              <Network className="w-4 h-4 text-primary" />
              <span className="text-sm font-accent text-muted-foreground tracking-wider">LIVE METRICS</span>
            </div>
            <h3 className="font-display text-4xl lg:text-5xl font-bold mb-6 text-gradient-primary">
              intelligence ecosystem
            </h3>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Real-time data flowing through the zenkai intelligence network
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
            <div className="stat-card group" data-testid="stat-datasets">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl"></div>
                <Database className="w-16 h-16 text-primary mx-auto relative z-10 group-hover:scale-125 transition-all duration-300" />
              </div>
              <div className="stat-value text-gradient-primary">
                {isLoadingDatasets ? (
                  <div className="loading-spinner mx-auto"></div>
                ) : (
                  stats.datasetCount
                )}
              </div>
              <div className="stat-label">
                active datasets
              </div>
            </div>

            <div className="stat-card group" data-testid="stat-downloads">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-accent/10 rounded-full blur-xl"></div>
                <TrendingUp className="w-16 h-16 text-accent mx-auto relative z-10 group-hover:scale-125 transition-all duration-300" />
              </div>
              <div className="stat-value text-accent">
                {isLoadingDatasets ? (
                  <div className="loading-spinner mx-auto"></div>
                ) : (
                  stats.totalVolume.toLocaleString()
                )}
              </div>
              <div className="stat-label">
                total downloads
              </div>
            </div>

            <div className="stat-card group" data-testid="stat-contributors">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-secondary/10 rounded-full blur-xl"></div>
                <User className="w-16 h-16 text-secondary mx-auto relative z-10 group-hover:scale-125 transition-all duration-300" />
              </div>
              <div className="stat-value text-secondary">
                {isLoadingDatasets ? (
                  <div className="loading-spinner mx-auto"></div>
                ) : (
                  stats.contributorCount
                )}
              </div>
              <div className="stat-label">
                contributors
              </div>
            </div>

            <div className="stat-card group" data-testid="stat-rating">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-accent/10 rounded-full blur-xl"></div>
                <Star className="w-16 h-16 text-accent mx-auto relative z-10 group-hover:scale-125 transition-all duration-300" />
              </div>
              <div className="stat-value text-accent">
                {isLoadingDatasets ? (
                  <div className="loading-spinner mx-auto"></div>
                ) : (
                  stats.avgScore.toFixed(1)
                )}
              </div>
              <div className="stat-label">
                avg quality score
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

      {/* === INTELLIGENCE PROTOCOL === */}
      <section className="py-24 lg:py-32 px-4 lg:px-6 relative">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/5 to-transparent"></div>
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-24">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-panel mb-6">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-sm font-accent text-muted-foreground tracking-wider">PROTOCOL</span>
            </div>
            <h3 className="font-display text-4xl lg:text-5xl font-bold mb-6 text-gradient-primary">
              the intelligence protocol
            </h3>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Three simple steps to join the decentralized economy of intelligence and 
              shape the future of AI-powered applications
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Step 1: Share */}
            <div className="card-interactive text-center group relative">
              <div className="p-8 lg:p-10">
                {/* Step Number */}
                <div className="absolute -top-4 left-8 px-4 py-2 bg-primary rounded-full">
                  <span className="text-sm font-bold text-primary-foreground">01</span>
                </div>
                
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover:blur-xl transition-all duration-300"></div>
                  <Upload className="w-20 h-20 text-primary mx-auto relative z-10 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500" />
                </div>
                
                <h4 className="text-2xl lg:text-3xl font-display font-bold text-primary mb-6">
                  share intelligence
                </h4>
                
                <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                  Upload your datasets to IPFS, register on the 0G blockchain, 
                  set competitive pricing, and earn from every download.
                </p>
                
                <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <Zap className="w-4 h-4" />
                  <span>Instant monetization</span>
                </div>
              </div>
            </div>

            {/* Step 2: Discover */}
            <div className="card-interactive text-center group relative">
              <div className="p-8 lg:p-10">
                {/* Step Number */}
                <div className="absolute -top-4 left-8 px-4 py-2 bg-accent rounded-full">
                  <span className="text-sm font-bold text-accent-foreground">02</span>
                </div>
                
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-accent/20 rounded-full blur-2xl group-hover:blur-xl transition-all duration-300"></div>
                  <Store className="w-20 h-20 text-accent mx-auto relative z-10 group-hover:scale-125 group-hover:-rotate-12 transition-all duration-500" />
                </div>
                
                <h4 className="text-2xl lg:text-3xl font-display font-bold text-accent mb-6">
                  discover datasets
                </h4>
                
                <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                  Browse curated intelligence, read community reviews, 
                  and purchase premium datasets using IMT tokens.
                </p>
                
                <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium">
                  <Star className="w-4 h-4" />
                  <span>Quality assured</span>
                </div>
              </div>
            </div>

            {/* Step 3: Build */}
            <div className="card-interactive text-center group relative">
              <div className="p-8 lg:p-10">
                {/* Step Number */}
                <div className="absolute -top-4 left-8 px-4 py-2 bg-secondary rounded-full">
                  <span className="text-sm font-bold text-secondary-foreground">03</span>
                </div>
                
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-secondary/20 rounded-full blur-2xl group-hover:blur-xl transition-all duration-300"></div>
                  <Wand2 className="w-20 h-20 text-secondary mx-auto relative z-10 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500" />
                </div>
                
                <h4 className="text-2xl lg:text-3xl font-display font-bold text-secondary mb-6">
                  build the future
                </h4>
                
                <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                  Train AI models, create intelligent applications, 
                  and contribute to the next generation of digital intelligence.
                </p>
                
                <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium">
                  <Brain className="w-4 h-4" />
                  <span>AI-powered innovation</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Protocol Benefits */}
          <div className="mt-20 text-center">
            <div className="inline-flex flex-wrap items-center justify-center gap-8 px-8 py-6 rounded-2xl glass-panel">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4 text-primary" />
                <span>Decentralized & secure</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Network className="w-4 h-4 text-accent" />
                <span>IPFS + blockchain</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Zap className="w-4 h-4 text-secondary" />
                <span>Instant payments</span>
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