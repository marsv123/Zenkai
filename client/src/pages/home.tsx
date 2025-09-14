import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Wallet, Upload, Store, User, ShoppingCart, Eye, Wand2, Star, TrendingUp, Database, ArrowRight, Zap, Brain, Network, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import zenkaiLogoUrl from '@assets/Logo1_1757790479722.png';

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

// Premium Cyberpunk Dataset Card Component
function FeaturedDatasetCard({ dataset }: { dataset: Dataset }) {
  return (
    <div className="glass-cyber hover-cyber p-8 h-full rounded-2xl border border-primary/20 group transition-all duration-700" data-testid={`dataset-card-${dataset.id}`}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h4 className="text-xl font-medium gradient-text-cyber mb-4 line-clamp-2 group-hover:scale-105 transition-transform duration-500">
            {dataset.title}
          </h4>
          <Badge className="glass-panel border-primary/30 gradient-text-zen px-3 py-1 rounded-lg font-accent text-sm">
            {dataset.category}
          </Badge>
        </div>
        <div className="ml-6">
          <div className="gradient-primary px-4 py-2 text-primary-foreground text-lg font-bold rounded-xl">
            {dataset.price} ZAI
          </div>
        </div>
      </div>
      
      <p className="text-base text-foreground/80 mb-8 line-clamp-3 leading-relaxed">
        {dataset.description}
      </p>
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3 glass-panel px-4 py-2 rounded-lg">
          <Star className="w-5 h-5 text-accent fill-current group-hover:scale-110 transition-transform" />
          <span className="text-lg font-semibold gradient-text-cyber">{parseFloat(dataset.rating || '0').toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">({dataset.reviewCount})</span>
        </div>
        <div className="text-sm text-accent flex items-center space-x-2 glass-panel px-3 py-2 rounded-lg">
          <TrendingUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="font-medium">{dataset.downloads} downloads</span>
        </div>
      </div>
      
      <div className="flex gap-4">
        <button 
          className="flex-1 gradient-primary hover-cyber px-6 py-3 rounded-xl font-medium text-primary-foreground transition-all duration-500 flex items-center justify-center space-x-2 group"
          data-testid={`button-buy-${dataset.id}`}
        >
          <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-zen tracking-wide">acquire</span>
        </button>
        <button 
          className="glass-panel hover-cyber px-4 py-3 rounded-xl transition-all duration-500 group"
          data-testid={`button-view-${dataset.id}`}
        >
          <Eye className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const { address, isConnected } = useAccount();
  const [visibleChars, setVisibleChars] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [visibleChars2, setVisibleChars2] = useState(0);
  const [showCursor2, setShowCursor2] = useState(false);
  const [blinkingCursor, setBlinkingCursor] = useState(false);
  const [stats, setStats] = useState({
    datasetCount: 0,
    totalVolume: 0,
    contributorCount: 0,
    avgScore: 0
  });

  const fullText = 'intelligence economy at scale';
  const secondText = 'Kaizen is a decentralized intelligence economy designed to scale data and AI monetization become liquid, revenue-generating assets. Enabled and built on 0G Participants can securely upload, rent, and monetize datasets, while building, training, and tokenizing AI models in a single seamless dApp. Every contribution carries ownership, reputation, and exit liquidity. As data compounds, models improve, driving usage.';

  // Letter-by-letter typewriter effect
  useEffect(() => {
    const startDelay = setTimeout(() => {
      let charIndex = 0;
      const typeInterval = setInterval(() => {
        if (charIndex <= fullText.length) {
          setVisibleChars(charIndex);
          charIndex++;
        } else {
          clearInterval(typeInterval);
          // Hide cursor after first text is complete
          setShowCursor(false);
          // Start blinking cursor
          setBlinkingCursor(true);
          
          // Start second text after 2 seconds
          setTimeout(() => {
            setShowCursor2(true);
            let charIndex2 = 0;
            const typeInterval2 = setInterval(() => {
              if (charIndex2 <= secondText.length) {
                setVisibleChars2(charIndex2);
                charIndex2++;
              } else {
                clearInterval(typeInterval2);
                // Hide second cursor immediately when complete
                setShowCursor2(false);
              }
            }, 40); // Faster for the longer text
          }, 2000); // 2 second pause between texts
        }
      }, 80); // 80ms between each character (machine-like speed)
      
      return () => clearInterval(typeInterval);
    }, 800); // Initial delay before starting
    
    return () => {
      clearTimeout(startDelay);
    };
  }, []);

  // Matrix-style blinking cursor after typewriter finishes
  useEffect(() => {
    if (blinkingCursor) {
      const cursorInterval = setInterval(() => {
        setShowCursor(prev => !prev);
      }, 530); // 530ms for Matrix-like blink speed

      return () => clearInterval(cursorInterval);
    }
  }, [blinkingCursor]);


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
                alt="Kaizen - meditating samurai with glowing eyes"
                className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 hover-cyber transition-all duration-700"
                loading="eager"
              />
              {/* Ambient glow effect */}
              <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-transparent to-transparent blur-2xl scale-150 animate-pulse" />
            </div>
          </div>
          
          {/* Enhanced Typography with Cyberpunk Styling */}
          <div className="space-y-6 mb-12">
            <p className="text-lg md:text-xl lg:text-2xl font-accent tracking-wider font-mono">
              <span className="gradient-text-zen animate-text-glow-reveal">
                {fullText.slice(0, visibleChars)}
              </span>
              {blinkingCursor && (
                <span className={`inline-block w-0.5 h-6 md:h-7 lg:h-8 bg-primary ml-1 transition-opacity duration-100 ${showCursor ? 'opacity-100' : 'opacity-0'}`}>
                  {/* Matrix-style blinking cursor */}
                </span>
              )}
            </p>
            
          </div>
          
          
          
        </div>
        
        {/* Ambient Background Effects */}
        <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-accent/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}} />
      </section>

      

      {/* Featured Datasets */}
      {featuredDatasets.length > 0 && (
        <section className="py-16 px-4 border-t border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row items-center justify-between mb-16">
              <div>
                <h3 className="text-cyber-lg gradient-text-cyber mb-3">
                  Featured Datasets
                </h3>
                <p className="text-zen text-accent/80">
                  Curated intelligence for AI innovation
                </p>
              </div>
              <Link 
                href="/marketplace"
                className="glass-cyber hover-cyber px-8 py-3 rounded-xl font-medium text-foreground transition-all duration-500 text-base mt-6 md:mt-0 flex items-center space-x-2 group"
                data-testid="button-view-all-datasets"
              >
                <span>View All Datasets</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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

      {/* === WHAT IS KAIZEN === */}
      <section className="py-20 px-4 border-t border-primary/20 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <h3 className="text-cyber-lg gradient-text-cyber mb-6">
              What is Kaizen?
            </h3>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="glass-cyber hover-cyber p-12 rounded-3xl transition-all duration-500 group">
              <div className="flex items-center justify-center mb-8">
                <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Brain className="w-10 h-10 text-primary-foreground" />
                </div>
              </div>
              
              <p className="text-xl text-accent/90 leading-relaxed text-center max-w-3xl mx-auto mb-10">
                Powered by 0G's AI-native blockchain, Kaizen fuses data and AI into a decentralized, scalable marketplace of intelligence.
                Participants can rent datasets or build, train, and tokenize AI models within one seamless dApp. Every contribution carries built-in ownership, reputation, and monetization. As data compounds and models evolve, value creation accelerates, fueling continuous growth across the ecosystem.
              </p>
              
              <div className="text-center">
                <Link 
                  href="/marketplace"
                  className="gradient-primary hover-cyber px-10 py-4 rounded-xl font-medium text-primary-foreground transition-all duration-500 text-lg inline-flex items-center justify-center space-x-3 group"
                  data-testid="button-get-started-marketplace"
                >
                  <Store className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Explore Marketplace</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
        {/* Ambient background effects */}
        <div className="absolute top-1/4 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-56 h-56 bg-primary/5 rounded-full blur-3xl" />
      </section>

      {/* === CYBERPUNK HOW IT WORKS === */}
      <section className="py-20 px-4 border-t border-primary/20 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <h3 className="text-cyber-lg gradient-text-cyber mb-6">
              How It Works
            </h3>
            <p className="text-zen text-accent/80 max-w-2xl mx-auto">
              Simple steps to join the decentralized intelligence economy
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {[
              {
                title: "Upload your data",
                description: "Publish your dataset to IPFS, secure ownership on-chain, and make it available to the intelligence economy.",
                icon: Upload,
                route: "/upload"
              },
              {
                title: "Monetize your data",
                description: "Set your price in ZAI, track demand, and earn every time your dataset is used.",
                icon: TrendingUp,
                route: "/dashboard?tab=monetize"
              },
              {
                title: "Compose your AI",
                description: "Assemble your model from modular building blocks — define its logic before training.",
                icon: Brain,
                route: "/compose"
              },
              {
                title: "Train your AI",
                description: "Feed your model with datasets and run a demo to test performance.",
                icon: Zap,
                route: "/train"
              },
              {
                title: "Tokenize your AI",
                description: "Turn your AI into an investable asset. Register it, set a query price in ZAI, and open it to the marketplace.",
                icon: Shield,
                route: "/tokenize"
              }
            ].map((step, index) => (
              <Link
                key={index}
                href={step.route}
                className="text-center glass-cyber hover-cyber p-8 rounded-2xl transition-all duration-500 group cursor-pointer"
                data-testid={`card-${step.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <step.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h4 className="text-xl font-semibold gradient-text-cyber mb-4">
                  {step.title}
                </h4>
                <p className="text-base text-foreground/80 leading-relaxed">
                  {step.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
        {/* Ambient background effects */}
        <div className="absolute top-1/4 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-56 h-56 bg-primary/5 rounded-full blur-3xl" />
      </section>

    </div>
  );
}