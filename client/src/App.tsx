import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { config } from './lib/wagmi';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Home from "@/pages/home";
import Marketplace from "@/pages/marketplace";
import Create from "@/pages/create";
import Upload from "@/pages/upload";
import Monetize from "@/pages/monetize";
import Dashboard from "@/pages/dashboard";
import HowItWorks from "@/pages/how-it-works";
import Compose from "@/pages/compose";
import Train from "@/pages/train";
import Tokenize from "@/pages/tokenize";
import NotFound from "@/pages/not-found";
import '@rainbow-me/rainbowkit/styles.css';

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main id="main-content" className="container mx-auto px-4 lg:px-6 pt-8">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/marketplace" component={Marketplace} />
          <Route path="/create" component={Create} />
          <Route path="/upload" component={Upload} />
          <Route path="/monetize" component={Monetize} />
          <Route path="/compose" component={Compose} />
          <Route path="/train" component={Train} />
          <Route path="/tokenize" component={Tokenize} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/how-it-works" component={HowItWorks} />
          {/* Fallback to 404 */}
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
