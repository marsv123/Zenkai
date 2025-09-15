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

export default function Navigation() {
  const [location, setLocation] = useLocation();
  const { address } = useAccount();
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for enhanced navigation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
                  {navItems.map((item) => (
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

                  {/* AI Tools Submenu */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger 
                      data-testid="nav-ai-tools"
                      className="bg-transparent hover:bg-transparent focus:bg-transparent text-foreground hover:text-foreground focus:text-foreground transition-colors"
                    >
                      AI Tools
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent 
                        className="glass-cyber border-primary/20"
                      >
                        {aiItems.map((item) => (
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