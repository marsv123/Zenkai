import { useAccount } from 'wagmi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Upload, ShoppingCart, TrendingUp, Wallet, Star, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Dataset {
  id: string;
  title: string;
  description: string;
  category: string;
  price: string;
  rating?: string;
  reviewCount: number;
  downloads: number;
  createdAt: Date;
  isActive: boolean;
}

interface Transaction {
  id: string;
  txHash: string;
  datasetId: string;
  amount: string;
  status: string;
  createdAt: Date;
}

interface UserStats {
  datasetsOwned: number;
  totalSales: number;
  totalPurchases: number;
}

export default function UserDashboard() {
  const { address } = useAccount();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's datasets
  const { data: userDatasets = [], isLoading: datasetsLoading } = useQuery({
    queryKey: ['/api/datasets/owner/wallet', address],
    enabled: !!address,
    refetchInterval: 30000,
  });

  // Fetch user's transactions
  const { data: userTransactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/transactions/user/wallet', address],
    enabled: !!address,
    refetchInterval: 30000,
  });

  // Fetch user stats
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/users', address, 'stats'],
    enabled: !!address,
    refetchInterval: 60000,
  });

  // Create or get user profile
  const createUserMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          username: `User-${address?.slice(-6)}`,
        }),
      });
      if (!response.ok) throw new Error('Failed to create user profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Profile Created",
        description: "Your user profile has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user profile",
        variant: "destructive",
      });
    },
  });

  if (!address) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <Wallet className="mx-auto mb-4 text-4xl text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
        <p className="text-muted-foreground">
          Connect your wallet to view your dashboard and manage your datasets.
        </p>
      </div>
    );
  }

  const purchasedDatasets = userTransactions.filter((tx: Transaction) => 
    tx.status === 'confirmed'
  );

  const totalEarnings = userTransactions
    .filter((tx: Transaction) => tx.status === 'confirmed')
    .reduce((sum: number, tx: Transaction) => sum + parseFloat(tx.amount || '0'), 0);

  const totalSpent = purchasedDatasets
    .reduce((sum: number, tx: Transaction) => sum + parseFloat(tx.amount || '0'), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center">
            <User className="text-primary mr-3" />
            Your Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage your datasets and track your marketplace activity
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Connected Wallet</div>
          <div className="font-mono text-sm bg-muted px-3 py-1 rounded">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {datasetsLoading ? '...' : userDatasets.length}
                </div>
                <div className="text-sm text-muted-foreground">Published</div>
              </div>
              <Upload className="text-primary/20 w-8 h-8" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-secondary">
                  {transactionsLoading ? '...' : purchasedDatasets.length}
                </div>
                <div className="text-sm text-muted-foreground">Purchased</div>
              </div>
              <ShoppingCart className="text-secondary/20 w-8 h-8" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-500">
                  {transactionsLoading ? '...' : totalEarnings.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">IMT Earned</div>
              </div>
              <TrendingUp className="text-green-500/20 w-8 h-8" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-500">
                  {transactionsLoading ? '...' : totalSpent.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">IMT Spent</div>
              </div>
              <Wallet className="text-orange-500/20 w-8 h-8" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Published Datasets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="text-primary mr-2" />
              Your Published Datasets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {datasetsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : userDatasets.length > 0 ? (
                userDatasets.map((dataset: Dataset) => (
                  <div key={dataset.id} className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{dataset.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {dataset.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Star className="w-3 h-3 mr-1" />
                            {dataset.rating || '0'} ({dataset.reviewCount})
                          </span>
                          <span className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {dataset.downloads}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            dataset.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {dataset.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm text-primary">
                          {dataset.price} IMT
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {dataset.category}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Upload className="mx-auto mb-2 w-8 h-8 opacity-50" />
                  <p>No published datasets yet</p>
                  <p className="text-xs">Upload your first dataset to get started!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="text-secondary mr-2" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {transactionsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : userTransactions.length > 0 ? (
                userTransactions.slice(0, 10).map((transaction: Transaction) => (
                  <div key={transaction.id} className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {transaction.txHash?.slice(0, 8)}...{transaction.txHash?.slice(-6)}
                          </code>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            transaction.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {transaction.status}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm">
                          {transaction.amount} IMT
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="mx-auto mb-2 w-8 h-8 opacity-50" />
                  <p>No transactions yet</p>
                  <p className="text-xs">Your marketplace activity will appear here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}