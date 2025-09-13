import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link, useLocation } from 'wouter';
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
        scrolled ? 'py-2' : 'py-4'
      }`}>
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-11">
            
            {/* Left: Empty space */}
            <div></div>

            {/* Center: zenkai - Wallet Connection */}
            <ConnectButton.Custom>
              {({
                account,
                chain,
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
                  <button
                    onClick={connected ? undefined : openConnectModal}
                    className={`cursor-pointer group text-cyber-lg font-display transition-all duration-500 ${
                      connected 
                        ? 'text-[hsl(6_100%_48%)]' 
                        : 'gradient-text-cyber animate-pulse-glow'
                    }`}
                    data-testid="nav-zenkai"
                    aria-label={connected ? 'Wallet Connected' : 'Connect Wallet'}
                  >
                    zenkai
                  </button>
                );
              }}
            </ConnectButton.Custom>

            {/* Right: Empty space for balance */}
            <div></div>
          </div>
        </div>

      </nav>

    </>
  );
}