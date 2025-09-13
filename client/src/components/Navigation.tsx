import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link, useLocation } from 'wouter';
import { Upload, User, Home, Store } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import zenkaiLogoUrl from '@assets/Logo1_1757790479722.png';

export default function Navigation() {
  const [location] = useLocation();
  const { address } = useAccount();
  const [logoDropdownOpen, setLogoDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for enhanced navigation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle dropdown close on outside click
  useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      if (logoDropdownOpen && containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setLogoDropdownOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [logoDropdownOpen]);

  const dropdownItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/marketplace', label: 'Marketplace', icon: Store },
    { path: '/how-it-works', label: 'How it Works', icon: User },
  ];

  // Professional Samurai Logo Component
  const SamuraiLogo = ({ className = "", size = "large" }: { className?: string; size?: "small" | "medium" | "large" }) => {
    const dimensions = {
      small: "w-8 h-8",
      medium: "w-10 h-10", 
      large: "w-12 h-12"
    };

    return (
      <div className={className}>
        <img
          src={zenkaiLogoUrl}
          alt="zenkai - meditating samurai with glowing eyes"
          className={`${dimensions[size]} transition-all duration-300`}
          loading="lazy"
        />
      </div>
    );
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 glass-cyber transition-all duration-500 ease-out ${
        scrolled ? 'py-3' : 'py-6'
      }`}>
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: zenkai only */}
            <Link href="/" 
              className="cursor-pointer group" 
              data-testid="nav-zenkai"
              aria-label="zenkai homepage"
            >
              <div className="text-cyber-lg gradient-text-cyber">
                zenkai
              </div>
            </Link>

            {/* Center: intelligence at scale */}
            <div className="hidden lg:block">
              <div className="text-zen text-accent/80">
                intelligence at scale
              </div>
            </div>

            {/* Right: Logo with Dropdown */}
            <div className="flex items-center space-x-4">
              
              {/* Logo Dropdown - Desktop and Mobile */}
              <div className="relative" data-dropdown ref={containerRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLogoDropdownOpen((v) => !v);
                  }}
                  className="hover-cyber transition-all duration-500"
                  data-testid="nav-logo-dropdown"
                  aria-label="Open navigation menu"
                  aria-expanded={logoDropdownOpen}
                >
                  <SamuraiLogo size="medium" className="lg:w-12 lg:h-12" />
                </button>
                
                {/* Dropdown Menu */}
                {logoDropdownOpen && (
                  <div 
                    className="absolute right-0 top-full mt-2 w-64 glass-cyber rounded-xl border border-primary/20 py-4 z-50"
                    role="menu"
                    aria-label="Navigation menu"
                    data-testid="nav-dropdown-menu"
                  >
                    {/* Connect Wallet Section */}
                    <div className="px-4 pb-4 border-b border-primary/20">
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
                                        setLogoDropdownOpen(false);
                                      }}
                                      type="button"
                                      className="w-full gradient-primary hover-cyber px-4 py-3 rounded-xl font-medium text-primary-foreground transition-all duration-500"
                                      data-testid="dropdown-connect-wallet"
                                    >
                                      Connect Wallet
                                    </button>
                                  );
                                }

                                if (chain.unsupported) {
                                  return (
                                    <button
                                      onClick={() => {
                                        openChainModal();
                                        setLogoDropdownOpen(false);
                                      }}
                                      type="button"
                                      className="w-full glass-panel border-destructive/50 text-destructive hover-cyber px-4 py-3 rounded-xl transition-all duration-500 flex items-center justify-center space-x-2"
                                    >
                                      <span className="w-2 h-2 bg-destructive rounded-full"></span>
                                      <span>Wrong Network</span>
                                    </button>
                                  );
                                }

                                return (
                                  <button
                                    onClick={() => {
                                      openAccountModal();
                                      setLogoDropdownOpen(false);
                                    }}
                                    type="button"
                                    className="w-full glass-panel hover-cyber px-4 py-3 rounded-xl transition-all duration-500 flex items-center space-x-3"
                                    data-testid="dropdown-account-button"
                                  >
                                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                                    <div className="text-left flex-1">
                                      <div className="text-sm font-medium text-foreground">
                                        {account.displayName}
                                      </div>
                                      {account.displayBalance && (
                                        <div className="text-xs text-muted-foreground">
                                          {account.displayBalance}
                                        </div>
                                      )}
                                    </div>
                                  </button>
                                );
                              })()}
                            </div>
                          );
                        }}
                      </ConnectButton.Custom>
                    </div>
                    
                    {/* Navigation Items */}
                    <div className="px-2 pt-4">
                      {dropdownItems.map((item) => {
                        const isActive = location === item.path;
                        const Icon = item.icon;
                        
                        return (
                          <Link 
                            key={item.path} 
                            href={item.path}
                            onClick={() => setLogoDropdownOpen(false)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-500 ${
                              isActive 
                                ? 'gradient-text-cyber border border-primary/30' 
                                : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                            }`}
                            data-testid={`nav-${item.label.toLowerCase().replace(/ /g, '-')}`}
                            role="menuitem"
                            aria-current={isActive ? 'page' : undefined}
                          >
                            <Icon className="w-5 h-5" aria-hidden="true" />
                            <span className="font-medium">{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

      </nav>

      {/* Logo Dropdown Overlay */}
      {logoDropdownOpen && (
        <div 
          className="fixed inset-0 z-30"
          onClick={() => setLogoDropdownOpen(false)}
        />
      )}
    </>
  );
}