import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link, useLocation } from 'wouter';
import { Brain, Upload, User, Home, Store, Menu } from 'lucide-react';
import { useState } from 'react';

export default function Navigation() {
  const [location] = useLocation();
  const { address } = useAccount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'home', icon: Home },
    { path: '/marketplace', label: 'marketplace', icon: Store },
    { path: '/upload', label: 'upload', icon: Upload, requiresWallet: true },
    { path: '/dashboard', label: 'dashboard', icon: User, requiresWallet: true },
  ];

  // Render a simple samurai icon as placeholder for the meditating samurai logo
  const SamuraiLogo = () => (
    <div className="samurai-glow" aria-label="zatorai logo" role="img">
      <Brain className="w-10 h-10 neon-text-primary" />
    </div>
  );

  return (
    <nav className="nav-glass sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Left: Logo + Brand */}
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer group">
              <SamuraiLogo />
              <div>
                <div className="font-display font-bold text-2xl neon-text-primary">
                  zatorai.
                </div>
                <div className="text-xs text-muted-foreground">
                  the economy of intelligence
                </div>
              </div>
            </div>
          </Link>

          {/* Center: Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              if (item.requiresWallet && !address) return null;
              
              const isActive = location === item.path;
              
              return (
                <Link key={item.path} href={item.path}>
                  <button
                    className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 ${
                      isActive 
                        ? 'neon-text-primary' 
                        : 'text-muted-foreground hover:text-accent hover:neon-text-accent'
                    }`}
                    data-testid={`nav-${item.label}`}
                  >
                    {item.label}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary neon-glow-primary rounded-full" />
                    )}
                  </button>
                </Link>
              );
            })}
          </div>

          {/* Right: Wallet Connection */}
          <div className="flex items-center space-x-4">
            {/* Custom styled Connect Button */}
            <div className="hidden md:block">
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
                              className="btn-primary"
                              data-testid="nav-connect-wallet"
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
                              className="btn-secondary"
                            >
                              Wrong network
                            </button>
                          );
                        }

                        return (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={openAccountModal}
                              type="button"
                              className="btn-secondary text-xs"
                              data-testid="nav-account-button"
                            >
                              {account.displayName}
                              {account.displayBalance
                                ? ` (${account.displayBalance})`
                                : ''}
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  );
                }}
              </ConnectButton.Custom>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-accent transition-colors"
              data-testid="nav-mobile-menu-button"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => {
                if (item.requiresWallet && !address) return null;
                
                const isActive = location === item.path;
                
                return (
                  <Link key={item.path} href={item.path}>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-300 rounded-lg ${
                        isActive 
                          ? 'neon-text-primary bg-card' 
                          : 'text-muted-foreground hover:text-accent hover:bg-muted'
                      }`}
                      data-testid={`nav-mobile-${item.label}`}
                    >
                      {item.label}
                    </button>
                  </Link>
                );
              })}
              
              {/* Mobile Wallet Connection */}
              <div className="px-4 pt-2">
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
                                className="w-full btn-primary"
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
                                className="w-full btn-secondary"
                              >
                                Wrong network
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
                              className="w-full btn-secondary text-xs"
                              data-testid="nav-mobile-account-button"
                            >
                              {account.displayName}
                              {account.displayBalance
                                ? ` (${account.displayBalance})`
                                : ''}
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
        )}
      </div>
    </nav>
  );
}