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
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {dataset.title}
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              {dataset.category}
            </CardDescription>
          </div>
          <Badge variant="secondary">{dataset.price} IMT</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {dataset.description}
        </p>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm">{parseFloat(dataset.rating || '0').toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({dataset.reviewCount})</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {dataset.downloads} downloads
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="flex-1" data-testid={`button-buy-${dataset.id}`}>
            <ShoppingCart className="w-4 h-4 mr-1" />
            Buy
          </Button>
          <Button size="sm" variant="outline" data-testid={`button-view-${dataset.id}`}>
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
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
      <section className="py-20 px-4 text-center bg-gradient-to-br from-background via-muted/50 to-background">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-center mb-6">
            <Brain className="w-16 h-16 text-primary mr-4" />
            <div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Zatori
              </h1>
              <p className="text-xl text-muted-foreground">Intelligence Marketplace</p>
            </div>
          </div>
          
          <h2 className="text-4xl font-bold mb-6">
            Decentralized Data Marketplace on 0G Network
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Share, discover, and monetize datasets for AI and machine learning. 
            Built on the 0G Galileo testnet with full Web3 integration.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/marketplace">
              <Button size="lg" className="text-lg px-8 py-3" data-testid="button-explore-marketplace">
                <Store className="w-5 h-5 mr-2" />
                Explore Marketplace
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            
            {address ? (
              <Link href="/upload">
                <Button size="lg" variant="outline" className="text-lg px-8 py-3" data-testid="button-upload-data">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Dataset
                </Button>
              </Link>
            ) : (
              <Button size="lg" variant="outline" className="text-lg px-8 py-3" disabled>
                <Wallet className="w-5 h-5 mr-2" />
                Connect Wallet to Upload
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Platform Statistics</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardContent className="p-6">
                <Database className="w-12 h-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-primary mb-2">
                  {isLoadingDatasets ? '...' : stats.datasetCount}
                </div>
                <div className="text-sm text-muted-foreground">Active Datasets</div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <TrendingUp className="w-12 h-12 text-secondary mx-auto mb-4" />
                <div className="text-3xl font-bold text-secondary mb-2">
                  {isLoadingDatasets ? '...' : stats.totalVolume.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Downloads</div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <User className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <div className="text-3xl font-bold text-green-500 mb-2">
                  {isLoadingDatasets ? '...' : stats.contributorCount}
                </div>
                <div className="text-sm text-muted-foreground">Contributors</div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <div className="text-3xl font-bold text-yellow-500 mb-2">
                  {isLoadingDatasets ? '...' : stats.avgScore.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Avg Rating</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Datasets */}
      {featuredDatasets.length > 0 && (
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-12">
              <h3 className="text-3xl font-bold">Featured Datasets</h3>
              <Link href="/marketplace">
                <Button variant="outline" data-testid="button-view-all-datasets">
                  View All Datasets
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
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

      {/* How it Works */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h3 className="text-3xl font-bold text-center mb-12">How Zatori Works</h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <Upload className="w-16 h-16 text-primary mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-3">1. Upload Data</h4>
                <p className="text-muted-foreground">
                  Upload your datasets to IPFS and register them on the 0G blockchain with custom pricing.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Store className="w-16 h-16 text-secondary mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-3">2. Discover & Buy</h4>
                <p className="text-muted-foreground">
                  Browse the marketplace, read reviews, and purchase datasets using IMT tokens.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Wand2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-3">3. Build Intelligence</h4>
                <p className="text-muted-foreground">
                  Use purchased datasets to train AI models and create intelligent applications.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 text-center">
        <div className="container mx-auto max-w-2xl">
          <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-xl text-muted-foreground mb-8">
            Join the decentralized intelligence revolution on the 0G network.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/marketplace">
              <Button size="lg" className="text-lg px-8 py-3">
                <Store className="w-5 h-5 mr-2" />
                Explore Datasets
              </Button>
            </Link>
            
            {address && (
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                  <User className="w-5 h-5 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}