import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link, useLocation } from 'wouter';
import { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export default function Navigation() {
  const [location] = useLocation();
  const { address } = useAccount();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('');

  // Handle scroll effect for enhanced navigation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update current page for navigation highlighting
  useEffect(() => {
    setCurrentPage(location);
  }, [location]);

  // Navigation items
  const navItems = [
    { path: '/', label: 'Home', testId: 'nav-home' },
    { path: '/marketplace', label: 'Marketplace', testId: 'nav-marketplace' },
    { path: '/upload', label: 'Upload', testId: 'nav-upload' },
    { path: '/dashboard', label: 'Dashboard', testId: 'nav-dashboard' }
  ];

  const aiItems = [
    { path: '/compose', label: 'Compose AI', testId: 'nav-compose' },
    { path: '/train', label: 'Train', testId: 'nav-train' },
    { path: '/tokenize', label: 'Tokenize', testId: 'nav-tokenize' }
  ];

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Handle escape key for mobile menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  const isActivePath = (path: string) => {
    return location === path || (path !== '/' && location.startsWith(path));
  };


  return (
    <>
      {/* Skip Links for Accessibility */}
      <div className="sr-only focus-within:not-sr-only">
        <a
          href="#main-content"
          className="fixed top-4 left-4 z-[100] glass-cyber hover-cyber px-4 py-2 rounded-lg gradient-text-cyber font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary"
          data-testid="skip-to-main"
        >
          Skip to main content
        </a>
      </div>

      <nav className={`fixed top-0 left-0 right-0 z-50 glass-cyber transition-all duration-500 ease-out ${
        scrolled ? 'py-2' : 'py-4'
      }`} role="navigation" aria-label="Main navigation">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-11">
            
            {/* Left: Logo/Brand */}
            <div className="flex items-center space-x-8">
              <Link
                href="/"
                className="cursor-pointer group text-cyber-lg font-display transition-all duration-500 text-white hover:text-[hsl(22_100%_60%)] active:text-[hsl(16_100%_55%)] focus:outline-none focus:ring-2 focus:ring-primary rounded-lg px-2 py-1"
                data-testid="nav-zenkai-home"
                aria-label="Zenkai - Go to homepage"
              >
                Zenkai
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`px-4 py-2 rounded-xl transition-all duration-300 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                      isActivePath(item.path)
                        ? 'gradient-primary text-primary-foreground shadow-lg'
                        : 'text-foreground/80 hover:text-foreground hover:bg-muted/20'
                    }`}
                    data-testid={item.testId}
                    aria-current={isActivePath(item.path) ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                ))}

                {/* AI Tools Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="px-4 py-2 rounded-xl text-sm text-foreground/80 hover:text-foreground hover:bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary"
                      data-testid="nav-ai-tools"
                      aria-label="AI Tools menu"
                    >
                      AI Tools
                      <ChevronDown className="w-4 h-4 ml-1" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="glass-cyber border-primary/20" align="center">
                    {aiItems.map((item) => (
                      <DropdownMenuItem key={item.path} asChild>
                        <Link
                          href={item.path}
                          className="w-full cursor-pointer focus:bg-muted/20 focus:text-foreground transition-colors"
                          data-testid={item.testId}
                        >
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Right: Wallet Connection & Mobile Menu */}
            <div className="flex items-center space-x-4">
              {/* Wallet Connection */}
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
                      className="glass-panel hover-cyber px-4 py-2 rounded-xl font-medium transition-all duration-300 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      data-testid="nav-wallet"
                      aria-label={connected ? 'Manage Wallet' : 'Connect Wallet'}
                    >
                      {connected
                        ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}`
                        : 'Connect'
                      }
                    </button>
                  );
                }}
              </ConnectButton.Custom>

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden glass-panel hover-cyber p-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="nav-mobile-menu"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" aria-hidden="true" />
                ) : (
                  <Menu className="w-5 h-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            id="mobile-menu"
            className="lg:hidden glass-cyber border-t border-primary/20 mt-4"
            role="menu"
            aria-labelledby="nav-mobile-menu"
          >
            <div className="container mx-auto px-4 py-6">
              <div className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`block px-4 py-3 rounded-xl transition-all duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-primary ${
                      isActivePath(item.path)
                        ? 'gradient-primary text-primary-foreground shadow-lg'
                        : 'text-foreground/80 hover:text-foreground hover:bg-muted/20'
                    }`}
                    data-testid={`mobile-${item.testId}`}
                    role="menuitem"
                    aria-current={isActivePath(item.path) ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                ))}
                
                <div className="pt-2 border-t border-primary/10">
                  <p className="px-4 py-2 text-sm font-medium gradient-text-cyber">AI Tools</p>
                  {aiItems.map((item) => (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`block px-6 py-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary ${
                        isActivePath(item.path)
                          ? 'gradient-primary text-primary-foreground shadow-lg'
                          : 'text-foreground/70 hover:text-foreground hover:bg-muted/20'
                      }`}
                      data-testid={`mobile-${item.testId}`}
                      role="menuitem"
                      aria-current={isActivePath(item.path) ? 'page' : undefined}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer for fixed navigation */}
      <div className="h-16 lg:h-20" aria-hidden="true" />
    </>
  );
}