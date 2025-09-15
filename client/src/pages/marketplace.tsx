import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { Link } from 'wouter';
import { Dataset } from '@/../../shared/schema';
import { 
  Star, 
  ShoppingCart, 
  Eye, 
  Upload, 
  Search,
  Filter,
  SortAsc,
  Grid3X3,
  List,
  TrendingUp,
  Database,
  Zap,
  Shield,
  Award,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Loading, { SkeletonCard } from '@/components/Loading';
import samuraiLogoUrl from '@assets/samurai-logo.png';


// Professional Search Filters
interface SearchFilters {
  search: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  sortBy: 'latest' | 'price_asc' | 'price_desc' | 'rating_desc' | 'downloads_desc';
  minRating: number;
}

// Dense List View Item Component
function DatasetListItem({ dataset }: { dataset: Dataset }) {
  return (
    <div 
      className="card-interactive p-4 group hover:bg-muted/20 transition-colors"
      data-testid={`dataset-list-item-${dataset.id}`}
    >
      <div className="flex items-center justify-between gap-6">
        
        {/* Main Info Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-lg font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-glow-primary transition-colors">
                {dataset.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {dataset.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-xs">
            <Badge className="bg-primary/10 text-primary border-primary/20 font-accent">
              {dataset.category}
            </Badge>
            {dataset.aiSummary && (
              <Badge className="bg-accent/10 text-accent border-accent/20 font-accent">
                <Zap className="w-3 h-3 mr-1" aria-hidden="true" />
                AI Enhanced
              </Badge>
            )}
            {dataset.tags && dataset.tags.length > 0 && (
              <div className="flex space-x-1">
                {dataset.tags.slice(0, 2).map((tag, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-muted/50 text-muted-foreground rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
                {dataset.tags.length > 2 && (
                  <span className="px-2 py-1 bg-muted/50 text-muted-foreground rounded-md">
                    +{dataset.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="flex items-center space-x-8 text-center">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-accent fill-current" aria-hidden="true" />
            <span className="text-sm font-medium text-foreground">
              {parseFloat(dataset.rating || '0').toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">
              ({dataset.reviewCount})
            </span>
          </div>
          
          <div className="flex items-center space-x-1">
            <TrendingUp className="w-4 h-4 text-secondary" aria-hidden="true" />
            <span className="text-sm font-medium text-foreground">
              {dataset.downloads.toLocaleString()}
            </span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Shield className="w-4 h-4 text-primary" aria-hidden="true" />
            <span className="text-xs font-medium text-foreground">
              {dataset.isActive ? 'Live' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Price and Actions */}
        <div className="flex items-center space-x-4">
          <div className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-bold rounded-xl shadow-lg min-w-[100px] text-center">
            {dataset.price} ZAI
          </div>
          
          <div className="flex gap-2">
            <button 
              className="btn-primary px-4 py-2 text-sm group"
              data-testid={`button-buy-list-${dataset.id}`}
              aria-label={`Purchase ${dataset.title}`}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Acquire
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              className="btn-ghost px-3 py-2 border border-accent/30 text-accent hover:border-accent"
              data-testid={`button-view-list-${dataset.id}`}
              aria-label={`View details for ${dataset.title}`}
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// World-class Dataset Card Component
function DatasetCard({ dataset }: { dataset: Dataset }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="card-interactive h-full group"
      data-testid={`dataset-card-${dataset.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-xl font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-glow-primary transition-colors duration-300">
              {dataset.title}
            </h3>
            <div className="flex items-center space-x-2 mb-2">
              <Badge className="bg-primary/10 text-primary border-primary/20 font-accent text-xs">
                {dataset.category}
              </Badge>
              {dataset.aiSummary && (
                <Badge className="bg-accent/10 text-accent border-accent/20 font-accent text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  AI Enhanced
                </Badge>
              )}
            </div>
          </div>
          <div className="ml-4 flex flex-col items-end space-y-2">
            <div className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-bold rounded-xl shadow-lg">
              {dataset.price} ZAI
            </div>
            {dataset.isActive && (
              <div className="flex items-center space-x-1 text-xs text-accent">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                <span className="font-medium">Live</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Description */}
        <p className="text-sm text-muted-foreground mb-6 line-clamp-3 leading-relaxed">
          {dataset.description}
        </p>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Star className="w-4 h-4 text-accent fill-current" />
              <span className="text-sm font-medium text-foreground">
                {parseFloat(dataset.rating || '0').toFixed(1)}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              ({dataset.reviewCount} reviews)
            </span>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <TrendingUp className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium text-foreground">
                {dataset.downloads.toLocaleString()}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">downloads</span>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Verified
              </span>
            </div>
            <span className="text-xs text-muted-foreground">secure</span>
          </div>
        </div>
        
        {/* Tags */}
        {dataset.tags && dataset.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-6">
            {dataset.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 text-xs bg-muted/50 text-muted-foreground rounded-md"
              >
                #{tag}
              </span>
            ))}
            {dataset.tags.length > 3 && (
              <span className="px-2 py-1 text-xs bg-muted/50 text-muted-foreground rounded-md">
                +{dataset.tags.length - 3}
              </span>
            )}
          </div>
        )}
        
        {/* Actions */}
        <div className="flex gap-3">
          <button 
            className="btn-primary flex-1 text-sm group"
            data-testid={`button-buy-${dataset.id}`}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            acquire
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
          <button 
            className="btn-ghost px-4 py-2 border border-accent/30 text-accent hover:border-accent"
            data-testid={`button-view-${dataset.id}`}
            aria-label={`View details for ${dataset.title}`}
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Hover Gradient Effect */}
      {isHovered && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 rounded-xl pointer-events-none"></div>
      )}
    </div>
  );
}

// Enhanced Search and Filter Component
function SearchAndFilters({ 
  filters, 
  onFiltersChange, 
  datasetCount,
  viewMode,
  onViewModeChange 
}: {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  datasetCount: number;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}) {
  const categories = [
    'All Categories',
    'Machine Learning',
    'Computer Vision', 
    'Natural Language Processing',
    'Financial Data',
    'Healthcare',
    'IoT Sensors',
    'Social Media',
    'Scientific Research'
  ];

  return (
    <div className="glass-cyber hover-cyber p-6 mb-8" data-testid="search-filters-panel">
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Search Bar */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder="Search datasets, models, or research data..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="pl-10 h-12 text-base bg-background/50 border-border/50 focus:border-primary"
              data-testid="input-search-datasets"
            />
          </div>
        </div>
        
        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Category Filter */}
          <Select 
            value={filters.category} 
            onValueChange={(value) => onFiltersChange({ ...filters, category: value })}
          >
            <SelectTrigger className="w-full sm:w-48 h-12 bg-background/50 border-border/50">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Sort Filter */}
          <Select 
            value={filters.sortBy} 
            onValueChange={(value: SearchFilters['sortBy']) => onFiltersChange({ ...filters, sortBy: value })}
          >
            <SelectTrigger className="w-full sm:w-48 h-12 bg-background/50 border-border/50">
              <SortAsc className="w-4 h-4 mr-2" aria-hidden="true" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="rating_desc">Highest Rated</SelectItem>
              <SelectItem value="downloads_desc">Most Downloaded</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
          
          {/* View Mode Toggle */}
          <div className="flex bg-background/50 border border-border/50 rounded-lg h-12">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`px-4 py-2 rounded-l-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              data-testid="button-grid-view"
              aria-label="Switch to grid view layout"
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`px-4 py-2 rounded-r-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              data-testid="button-list-view"
              aria-label="Switch to list view layout"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Advanced Filters Section */}
      <div className="mt-6 pt-6 border-t border-border/30">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Price Range Filters */}
          <div className="flex-1">
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground flex items-center space-x-2">
                <span>Price Range (ZAI)</span>
                <Filter className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
              </label>
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Min price"
                    value={filters.minPrice}
                    onChange={(e) => onFiltersChange({ ...filters, minPrice: e.target.value })}
                    className="h-10 bg-background/50 border-border/50 focus:border-primary"
                    data-testid="input-min-price"
                    aria-label="Minimum price filter"
                    min="0"
                    step="0.1"
                  />
                </div>
                <span className="text-muted-foreground px-2">to</span>
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Max price"
                    value={filters.maxPrice}
                    onChange={(e) => onFiltersChange({ ...filters, maxPrice: e.target.value })}
                    className="h-10 bg-background/50 border-border/50 focus:border-primary"
                    data-testid="input-max-price"
                    aria-label="Maximum price filter"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Rating Filter */}
          <div className="flex-1">
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground flex items-center space-x-2">
                <span>Minimum Rating</span>
                <Star className="w-4 h-4 text-accent" aria-hidden="true" />
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => onFiltersChange({ 
                      ...filters, 
                      minRating: filters.minRating === rating ? 0 : rating 
                    })}
                    className={`p-2 rounded-lg transition-all hover:bg-accent/10 ${
                      filters.minRating >= rating 
                        ? 'text-accent' 
                        : 'text-muted-foreground hover:text-accent'
                    }`}
                    data-testid={`button-rating-${rating}`}
                    aria-label={`Filter by minimum ${rating} star rating`}
                  >
                    <Star 
                      className={`w-5 h-5 ${
                        filters.minRating >= rating ? 'fill-current' : ''
                      }`} 
                    />
                  </button>
                ))}
                {filters.minRating > 0 && (
                  <button
                    onClick={() => onFiltersChange({ ...filters, minRating: 0 })}
                    className="ml-2 px-3 py-1 text-xs bg-muted/50 text-muted-foreground rounded-md hover:bg-muted transition-colors"
                    data-testid="button-clear-rating"
                    aria-label="Clear rating filter"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Filter Actions */}
          <div className="flex items-end">
            <button
              onClick={() => onFiltersChange({
                search: '',
                category: 'All Categories',
                minPrice: '',
                maxPrice: '',
                sortBy: 'latest',
                minRating: 0,
              })}
              className="btn-ghost h-10 px-4 text-sm"
              data-testid="button-clear-all-filters"
              aria-label="Clear all filters"
            >
              Clear all filters
            </button>
          </div>
        </div>
      </div>
      
      {/* Results Summary */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span>
            <span className="font-medium text-foreground">{datasetCount}</span> datasets found
          </span>
          {filters.search && (
            <span>
              for "<span className="font-medium text-primary">{filters.search}</span>"
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <Database className="w-4 h-4 text-primary" />
          <span>Live data from 0G network</span>
        </div>
      </div>
    </div>
  );
}

// Platform Overview Hero Component
function PlatformOverviewHero({ onExploreClick }: { onExploreClick: () => void }) {
  return (
    <div className="relative overflow-hidden glass-cyber" data-testid="marketplace-hero">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5"></div>
      <div className="absolute inset-0 bg-cyber-grid opacity-10"></div>
      {/* Ambient glow effects */}
      <div className="absolute top-1/4 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-56 h-56 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="relative container mx-auto px-4 lg:px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Main Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-display font-bold gradient-text-cyber leading-tight">
                  Intelligence
                  <br />
                  <span className="text-accent">Marketplace</span>
                </h1>
                <p className="text-xl lg:text-2xl text-accent/90 font-light leading-relaxed max-w-3xl">
                  Explore, purchase and utilize decentralized datasets and AI models.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center space-x-2 text-sm hover:scale-105 transition-transform duration-300" data-testid="feature-blockchain">
                  <Shield className="w-5 h-5 text-primary hover:scale-110 transition-transform" />
                  <span className="text-foreground font-medium">Blockchain Secured</span>
                </div>
                <div className="flex items-center space-x-2 text-sm hover:scale-105 transition-transform duration-300" data-testid="feature-ai">
                  <Zap className="w-5 h-5 text-accent hover:scale-110 transition-transform" />
                  <span className="text-foreground font-medium">AI Enhanced</span>
                </div>
                <div className="flex items-center space-x-2 text-sm hover:scale-105 transition-transform duration-300" data-testid="feature-network">
                  <Database className="w-5 h-5 text-secondary hover:scale-110 transition-transform" />
                  <span className="text-foreground font-medium">0G Network</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild variant="ghost" className="hover-cyber text-lg px-8 py-4 border border-accent/30 hover:border-accent" data-testid="button-learn-more">
                <Link href="/how-it-works">
                  <Eye className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Platform Stats */}
          <div className="space-y-8">
            <div className="glass-cyber hover-cyber p-8 space-y-6" data-testid="platform-metrics">
              <h3 className="text-2xl font-display font-semibold gradient-text-cyber mb-6">
                Platform Metrics
              </h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text-cyber mb-2">1,247</div>
                  <div className="text-sm text-muted-foreground">Datasets Available</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text-cyber mb-2">23.4K</div>
                  <div className="text-sm text-muted-foreground">Total Downloads</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text-cyber mb-2">567</div>
                  <div className="text-sm text-muted-foreground">Active Providers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text-cyber mb-2">$2.3M</div>
                  <div className="text-sm text-muted-foreground">Volume Traded</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-foreground">Key Features</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">Blockchain-verified dataset authenticity</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Zap className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-muted-foreground">AI-powered dataset summarization</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Award className="w-5 h-5 text-secondary flex-shrink-0" />
                  <span className="text-muted-foreground">Quality ratings and reviews</span>
                </div>
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">Real-time market pricing</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default function Marketplace() {
  const { address } = useAccount();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    search: '',
    category: 'All Categories',
    minPrice: '',
    maxPrice: '',
    sortBy: 'latest',
    minRating: 0,
  });

  // Debounced search to prevent excessive API calls
  const [debouncedSearch, setDebouncedSearch] = useState(searchFilters.search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchFilters.search);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchFilters.search]);

  // Create debounced filters for API calls (search is debounced, others are immediate)
  const debouncedFilters = useMemo(() => ({
    ...searchFilters,
    search: debouncedSearch,
  }), [searchFilters, debouncedSearch]);

  // Fetch datasets with comprehensive error handling
  const { 
    data: datasets = [], 
    isLoading: isLoadingDatasets,
    error,
    isError,
    refetch,
    isFetching
  } = useQuery<Dataset[]>({
    queryKey: ['/api/datasets', debouncedFilters],
    queryFn: async () => {
      // Convert filters to URL search parameters
      const params = new URLSearchParams();
      
      if (debouncedFilters.search) {
        params.append('search', debouncedFilters.search);
      }
      if (debouncedFilters.category && debouncedFilters.category !== 'All Categories') {
        params.append('category', debouncedFilters.category);
      }
      if (debouncedFilters.minPrice) {
        params.append('minPrice', debouncedFilters.minPrice);
      }
      if (debouncedFilters.maxPrice) {
        params.append('maxPrice', debouncedFilters.maxPrice);
      }
      if (debouncedFilters.sortBy && debouncedFilters.sortBy !== 'latest') {
        params.append('sortBy', debouncedFilters.sortBy);
      }
      if (debouncedFilters.minRating > 0) {
        params.append('minRating', debouncedFilters.minRating.toString());
      }
      
      const url = `/api/datasets${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url, { credentials: "include" });
      
      if (!response.ok) {
        const text = (await response.text()) || response.statusText;
        throw new Error(`${response.status}: ${text}`);
      }
      
      return await response.json();
    },
    refetchInterval: 30000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Filter and sort datasets
  const filteredDatasets = useMemo(() => {
    let filtered = [...datasets];
    
    // Apply filters
    if (searchFilters.search) {
      const searchTerm = searchFilters.search.toLowerCase();
      filtered = filtered.filter(dataset => 
        dataset.title.toLowerCase().includes(searchTerm) ||
        dataset.description.toLowerCase().includes(searchTerm) ||
        dataset.category.toLowerCase().includes(searchTerm) ||
        (dataset.tags && dataset.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
      );
    }
    
    if (searchFilters.category !== 'All Categories') {
      filtered = filtered.filter(dataset => dataset.category === searchFilters.category);
    }
    
    if (searchFilters.minRating > 0) {
      filtered = filtered.filter(dataset => 
        parseFloat(dataset.rating || '0') >= searchFilters.minRating
      );
    }
    
    // Apply price range filters
    if (searchFilters.minPrice) {
      const minPrice = parseFloat(searchFilters.minPrice);
      if (!isNaN(minPrice)) {
        filtered = filtered.filter(dataset => parseFloat(dataset.price) >= minPrice);
      }
    }
    
    if (searchFilters.maxPrice) {
      const maxPrice = parseFloat(searchFilters.maxPrice);
      if (!isNaN(maxPrice)) {
        filtered = filtered.filter(dataset => parseFloat(dataset.price) <= maxPrice);
      }
    }
    
    // Apply sorting
    switch (searchFilters.sortBy) {
      case 'rating_desc':
        filtered.sort((a, b) => parseFloat(b.rating || '0') - parseFloat(a.rating || '0'));
        break;
      case 'downloads_desc':
        filtered.sort((a, b) => b.downloads - a.downloads);
        break;
      case 'price_asc':
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price_desc':
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      default: // latest
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }
    
    return filtered;
  }, [datasets, searchFilters]);

  // Handle scroll to datasets section
  const scrollToDatasets = useCallback(() => {
    const element = document.getElementById('datasets-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <div className="min-h-screen bg-background pt-20">
      
      {/* Platform Overview Hero Section */}
      <PlatformOverviewHero onExploreClick={scrollToDatasets} />
      
      <div className="container mx-auto px-4 lg:px-6 pb-12">
        
        {/* Datasets Section */}
        <div id="datasets-section" className="py-8">

          {/* === SEARCH AND FILTERS === */}
        <SearchAndFilters
          filters={searchFilters}
          onFiltersChange={setSearchFilters}
          datasetCount={filteredDatasets.length}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* === DATASETS DISPLAY === */}
        {viewMode === 'list' ? (
          <div className="space-y-3">
            {isError ? (
              <div className="card-elevated text-center py-16 px-8 max-w-lg mx-auto">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-destructive/10 rounded-full blur-2xl"></div>
                  <div className="w-20 h-20 bg-destructive/20 rounded-full flex items-center justify-center mx-auto relative z-10">
                    <Database className="w-10 h-10 text-destructive" aria-hidden="true" />
                  </div>
                </div>
                
                <h3 className="font-display text-2xl font-bold text-foreground mb-4">
                  Unable to load datasets
                </h3>
                
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  {error?.message?.includes('fetch') || error?.message?.includes('network') 
                    ? 'Network connection issue. Please check your internet connection and try again.'
                    : error?.message?.includes('timeout')
                    ? 'Request timed out. The 0G network might be experiencing high traffic.'
                    : 'There was an issue loading the marketplace data. Our team has been notified.'
                  }
                </p>
                
                <div className="space-y-4">
                  <button 
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="btn-primary group disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="button-retry-datasets"
                    aria-label="Retry loading datasets"
                  >
                    {isFetching ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin mr-2"></div>
                        Retrying...
                      </>
                    ) : (
                      <>
                        <Database className="w-4 h-4 mr-2" />
                        Try again
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Error details: {error?.message || 'Unknown error'}</p>
                    <p>If this persists, contact support with error code: {Date.now()}</p>
                  </div>
                </div>
              </div>
            ) : isLoadingDatasets ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card-interactive p-4 animate-pulse">
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-muted/50 rounded w-3/4"></div>
                      <div className="h-4 bg-muted/30 rounded w-full"></div>
                      <div className="h-4 bg-muted/30 rounded w-2/3"></div>
                    </div>
                    <div className="flex space-x-4">
                      <div className="h-4 w-16 bg-muted/50 rounded"></div>
                      <div className="h-4 w-16 bg-muted/50 rounded"></div>
                      <div className="h-10 w-24 bg-muted/50 rounded"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : filteredDatasets.length > 0 ? (
              filteredDatasets.map((dataset) => (
                <DatasetListItem key={dataset.id} dataset={dataset} />
              ))
            ) : (
              <div className="card-elevated text-center py-16 px-8 max-w-md mx-auto">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-muted/20 rounded-full blur-2xl"></div>
                  <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto relative z-10">
                    {searchFilters.search ? (
                      <Search className="w-10 h-10 text-muted-foreground" aria-hidden="true" />
                    ) : (
                      <Database className="w-10 h-10 text-muted-foreground" aria-hidden="true" />
                    )}
                  </div>
                </div>
                
                <h3 className="font-display text-2xl font-bold text-foreground mb-4">
                  {searchFilters.search ? 'No matches found' : 'No datasets yet'}
                </h3>
                
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  {searchFilters.search ? 
                    `No datasets match your search criteria. Try adjusting your filters or search terms.` :
                    `Be the first to upload a dataset and earn from every download!`
                  }
                </p>
                
                <div className="space-y-4">
                  {searchFilters.search ? (
                    <button
                      onClick={() => setSearchFilters(prev => ({ ...prev, search: '', category: 'All Categories' }))}
                      className="btn-secondary"
                      data-testid="button-clear-search"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Clear Filters
                    </button>
                  ) : address ? (
                    <Link 
                      href="/upload"
                      className="btn-primary" 
                      data-testid="button-upload-first"
                      aria-label="Upload the first dataset to get started"
                    >
                      <Upload className="w-5 h-5 mr-2" aria-hidden="true" />
                      Upload First Dataset
                    </Link>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Connect your wallet to start contributing
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={`grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`}>
            {isError ? (
              <div className="col-span-full">
                <div className="card-elevated text-center py-16 px-8 max-w-lg mx-auto">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-destructive/10 rounded-full blur-2xl"></div>
                    <div className="w-20 h-20 bg-destructive/20 rounded-full flex items-center justify-center mx-auto relative z-10">
                      <Database className="w-10 h-10 text-destructive" aria-hidden="true" />
                    </div>
                  </div>
                  
                  <h3 className="font-display text-2xl font-bold text-foreground mb-4">
                    Unable to load datasets
                  </h3>
                  
                  <p className="text-muted-foreground mb-8 leading-relaxed">
                    {error?.message?.includes('fetch') || error?.message?.includes('network') 
                      ? 'Network connection issue. Please check your internet connection and try again.'
                      : error?.message?.includes('timeout')
                      ? 'Request timed out. The 0G network might be experiencing high traffic.'
                      : 'There was an issue loading the marketplace data. Our team has been notified.'
                    }
                  </p>
                  
                  <div className="space-y-4">
                    <button 
                      onClick={() => refetch()}
                      disabled={isFetching}
                      className="btn-primary group disabled:opacity-50 disabled:cursor-not-allowed"
                      data-testid="button-retry-datasets"
                      aria-label="Retry loading datasets"
                    >
                      {isFetching ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin mr-2"></div>
                          Retrying...
                        </>
                      ) : (
                        <>
                          <Database className="w-4 h-4 mr-2" />
                          Try again
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                    
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Error details: {error?.message || 'Unknown error'}</p>
                      <p>If this persists, contact support with error code: {Date.now()}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : isLoadingDatasets ? (
              Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))
            ) : filteredDatasets.length > 0 ? (
              filteredDatasets.map((dataset) => (
                <DatasetCard key={dataset.id} dataset={dataset} />
              ))
            ) : (
              <div className="col-span-full">
                <div className="card-elevated text-center py-16 px-8 max-w-md mx-auto">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-muted/20 rounded-full blur-2xl"></div>
                    <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto relative z-10">
                      {searchFilters.search ? (
                        <Search className="w-10 h-10 text-muted-foreground" aria-hidden="true" />
                      ) : (
                        <Database className="w-10 h-10 text-muted-foreground" aria-hidden="true" />
                      )}
                    </div>
                  </div>
                  
                  <h3 className="font-display text-2xl font-bold text-foreground mb-4">
                    {searchFilters.search ? 'No matches found' : 'No datasets yet'}
                  </h3>
                  
                  <p className="text-muted-foreground mb-8 leading-relaxed">
                    {searchFilters.search ? 
                      `No datasets match your search criteria. Try adjusting your filters or search terms.` :
                      `Be the first to upload a dataset and earn from every download!`
                    }
                  </p>
                  
                  <div className="space-y-4">
                    {searchFilters.search ? (
                      <button
                        onClick={() => setSearchFilters(prev => ({ ...prev, search: '', category: 'All Categories' }))}
                        className="btn-secondary"
                        data-testid="button-clear-search-grid"
                      >
                        <Filter className="w-4 h-4 mr-2" />
                        Clear Filters
                      </button>
                    ) : address ? (
                      <Link 
                        href="/upload"
                        className="btn-primary" 
                        data-testid="button-upload-first-grid"
                        aria-label="Upload the first dataset to get started"
                      >
                        <Upload className="w-5 h-5 mr-2" aria-hidden="true" />
                        Upload First Dataset
                      </Link>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Connect your wallet to start contributing
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Load More Section */}
        {filteredDatasets.length > 0 && (
          <div className="text-center mt-12">
            <div className="inline-flex items-center space-x-2 px-6 py-3 rounded-full glass-cyber hover-cyber" data-testid="realtime-status">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-sm font-accent text-muted-foreground">
                Real-time data from the 0G network
              </span>
            </div>
          </div>
        )}
        
        </div> {/* Close datasets-section */}
      </div>
    </div>
  );
}