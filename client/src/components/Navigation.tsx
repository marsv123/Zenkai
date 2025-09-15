import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link, useLocation } from 'wouter';
import { useState, useEffect } from 'react';
import { Menu, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
  DropdownMenuSub,
} from '@/components/ui/dropdown-menu';
import content from '@/lib/config/content.json';

export default function Navigation() {
  const [location, setLocation] = useLocation();
  const { address } = useAccount();
  const [scrolled, setScrolled] = useState(false);
  const [previousAddress, setPreviousAddress] = useState<string | undefined>(undefined);

  // Handle scroll effect for enhanced navigation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle wallet connection redirect to dashboard
  useEffect(() => {
    // Only redirect if:
    // 1. User just connected (address is now present but wasn't before)
    // 2. User is not already on the dashboard or any of the workflow pages
    // 3. User is not on the home page (where they might want to stay)
    if (
      address && 
      !previousAddress && 
      location !== '/dashboard' && 
      location !== '/' &&
      !location.startsWith('/upload') &&
      !location.startsWith('/monetize') &&
      !location.startsWith('/build') &&
      !location.startsWith('/train') &&
      !location.startsWith('/tokenize') &&
      !location.startsWith('/marketplace')
    ) {
      // Small delay to ensure wallet connection is fully established
      const redirectTimer = setTimeout(() => {
        setLocation('/dashboard');
      }, 500);
      
      return () => clearTimeout(redirectTimer);
    }
    
    // Update previous address to track connection changes
    setPreviousAddress(address);
  }, [address, previousAddress, location, setLocation]);

  // Main navigation items
  const mainNavItems = [
    { path: '/', label: 'Home', testId: 'nav-home' },
    { path: '/marketplace', label: 'Marketplace', testId: 'nav-marketplace' }
  ];

  // How It Works submenu items
  const howItWorksItems = [
    { path: '/upload', label: content.navigation.upload, testId: 'nav-upload' },
    { path: '/monetize', label: content.navigation.monetize, testId: 'nav-monetize' },
    { path: '/build', label: content.navigation.build, testId: 'nav-build' },
    { path: '/train', label: content.navigation.train, testId: 'nav-train' },
    { path: '/tokenize', label: content.navigation.tokenize, testId: 'nav-tokenize' }
  ];

  // Dashboard item (only visible when wallet is connected)
  const dashboardItem = { path: '/dashboard', label: content.navigation.dashboard, testId: 'nav-dashboard' };

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
            
            {/* Left spacer for balanced layout */}
            <div className="flex-1" />

            {/* Center: Logo/Brand */}
            <div className="flex-shrink-0">
              <Link
                href="/"
                className="cursor-pointer group text-cyber-lg font-display transition-all duration-500 text-white hover:text-[hsl(22_100%_60%)] active:text-[hsl(16_100%_55%)] focus:outline-none focus:ring-2 focus:ring-primary rounded-lg px-2 py-1"
                data-testid="nav-zenkai-home"
                aria-label="Zenkai - Go to homepage"
              >
                Zenkai
              </Link>
            </div>

            {/* Right: Menu Dropdown */}
            <div className="flex-1 flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="glass-panel px-4 py-2 rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary hover:bg-muted/20 hover:text-foreground"
                    data-testid="nav-menu"
                    aria-label="Navigation menu"
                  >
                    <Menu className="w-5 h-5 mr-2" aria-hidden="true" />
                    Menu
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="glass-cyber border-primary/20 w-56" align="end">
                  {/* Connect Wallet */}
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
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            connected ? openAccountModal() : openConnectModal();
                          }}
                          className="cursor-pointer hover:bg-muted/20 hover:text-foreground focus:bg-muted/20 focus:text-foreground transition-colors"
                          data-testid="nav-wallet"
                        >
                          {connected
                            ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}`
                            : 'Connect Wallet'
                          }
                        </DropdownMenuItem>
                      );
                    }}
                  </ConnectButton.Custom>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Main Navigation Items */}
                  {mainNavItems.map((item) => (
                    <DropdownMenuItem 
                      key={item.path}
                      onSelect={() => setLocation(item.path)}
                      className={`cursor-pointer hover:bg-muted/20 hover:text-foreground focus:bg-muted/20 focus:text-foreground transition-colors ${
                        isActivePath(item.path) ? 'bg-primary/10 text-primary' : ''
                      }`}
                      data-testid={item.testId}
                      aria-current={isActivePath(item.path) ? 'page' : undefined}
                    >
                      {item.label}
                    </DropdownMenuItem>
                  ))}

                  <DropdownMenuSeparator />

                  {/* How It Works Submenu */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger 
                      data-testid="nav-how-it-works"
                      className="bg-transparent hover:bg-transparent focus:bg-transparent text-foreground hover:text-foreground focus:text-foreground data-[state=open]:text-foreground data-[highlighted]:text-foreground data-[state=open]:bg-transparent [&[data-highlighted]]:text-foreground [&[data-highlighted]]:bg-transparent [&[data-state=open]]:text-foreground [&[data-state=open]]:bg-transparent transition-colors"
                      style={{ color: 'hsl(var(--foreground))', backgroundColor: 'transparent' }}
                    >
                      How It Works
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent 
                        className="glass-cyber border-primary/20"
                      >
                        {howItWorksItems.map((item) => (
                          <DropdownMenuItem 
                            key={item.path}
                            onSelect={() => setLocation(item.path)}
                            className={`cursor-pointer hover:bg-muted/20 hover:text-foreground focus:bg-muted/20 focus:text-foreground transition-colors ${
                              isActivePath(item.path) ? 'bg-primary/10 text-primary' : ''
                            }`}
                            data-testid={item.testId}
                            aria-current={isActivePath(item.path) ? 'page' : undefined}
                          >
                            {item.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>

                  {/* Dashboard (only when wallet connected) */}
                  {address && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onSelect={() => setLocation(dashboardItem.path)}
                        className={`cursor-pointer hover:bg-muted/20 hover:text-foreground focus:bg-muted/20 focus:text-foreground transition-colors ${
                          isActivePath(dashboardItem.path) ? 'bg-primary/10 text-primary' : ''
                        }`}
                        data-testid={dashboardItem.testId}
                        aria-current={isActivePath(dashboardItem.path) ? 'page' : undefined}
                      >
                        {dashboardItem.label}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed navigation */}
      <div className="h-16 lg:h-20" aria-hidden="true" />
    </>
  );
}