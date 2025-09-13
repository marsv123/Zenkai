import { Link } from 'wouter';
import { Upload, Store, Wand2, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4 lg:px-6 overflow-hidden">
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h1 className="text-cyber-xl gradient-text-cyber font-display mb-8">
            How zenkai Works
          </h1>
          <p className="text-zen gradient-text-zen font-accent tracking-wider mb-8">
            Simple steps to join the decentralized intelligence economy
          </p>
          <div className="glass-cyber p-8 rounded-2xl max-w-3xl mx-auto">
            <p className="text-lg md:text-xl text-foreground/90 leading-relaxed">
              zenkai transforms how data meets AI, creating a decentralized marketplace 
              where intelligence becomes liquid and accessible to all builders in the ecosystem.
            </p>
          </div>
        </div>
        
        {/* Ambient Background Effects */}
        <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-accent/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}} />
      </section>

      {/* How It Works Steps */}
      <section className="py-20 px-4 border-t border-primary/20 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1: Upload */}
            <div className="text-center glass-cyber hover-cyber p-8 rounded-2xl transition-all duration-500 group" data-testid="step-upload-datasets">
              <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold gradient-text-cyber mb-4">
                Upload Datasets
              </h3>
              <p className="text-base text-foreground/80 leading-relaxed mb-6">
                Share your data on IPFS, set pricing in IMT tokens, and earn from every download. 
                Your datasets are secured on the decentralized network with full ownership control.
              </p>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>Upload to IPFS storage</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>Set IMT token pricing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>Earn from downloads</span>
                </div>
              </div>
            </div>

            {/* Step 2: Discover */}
            <div className="text-center glass-cyber hover-cyber p-8 rounded-2xl transition-all duration-500 group" data-testid="step-discover-intelligence">
              <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Store className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold gradient-text-cyber mb-4">
                Discover Intelligence
              </h3>
              <p className="text-base text-foreground/80 leading-relaxed mb-6">
                Browse curated datasets from verified contributors. Purchase using IMT tokens 
                with transparent pricing and instant access to AI-ready data.
              </p>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>Browse verified datasets</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>Purchase with IMT tokens</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>Instant data access</span>
                </div>
              </div>
            </div>

            {/* Step 3: Build */}
            <div className="text-center glass-cyber hover-cyber p-8 rounded-2xl transition-all duration-500 group" data-testid="step-build-future">
              <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Wand2 className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold gradient-text-cyber mb-4">
                Build the Future
              </h3>
              <p className="text-base text-foreground/80 leading-relaxed mb-6">
                Create AI applications powered by decentralized intelligence. Access quality data 
                from multiple sources to build more robust and capable AI systems.
              </p>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>Power AI applications</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>Multi-source data access</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>Build robust AI systems</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Ambient background effects */}
        <div className="absolute top-1/4 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-56 h-56 bg-primary/5 rounded-full blur-3xl" />
      </section>

      {/* Technical Architecture */}
      <section className="py-16 px-4 border-t border-border">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold gradient-text-cyber mb-4">
              Technical Architecture
            </h2>
            <p className="text-muted-foreground">
              Built on the 0G decentralized network for maximum security and scalability
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-panel p-6 rounded-xl" data-testid="architecture-blockchain">
              <h3 className="text-lg font-semibold text-foreground mb-3">Blockchain Layer</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Smart contracts handle dataset registration, ownership, and payments on the 0G network.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  <span>Dataset registry smart contracts</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  <span>IMT token-based payments</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  <span>Contributor NFT rewards</span>
                </li>
              </ul>
            </div>
            
            <div className="glass-panel p-6 rounded-xl" data-testid="architecture-storage">
              <h3 className="text-lg font-semibold text-foreground mb-3">Storage Layer</h3>
              <p className="text-sm text-muted-foreground mb-4">
                IPFS provides decentralized, content-addressed storage for all datasets.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-secondary rounded-full"></div>
                  <span>IPFS content addressing</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-secondary rounded-full"></div>
                  <span>Distributed data availability</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-secondary rounded-full"></div>
                  <span>Immutable data integrity</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 text-center border-t border-primary/20 relative overflow-hidden">
        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="glass-cyber p-12 rounded-3xl">
            <h2 className="text-cyber-lg gradient-text-cyber mb-6">
              Ready to Join the Intelligence Economy?
            </h2>
            <p className="text-zen text-accent/80 mb-12 max-w-2xl mx-auto">
              Start contributing to or building with the world's first decentralized AI data marketplace
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link 
                href="/marketplace"
                className="gradient-primary hover-cyber px-10 py-4 rounded-xl font-medium text-primary-foreground transition-all duration-500 text-lg flex items-center justify-center space-x-3 group"
                data-testid="button-explore-marketplace"
              >
                <Store className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Explore Marketplace</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/upload"
                className="glass-panel hover-cyber px-10 py-4 rounded-xl font-medium text-foreground transition-all duration-500 text-lg flex items-center justify-center space-x-3 group border border-primary/30"
                data-testid="button-upload-dataset"
              >
                <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Upload Your Dataset</span>
              </Link>
            </div>
          </div>
        </div>
        {/* Ambient background effects */}
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-accent/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
      </section>
    </div>
  );
}