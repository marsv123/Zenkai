import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link, useLocation } from 'wouter';
import { Wallet } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navigation() {
  const [location] = useLocation();
  const { address } = useAccount();
  // Removed dropdown state - no longer needed
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for enhanced navigation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Removed dropdown outside click handler - no longer needed

  // Removed dropdown items - no longer needed

  // Removed SamuraiLogo component - no longer needed

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 glass-cyber transition-all duration-500 ease-out ${
        scrolled ? 'py-3' : 'py-6'
      }`}>
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Empty space */}
            <div></div>

            {/* Center: zenkai */}
            <Link href="/" 
              className="cursor-pointer group" 
              data-testid="nav-zenkai"
              aria-label="zenkai homepage"
            >
              <div className="text-cyber-lg gradient-text-cyber">
                zenkai
              </div>
            </Link>

            {/* Right: Wallet Connection */}
            <div className="flex items-center space-x-4">
              
              {/* Wallet Connection Button */}
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
                              className="flex items-center space-x-2 gradient-primary hover-cyber px-4 py-2 rounded-xl font-medium text-primary-foreground transition-all duration-500"
                              data-testid="nav-connect-wallet"
                              aria-label="Connect Wallet"
                            >
                              <Wallet className="w-5 h-5" />
                            </button>
                          );
                        }

                        if (chain.unsupported) {
                          return (
                            <button
                              onClick={openChainModal}
                              type="button"
                              className="flex items-center space-x-2 glass-panel border-destructive/50 text-destructive hover-cyber px-4 py-2 rounded-xl transition-all duration-500"
                              data-testid="nav-wrong-network"
                              aria-label="Switch Network"
                            >
                              <Wallet className="w-5 h-5" />
                              <span className="hidden sm:inline">Wrong Network</span>
                            </button>
                          );
                        }

                        return (
                          <button
                            onClick={openAccountModal}
                            type="button"
                            className="flex items-center space-x-3 glass-panel hover-cyber px-4 py-2 rounded-xl transition-all duration-500"
                            data-testid="nav-wallet-account"
                            aria-label="View Account"
                          >
                            <div className="flex items-center space-x-2">
                              <Wallet className="w-5 h-5 text-accent" />
                              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                            </div>
                            <div className="text-left hidden sm:block">
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
          </div>
        </div>

      </nav>

    </>
  );
}