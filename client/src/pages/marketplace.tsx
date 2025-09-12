import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart, Eye, Upload } from 'lucide-react';
import DatasetSearch from '@/components/DatasetSearch';
import { Link } from 'wouter';

interface Dataset {
  id: string;
  contractId?: number;
  ownerId: string;
  title: string;
  description: string;
  category: string;
  tags?: string[];
  ipfsHash: string;
  metadataUrl?: string;
  price: string;
  isActive: boolean;
  downloads: number;
  rating?: string;
  reviewCount: number;
  aiSummary?: string;
  createdAt: Date;
  updatedAt: Date;
}

function DatasetCard({ dataset }: { dataset: Dataset }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {dataset.title}
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              {dataset.category}
            </CardDescription>
          </div>
          <Badge variant="secondary">{dataset.price} IMT</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {dataset.description}
        </p>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm">{parseFloat(dataset.rating || '0').toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({dataset.reviewCount})</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {dataset.downloads} downloads
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="flex-1" data-testid={`button-buy-${dataset.id}`}>
            <ShoppingCart className="w-4 h-4 mr-1" />
            Buy
          </Button>
          <Button size="sm" variant="outline" data-testid={`button-view-${dataset.id}`}>
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Marketplace() {
  const { address } = useAccount();
  const [searchFilters, setSearchFilters] = useState({
    search: '',
    category: 'All Categories',
    minPrice: '',
    maxPrice: '',
    sortBy: 'latest' as const,
    minRating: 0,
  });

  // Fetch datasets from database API
  const { data: datasets = [], isLoading: isLoadingDatasets } = useQuery({
    queryKey: ['/api/datasets', searchFilters],
    refetchInterval: 30000,
  });

  const handleFiltersChange = (filters: typeof searchFilters) => {
    setSearchFilters(filters);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Zatori Marketplace</h1>
            <p className="text-xl text-muted-foreground">
              Decentralized intelligence marketplace on 0G network
            </p>
          </div>
          
          {address && (
            <Link href="/upload">
              <Button className="flex items-center space-x-2" data-testid="button-upload-dataset">
                <Upload className="w-4 h-4" />
                <span>Upload Dataset</span>
              </Button>
            </Link>
          )}
        </div>

        {/* Search and Filters */}
        <DatasetSearch 
          onFiltersChange={handleFiltersChange} 
          initialFilters={searchFilters}
          datasetCount={datasets.length}
        />

        {/* Datasets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoadingDatasets ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="h-full">
                <CardHeader>
                  <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-3/4"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="animate-pulse space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-5/6"></div>
                    <div className="h-8 bg-muted rounded mt-4"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : datasets.length > 0 ? (
            datasets.map((dataset: Dataset) => (
              <DatasetCard key={dataset.id} dataset={dataset} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No datasets found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchFilters.search ? 
                    `No datasets match your search criteria. Try adjusting your filters.` :
                    `Be the first to upload a dataset to the marketplace!`
                  }
                </p>
                {address && !searchFilters.search && (
                  <Link href="/upload">
                    <Button>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload First Dataset
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}