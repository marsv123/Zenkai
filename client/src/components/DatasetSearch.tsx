import { useState, useEffect } from 'react';
import { Search, Filter, SortAsc, SortDesc, X, Tag, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

interface SearchFilters {
  search: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  sortBy: 'latest' | 'price_asc' | 'price_desc' | 'rating_desc' | 'downloads_desc';
  minRating: number;
}

interface DatasetSearchProps {
  onFiltersChange: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
  datasetCount?: number;
}

const categories = [
  'All Categories',
  'Machine Learning',
  'Natural Language Processing',
  'Computer Vision',
  'Audio Processing',
  'Financial Data',
  'Bioinformatics',
  'IoT & Sensor Data',
  'Social Media',
  'Healthcare'
];

const sortOptions = [
  { value: 'latest', label: 'Latest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating_desc', label: 'Highest Rated' },
  { value: 'downloads_desc', label: 'Most Downloaded' }
];

export default function DatasetSearch({ onFiltersChange, initialFilters, datasetCount = 0 }: DatasetSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    category: 'All Categories',
    minPrice: '',
    maxPrice: '',
    sortBy: 'latest',
    minRating: 0,
    ...initialFilters
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null);

  // Debounced search effect
  useEffect(() => {
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }

    const timeout = setTimeout(() => {
      onFiltersChange(filters);
    }, 300); // 300ms debounce

    setSearchDebounce(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [filters.search]);

  // Immediate update for non-search filters
  useEffect(() => {
    if (searchDebounce) return; // Don't trigger if search is changing
    onFiltersChange(filters);
  }, [filters.category, filters.minPrice, filters.maxPrice, filters.sortBy, filters.minRating]);

  const updateFilter = (key: keyof SearchFilters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      search: '',
      category: 'All Categories',
      minPrice: '',
      maxPrice: '',
      sortBy: 'latest',
      minRating: 0
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = 
    filters.search !== '' || 
    filters.category !== 'All Categories' || 
    filters.minPrice !== '' || 
    filters.maxPrice !== '' || 
    filters.minRating > 0 ||
    filters.sortBy !== 'latest';

  const renderStars = (rating: number, interactive = false) => {
    return Array.from({ length: 5 }, (_, i) => {
      const starRating = i + 1;
      const isFilled = starRating <= rating;
      
      return (
        <button
          key={i}
          type="button"
          className={`w-5 h-5 ${
            isFilled 
              ? 'text-yellow-400 fill-yellow-400' 
              : 'text-gray-300'
          } ${interactive ? 'cursor-pointer hover:text-yellow-400' : 'cursor-default'}`}
          onClick={interactive ? () => updateFilter('minRating', starRating) : undefined}
          disabled={!interactive}
        >
          ★
        </button>
      );
    });
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        {/* Search Bar */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="Search datasets by title or description..."
              className="pl-10"
              data-testid="input-search-datasets"
            />
            {filters.search && (
              <button
                onClick={() => updateFilter('search', '')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                data-testid="button-clear-search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <Button
            onClick={() => setShowAdvanced(!showAdvanced)}
            variant={showAdvanced ? "default" : "outline"}
            className="flex items-center space-x-2"
            data-testid="button-toggle-filters"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <div className="w-2 h-2 bg-accent rounded-full" />
            )}
          </Button>
        </div>

        {/* Quick Filters */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
              <SelectTrigger className="w-48" data-testid="select-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value as SearchFilters['sortBy'])}>
              <SelectTrigger className="w-48" data-testid="select-sort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>{datasetCount} dataset{datasetCount !== 1 ? 's' : ''} found</span>
            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-primary hover:underline"
                data-testid="button-clear-all-filters"
              >
                <X className="w-3 h-3 mr-1" />
                Clear all
              </Button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="border-t border-border pt-4 space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  Price Range (IMT)
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => updateFilter('minPrice', e.target.value)}
                    placeholder="Min"
                    min="0"
                    step="0.01"
                    className="flex-1"
                    data-testid="input-min-price"
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => updateFilter('maxPrice', e.target.value)}
                    placeholder="Max"
                    min="0"
                    step="0.01"
                    className="flex-1"
                    data-testid="input-max-price"
                  />
                </div>
              </div>

              {/* Minimum Rating */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Minimum Rating
                </label>
                <div className="flex items-center space-x-2">
                  {renderStars(filters.minRating, true)}
                  <span className="text-sm text-muted-foreground">
                    {filters.minRating > 0 ? `${filters.minRating}+ stars` : 'Any rating'}
                  </span>
                  {filters.minRating > 0 && (
                    <Button
                      onClick={() => updateFilter('minRating', 0)}
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-xs text-primary hover:underline"
                      data-testid="button-clear-rating"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* Additional Filters Placeholder */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Quick Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Popular', 'New', 'Free', 'Premium'].map(tag => (
                    <Button
                      key={tag}
                      variant="secondary"
                      size="sm"
                      className="h-auto px-3 py-1 text-xs"
                      onClick={() => {
                        // Handle tag filtering logic here
                        if (tag === 'Free') updateFilter('maxPrice', '0');
                        if (tag === 'Popular') updateFilter('sortBy', 'downloads_desc');
                      }}
                      data-testid={`button-tag-${tag.toLowerCase()}`}
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <div className="pt-3 border-t border-border">
                <div className="text-sm text-muted-foreground mb-2">Active filters:</div>
                <div className="flex flex-wrap gap-2">
                  {filters.search && (
                    <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs flex items-center space-x-1">
                      <span>Search: "{filters.search}"</span>
                      <button onClick={() => updateFilter('search', '')}>
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {filters.category !== 'All Categories' && (
                    <div className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs flex items-center space-x-1">
                      <span>Category: {filters.category}</span>
                      <button onClick={() => updateFilter('category', 'All Categories')}>
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {(filters.minPrice || filters.maxPrice) && (
                    <div className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs flex items-center space-x-1">
                      <span>
                        Price: {filters.minPrice || '0'} - {filters.maxPrice || '∞'} IMT
                      </span>
                      <button onClick={() => {
                        updateFilter('minPrice', '');
                        updateFilter('maxPrice', '');
                      }}>
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {filters.minRating > 0 && (
                    <div className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-xs flex items-center space-x-1">
                      <span>{filters.minRating}+ stars</span>
                      <button onClick={() => updateFilter('minRating', 0)}>
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}