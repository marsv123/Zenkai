import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link, useLocation } from 'wouter';
import { Upload, User, Home, Store, Menu, X, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import samuraiLogoUrl from '@assets/samurai-logo.png';

export default function Navigation() {
  const [location] = useLocation();
  const { address } = useAccount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for enhanced navigation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: '/', label: 'home', icon: Home },
    { path: '/marketplace', label: 'marketplace', icon: Store },
    { path: '/upload', label: 'publish', icon: Upload, requiresWallet: true },
    { path: '/dashboard', label: 'portfolio', icon: User, requiresWallet: true },
  ];

  // Professional Samurai Logo Component
  const SamuraiLogo = ({ className = "", size = "large" }: { className?: string; size?: "small" | "medium" | "large" }) => {
    const dimensions = {
      small: "w-8 h-8",
      medium: "w-10 h-10", 
      large: "w-12 h-12"
    };

    return (
      <div className={`samurai-logo ${className}`}>
        <img
          src={samuraiLogoUrl}
          alt="zatorai - cyberpunk meditating samurai"
          className={`${dimensions[size]} samurai-glow transition-all duration-300`}
          loading="lazy"
        />
      </div>
    );
  };

  return (
    <>
      <nav className={`nav-glass fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-2' : 'py-4'
      }`}>
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Enhanced Logo + Brand */}
            <Link href="/">
              <div className="flex items-center space-x-4 cursor-pointer group" data-testid="nav-logo">
                <SamuraiLogo className="group-hover:scale-110 transition-transform duration-300" />
                <div>
                  <div className="font-display font-bold text-2xl lg:text-3xl text-glow-primary">
                    zatorai
                  </div>
                  <div className="text-xs lg:text-sm font-accent text-muted-foreground group-hover:text-accent transition-colors duration-300">
                    the economy of intelligence
                  </div>
                </div>
              </div>
            </Link>

            {/* Center: Enhanced Navigation Links (Desktop) */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                if (item.requiresWallet && !address) return null;
                
                const isActive = location === item.path;
                const Icon = item.icon;
                
                return (
                  <Link key={item.path} href={item.path}>
                    <button
                      className={`nav-link flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                        isActive 
                          ? 'text-primary bg-primary/10 glow-primary' 
                          : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                      }`}
                      data-testid={`nav-${item.label}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-accent font-medium capitalize">{item.label}</span>
                    </button>
                  </Link>
                );
              })}
            </div>

            {/* Right: Enhanced Wallet Connection + Mobile Menu */}
            <div className="flex items-center space-x-4">
              
              {/* Desktop Wallet Connection */}
              <div className="hidden lg:block">
                <ConnectButton.Custom>
                  {({
                    account,
                    chain,
                    openAccountModal,
                    openChainModal,
                    openConnectModal,
                    authenticationStatus,
                    mounted,
                  }) => {
                    const ready = mounted && authenticationStatus !== 'loading';
                    const connected =
                      ready &&
                      account &&
                      chain &&
                      (!authenticationStatus ||
                        authenticationStatus === 'authenticated');

                    return (
                      <div
                        {...(!ready && {
                          'aria-hidden': true,
                          style: {
                            opacity: 0,
                            pointerEvents: 'none',
                            userSelect: 'none',
                          },
                        })}
                      >
                        {(() => {
                          if (!connected) {
                            return (
                              <button
                                onClick={openConnectModal}
                                type="button"
                                className="btn-primary flex items-center space-x-2"
                                data-testid="nav-connect-wallet"
                              >
                                <span>connect wallet</span>
                              </button>
                            );
                          }

                          if (chain.unsupported) {
                            return (
                              <button
                                onClick={openChainModal}
                                type="button"
                                className="btn-secondary flex items-center space-x-2"
                              >
                                <span className="w-2 h-2 bg-destructive rounded-full"></span>
                                <span>wrong network</span>
                              </button>
                            );
                          }

                          return (
                            <div className="relative group">
                              <button
                                onClick={openAccountModal}
                                type="button"
                                className="btn-ghost flex items-center space-x-3 px-4 py-2 border border-primary/20 rounded-lg hover:border-primary/40"
                                data-testid="nav-account-button"
                              >
                                <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                                <div className="text-left">
                                  <div className="text-sm font-medium text-foreground">
                                    {account.displayName}
                                  </div>
                                  {account.displayBalance && (
                                    <div className="text-xs text-muted-foreground">
                                      {account.displayBalance}
                                    </div>
                                  )}
                                </div>
                                <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  }}
                </ConnectButton.Custom>
              </div>

              {/* Enhanced Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-3 rounded-lg border border-border hover:border-primary/40 text-muted-foreground hover:text-primary transition-all duration-300"
                data-testid="nav-mobile-menu-button"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Navigation */}
        <div className={`lg:hidden transition-all duration-300 ease-out ${
          mobileMenuOpen 
            ? 'max-h-screen opacity-100 border-t border-border' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="container mx-auto px-4 py-6">
            
            {/* Mobile Navigation Links */}
            <div className="space-y-2 mb-6">
              {navItems.map((item) => {
                if (item.requiresWallet && !address) return null;
                
                const isActive = location === item.path;
                const Icon = item.icon;
                
                return (
                  <Link key={item.path} href={item.path}>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className={`w-full flex items-center space-x-3 px-4 py-4 text-left rounded-xl transition-all duration-300 ${
                        isActive 
                          ? 'text-primary bg-primary/10 glow-primary' 
                          : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                      }`}
                      data-testid={`nav-mobile-${item.label}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-accent font-medium capitalize text-lg">{item.label}</span>
                    </button>
                  </Link>
                );
              })}
            </div>
            
            {/* Mobile Wallet Connection */}
            <div className="border-t border-border pt-6">
              <ConnectButton.Custom>
                {({
                  account,
                  chain,
                  openAccountModal,
                  openChainModal,
                  openConnectModal,
                  authenticationStatus,
                  mounted,
                }) => {
                  const ready = mounted && authenticationStatus !== 'loading';
                  const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus ||
                      authenticationStatus === 'authenticated');

                  return (
                    <div
                      {...(!ready && {
                        'aria-hidden': true,
                        style: {
                          opacity: 0,
                          pointerEvents: 'none',
                          userSelect: 'none',
                        },
                      })}
                    >
                      {(() => {
                        if (!connected) {
                          return (
                            <button
                              onClick={() => {
                                openConnectModal();
                                setMobileMenuOpen(false);
                              }}
                              type="button"
                              className="w-full btn-primary text-lg py-4"
                              data-testid="nav-mobile-connect-wallet"
                            >
                              connect wallet
                            </button>
                          );
                        }

                        if (chain.unsupported) {
                          return (
                            <button
                              onClick={openChainModal}
                              type="button"
                              className="w-full btn-secondary text-lg py-4 flex items-center justify-center space-x-2"
                            >
                              <span className="w-2 h-2 bg-destructive rounded-full"></span>
                              <span>wrong network</span>
                            </button>
                          );
                        }

                        return (
                          <button
                            onClick={() => {
                              openAccountModal();
                              setMobileMenuOpen(false);
                            }}
                            type="button"
                            className="w-full btn-ghost border border-primary/20 py-4 flex items-center justify-between"
                            data-testid="nav-mobile-account-button"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                              <div className="text-left">
                                <div className="font-medium text-foreground">
                                  {account.displayName}
                                </div>
                                {account.displayBalance && (
                                  <div className="text-sm text-muted-foreground">
                                    {account.displayBalance}
                                  </div>
                                )}
                              </div>
                            </div>
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          </button>
                        );
                      })()}
                    </div>
                  );
                }}
              </ConnectButton.Custom>
            </div>

            {/* Mobile Branding Footer */}
            <div className="mt-8 pt-6 border-t border-border">
              <div className="flex items-center justify-center space-x-3 opacity-60">
                <SamuraiLogo size="small" className="samurai-pulse" />
                <span className="font-display text-sm text-muted-foreground">
                  powered by zatorai intelligence
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}