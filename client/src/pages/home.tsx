import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { 
  Wallet, Upload, Store, User, ShoppingCart, Eye, Wand2, Star, TrendingUp, Database, ArrowRight, Zap, Brain, Network, Shield, Mail, Github, Twitter, MessageCircle, DollarSign,
  Server,
  Code,
  Database as DatabaseIcon,
  Lock,
  Globe,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import zenkaiLogoUrl from '@assets/Logo11_1757876955560.png';
import zcashIconUrl from '@assets/zcash-icon-black_1757883096308.webp';
import content from '@/lib/config/content.json';
import { ZenkaiBrand } from '@/components/ZenkaiBrand';

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
    <article className="glass-cyber hover-cyber p-8 h-full rounded-2xl border border-primary/20 group transition-all duration-700" data-testid={`dataset-card-${dataset.id}`} role="article" aria-labelledby={`dataset-title-${dataset.id}`} aria-describedby={`dataset-desc-${dataset.id}`}>
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
    </article>
  );
}

export default function Home() {
  const { address, isConnected } = useAccount();
  const [visibleChars, setVisibleChars] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [blinkingCursor, setBlinkingCursor] = useState(false);
  const [stats, setStats] = useState({
    totalDatasets: 0,
    totalINFTs: 0,
    totalRevenue: 0,
    activeUsers: 0
  });
  const [animatedStats, setAnimatedStats] = useState({
    totalDatasets: 0,
    totalINFTs: 0,
    totalRevenue: 0,
    activeUsers: 0
  });

  const fullText = 'Powering the intelligence economy.';
  
  // 5-step journey cards
  const journeySteps = [
    {
      step: 1,
      title: "Upload",
      description: "Secure datasets on-chain with 0G storage and ZK privacy",
      icon: Upload,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10"
    },
    {
      step: 2, 
      title: "Train",
      description: "Build and train AI models using 0G compute infrastructure",
      icon: Brain,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10"
    },
    {
      step: 3,
      title: "Mint",
      description: "Tokenize AI assets as Intelligence NFTs with royalties",
      icon: Wand2,
      color: "text-orange-400", 
      bgColor: "bg-orange-500/10"
    },
    {
      step: 4,
      title: "Trade",
      description: "List and trade tokenized intelligence in the marketplace",
      icon: Store,
      color: "text-green-400",
      bgColor: "bg-green-500/10"
    },
    {
      step: 5,
      title: "Earn",
      description: "Generate revenue from usage, royalties, and staking",
      icon: TrendingUp,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10"
    }
  ];

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
          // Remove blinking cursor - text is complete
          setBlinkingCursor(false);
          
 // 1 second pause between texts
        }
      }, 40); // 40ms between each character (faster speed)
      
      return () => clearInterval(typeInterval);
    }, 400); // Initial delay before starting
    
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

  // Update stats when datasets change and animate counters
  useEffect(() => {
    if (datasets && datasets.length > 0) {
      const activeDatasets = datasets.filter((d: Dataset) => d.isActive);
      const totalDownloads = activeDatasets.reduce((sum: number, d: Dataset) => sum + d.downloads, 0);
      
      const targetStats = {
        totalDatasets: activeDatasets.length,
        totalINFTs: Math.floor(activeDatasets.length * 0.3), // Mock: 30% of datasets have INFTs
        totalRevenue: Math.round(totalDownloads * 0.15 * 10) / 10, // Mock calculation
        activeUsers: new Set(activeDatasets.map((d: Dataset) => d.ownerId)).size
      };
      
      setStats(targetStats);
      
      // Animate counters
      const animationDuration = 2000;
      const steps = 60;
      const stepTime = animationDuration / steps;
      
      let currentStep = 0;
      const animationInterval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const easeOutProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        
        setAnimatedStats({
          totalDatasets: Math.round(targetStats.totalDatasets * easeOutProgress),
          totalINFTs: Math.round(targetStats.totalINFTs * easeOutProgress),
          totalRevenue: Math.round(targetStats.totalRevenue * easeOutProgress * 10) / 10,
          activeUsers: Math.round(targetStats.activeUsers * easeOutProgress)
        });
        
        if (currentStep >= steps) {
          clearInterval(animationInterval);
          setAnimatedStats(targetStats);
        }
      }, stepTime);
      
      return () => clearInterval(animationInterval);
    }
  }, [datasets]);

  const featuredDatasets = (datasets || []).slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      {/* === CYBERPUNK-ZEN HERO SECTION === */}
      <section className="relative py-20 px-4 lg:px-6 overflow-hidden">
        <div className="container mx-auto max-w-6xl text-center relative z-10">
          
          {/* Stunning Samurai Logo Centerpiece */}
          <div className="flex justify-center mb-8">
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
          <div className="space-y-6 mb-6">
            <h3 className="text-cyber-lg mb-6 relative min-h-[3rem] md:min-h-[3.5rem] lg:min-h-[4rem]">
              {/* Visible animated text */}
              <span className="gradient-text-cyber animate-text-glow-reveal">
                {fullText.slice(0, visibleChars)}
              </span>
              {blinkingCursor && (
                <span className={`inline-block w-0.5 h-6 md:h-7 lg:h-8 bg-primary ml-1 transition-opacity duration-100 ${showCursor ? 'opacity-100' : 'opacity-0'}`}>
                  {/* Matrix-style blinking cursor */}
                </span>
              )}
            </h3>
            
            

            
            
          </div>
          
          {/* Platform Description - moved from About section */}
          <div className="max-w-4xl mx-auto mt-8">
            <div className="glass-cyber hover-cyber p-12 rounded-3xl transition-all duration-500 group">
              
              <p className="text-xl text-accent/90 leading-relaxed text-center max-w-3xl mx-auto mb-10">
                Powered by 0G, <ZenkaiBrand colorContext="inherit" /> fuses data and AI into a decentralized, scalable marketplace of intelligence. Ready to join the intelligence economy?
              </p>
            </div>
          </div>
          
          
          
        </div>
        
        {/* Ambient Background Effects */}
        <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-accent/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}} />
      </section>

      



      {/* === 5-STEP JOURNEY CARDS === */}
      <section className="py-20 px-4 border-t border-primary/20 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <h3 className="text-cyber-lg gradient-text-cyber mb-6">
              5-Step Intelligence Journey
            </h3>
            <p className="text-zen text-accent/80 max-w-2xl mx-auto">
              Upload → Train → Mint → Trade → Earn: Your path to AI monetization
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 justify-items-center">
            {journeySteps.map((step, index) => (
              <div
                key={step.step}
                className="text-center glass-cyber hover-cyber p-8 rounded-2xl transition-all duration-500 group cursor-pointer relative"
                data-testid={`journey-step-${step.step}`}
              >
                {/* Step Number Badge */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center z-10">
                  {step.step}
                </div>
                
                <div className={`w-16 h-16 ${step.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                  <step.icon className={`w-8 h-8 ${step.color}`} />
                </div>
                
                <h4 className="text-xl font-semibold gradient-text-cyber mb-4">
                  {step.title}
                </h4>
                <p className="text-base text-foreground/80 leading-relaxed">
                  {step.description}
                </p>
                
                {/* Arrow to next step (except for last step) */}
                {index < journeySteps.length - 1 && (
                  <div className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-primary/60" />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* CTA Button */}
          <div className="text-center mt-12">
            <Link 
              href="/create"
              className="gradient-primary hover-cyber px-12 py-4 rounded-xl font-medium text-primary-foreground transition-all duration-500 text-lg inline-flex items-center justify-center group"
              data-testid="button-start-journey"
            >
              <span>Start Your Journey</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
        
        {/* Ambient background effects */}
        <div className="absolute top-1/4 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-56 h-56 bg-primary/5 rounded-full blur-3xl" />
      </section>


      {/* Animated Stats Section */}
      <section className="py-20 px-4 lg:px-6 border-t border-primary/20 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <h3 className="text-cyber-lg gradient-text-cyber mb-6">
              Intelligence Marketplace
            </h3>
            <p className="text-zen text-accent/80 max-w-2xl mx-auto">
              Real-time insights from the decentralized intelligence marketplace
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                key: 'totalDatasets',
                title: 'Datasets',
                description: 'Registered on-chain',
                icon: Database,
                value: animatedStats.totalDatasets,
                format: (val: number) => val.toLocaleString()
              },
              {
                key: 'totalINFTs',
                title: 'Intelligence NFTs',
                description: 'Tokenized AI assets',
                icon: Wand2,
                value: animatedStats.totalINFTs,
                format: (val: number) => val.toLocaleString()
              },
              {
                key: 'totalRevenue',
                title: 'Revenue (ZAI)',
                description: 'Platform volume',
                icon: TrendingUp,
                value: animatedStats.totalRevenue,
                format: (val: number) => `${val.toFixed(1)}`
              },
              {
                key: 'activeUsers',
                title: 'Active Users',
                description: 'Community members',
                icon: Network,
                value: animatedStats.activeUsers,
                format: (val: number) => val.toLocaleString()
              }
            ].map((stat) => (
              <article
                key={stat.key}
                className="glass-cyber hover-cyber p-8 rounded-2xl text-center group transition-all duration-500"
                data-testid={`stat-${stat.key}`}
              >
                <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <stat.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="text-4xl font-bold gradient-text-cyber mb-3">
                  {stat.format(stat.value)}
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  {stat.title}
                </h4>
                <p className="text-base text-muted-foreground">
                  {stat.description}
                </p>
              </article>
            ))}
          </div>
          
          {/* CTA Button */}
          <div className="text-center mt-12">
            <Link 
              href="/marketplace"
              className="gradient-primary hover-cyber px-10 py-4 rounded-xl font-medium text-primary-foreground transition-all duration-500 text-lg inline-flex items-center justify-center group"
              data-testid="button-get-started-marketplace"
            >
              <span>Explore Marketplace</span>
            </Link>
          </div>
        </div>
        {/* Ambient background effects */}
        <div className="absolute top-1/4 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-56 h-56 bg-primary/5 rounded-full blur-3xl" />
      </section>

      {/* Technical Architecture Section */}
      <section className="py-20 px-4 lg:px-6 border-t border-primary/20 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <h3 className="text-cyber-lg gradient-text-cyber mb-6">
              Technical Architecture
            </h3>
            <p className="text-zen text-accent/80 max-w-2xl mx-auto">
              Cutting-edge technology stack powering the decentralized intelligence economy
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Frontend Layer',
                description: 'React with Vite, TypeScript, and RainbowKit for seamless Web3 integration',
                icon: Code,
                features: [
                  'React Query for state management',
                  'Tailwind CSS with shadcn/ui',
                  'Wagmi for Ethereum interactions'
                ]
              },
              {
                title: 'Backend Services',
                description: 'Express.js server with RESTful API design and TypeScript',
                icon: Server,
                features: [
                  'Comprehensive storage interface',
                  'Request logging middleware',
                  'Vite integration with HMR'
                ]
              },
              {
                title: 'Smart Contracts',
                description: 'Hardhat development with three core contracts on 0G Galileo testnet',
                icon: Lock,
                features: [
                  'ZAI (ERC20) & ContributorNFT (ERC721)',
                  'DatasetRegistry with pricing control',
                  'Contract ABI export system'
                ]
              },
              {
                title: 'Database Design',
                description: 'PostgreSQL with Drizzle ORM for type-safe operations',
                icon: DatabaseIcon,
                features: [
                  'User management with wallet linking',
                  'Dataset metadata storage',
                  'Transaction tracking & analytics'
                ]
              },
              {
                title: 'Authentication',
                description: 'Web3 wallet-based authentication using RainbowKit',
                icon: Shield,
                features: [
                  'Wallet address identification',
                  'No traditional session management',
                  'Decentralized user control'
                ]
              },
              {
                title: 'External Integrations',
                description: 'IPFS storage and OpenAI API for AI-powered features',
                icon: Globe,
                features: [
                  'Decentralized file storage',
                  'AI dataset summarization',
                  '0G testnet blockchain integration'
                ]
              }
            ].map((layer, index) => (
              <article
                key={layer.title}
                className="text-center glass-cyber hover-cyber p-6 rounded-2xl group transition-all duration-500"
                data-testid={`architecture-${layer.title.toLowerCase().replace(' ', '-')}`}
              >
                <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <layer.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h4 className="text-lg font-semibold gradient-text-cyber mb-3">
                  {layer.title}
                </h4>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {layer.description}
                </p>
                <ul className="space-y-2">
                  {layer.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="text-xs text-foreground/70 flex items-center justify-center">
                      <div className="w-1 h-1 bg-primary rounded-full mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
        {/* Ambient background effects */}
        <div className="absolute top-1/4 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-56 h-56 bg-primary/5 rounded-full blur-3xl" />
      </section>

      {/* Get in Touch Section */}
      <section className="py-20 px-4 lg:px-6 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h3 className="text-cyber-lg gradient-text-cyber mb-4">
              Get in touch
            </h3>
            <p className="text-zen text-accent/80">
              Let's connect and build together
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <a
              href="mailto:vikingsmars@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-center glass-cyber hover-cyber p-6 rounded-2xl transition-all duration-500 group"
              data-testid="link-email"
            >
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6 text-primary-foreground" />
              </div>
              <h4 className="font-medium gradient-text-zen mb-2">Email</h4>
              <p className="text-sm text-foreground/60">vikingsmars@gmail.com</p>
            </a>

            <a
              href="https://github.com/marsv123/Zenkai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-center glass-cyber hover-cyber p-6 rounded-2xl transition-all duration-500 group"
              data-testid="link-github"
            >
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Github className="w-6 h-6 text-primary-foreground" />
              </div>
              <h4 className="font-medium gradient-text-zen mb-2">GitHub</h4>
              <p className="text-sm text-foreground/60"><ZenkaiBrand colorContext="inherit" /> Repo</p>
            </a>

            <a
              href="https://twitter.com/VikingMars"
              target="_blank"
              rel="noopener noreferrer"
              className="text-center glass-cyber hover-cyber p-6 rounded-2xl transition-all duration-500 group"
              data-testid="link-twitter"
            >
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Twitter className="w-6 h-6 text-primary-foreground" />
              </div>
              <h4 className="font-medium gradient-text-zen mb-2">Twitter/X</h4>
              <p className="text-sm text-foreground/60">@VikingMars</p>
            </a>

          </div>
        </div>
      </section>

    </div>
  );
}