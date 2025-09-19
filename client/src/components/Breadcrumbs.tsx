import { Link, useLocation } from 'wouter';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path: string;
}

export default function Breadcrumbs() {
  const [location] = useLocation();

  const getBreadcrumbs = (path: string): BreadcrumbItem[] => {
    // Define the page mappings with better labels
    const pageMap: Record<string, string> = {
      '/': 'Home',
      '/marketplace': 'Marketplace',
      '/upload': 'Upload Dataset',
      '/dashboard': 'Dashboard',
      '/compose': 'Compose AI',
      '/train': 'Train Model',
      '/tokenize': 'Tokenize AI'
    };

    const breadcrumbs: BreadcrumbItem[] = [];

    // Always start with home unless we're already on home
    if (path !== '/') {
      breadcrumbs.push({ label: 'Home', path: '/' });
    }

    // Add current page if it's not home
    if (path !== '/' && pageMap[path]) {
      breadcrumbs.push({ label: pageMap[path], path });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs(location);

  // Don't show breadcrumbs on home page or if no breadcrumbs
  if (location === '/' || breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav 
      aria-label="Breadcrumb" 
      className="mb-8"
      data-testid="breadcrumb-navigation"
    >
      <ol className="flex items-center space-x-2 text-sm">
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <li key={breadcrumb.path} className="flex items-center">
              {index === 0 && (
                <Home 
                  className="w-4 h-4 mr-1 text-foreground/60" 
                  aria-hidden="true" 
                />
              )}
              
              {isLast ? (
                <span 
                  className="gradient-text-cyber font-medium"
                  aria-current="page"
                  data-testid={`breadcrumb-current-${breadcrumb.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {breadcrumb.label}
                </span>
              ) : (
                <>
                  <Link
                    href={breadcrumb.path}
                    className="text-foreground/70 hover:text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary rounded px-1 py-0.5"
                    data-testid={`breadcrumb-link-${breadcrumb.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {breadcrumb.label}
                  </Link>
                  <ChevronRight 
                    className="w-4 h-4 mx-2 text-foreground/40" 
                    aria-hidden="true" 
                  />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}