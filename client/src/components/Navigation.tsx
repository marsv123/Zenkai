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

            {/* Center: Kaizen - Wallet Connection */}
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openConnectModal,
                openAccountModal,
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
                    onClick={connected ? openAccountModal : openConnectModal}
                    className="cursor-pointer group text-cyber-lg font-display transition-all duration-500 text-white hover:text-[hsl(22_100%_60%)] active:text-[hsl(16_100%_55%)]"
                    data-testid="nav-kaizen"
                    aria-label={connected ? 'Manage Wallet' : 'Connect Wallet'}
                  >
                    Kaizen
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