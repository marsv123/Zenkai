import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { 
  Wallet, 
  User, 
  TrendingUp, 
  Upload, 
  ShoppingCart, 
  Star, 
  Eye, 
  Coins, 
  Award,
  Activity,
  BarChart3,
  Target,
  Clock,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Trophy,
  Crown,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Link } from 'wouter';
import content from '@/lib/config/content.json';

interface Dataset {
  id: string;
  title: string;
  description: string;
  category: string;
  price: string;
  rating: number;
  reviewCount: number;
  downloads: number;
  isActive: boolean;
  createdAt: string;
}

interface Transaction {
  id: string;
  txHash: string;
  amount: string;
  status: string;
  createdAt: string;
  dataset?: Dataset;
}

interface UserStats {
  totalDatasets: number;
  totalEarnings: number;
  totalSpent: number;
  averageRating: number;
  totalDownloads: number;
}

export default function Dashboard() {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch user's datasets
  const { data: userDatasets = [], isLoading: datasetsLoading } = useQuery<Dataset[]>({
    queryKey: ['/api/datasets/owner/wallet', address],
    enabled: !!address,
    refetchInterval: 30000,
  });

  // Fetch user's transactions
  const { data: userTransactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions/user/wallet', address],
    enabled: !!address,
    refetchInterval: 30000,
  });

  // Fetch user stats
  const { data: userStats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ['/api/users', address, 'stats'],
    enabled: !!address,
    refetchInterval: 60000,
  });

  if (!address) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto p-12 text-center">
            <div className="w-24 h-24 gradient-primary rounded-full flex items-center justify-center mx-auto mb-8">
              <Wallet className="w-12 h-12 text-primary-foreground" />
            </div>
            <h2 className="text-4xl font-display font-bold gradient-text-cyber mb-6">
              Connect Your Wallet
            </h2>
            <p className="text-xl text-accent/90 leading-relaxed max-w-2xl mx-auto mb-8">
              Connect your wallet to access your personal dashboard and manage your AI assets in the decentralized intelligence economy.
            </p>
            <Button asChild className="gradient-primary hover-cyber font-display font-semibold text-lg px-8 py-4" data-testid="button-connect-wallet">
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate derived data
  const purchasedDatasets = userTransactions.filter((tx: Transaction) => 
    tx.status === 'confirmed'
  );

  const totalEarnings = userTransactions
    .filter((tx: Transaction) => tx.status === 'confirmed')
    .reduce((sum: number, tx: Transaction) => sum + parseFloat(tx.amount || '0'), 0);

  const totalSpent = purchasedDatasets
    .reduce((sum: number, tx: Transaction) => sum + parseFloat(tx.amount || '0'), 0);

  const reputationScore = Math.min(100, Math.max(0, 
    (userDatasets.length * 10) + 
    (totalEarnings * 2) + 
    (userDatasets.reduce((sum: number, dataset: Dataset) => sum + (dataset.rating * dataset.reviewCount), 0))
  ));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8" data-testid="dashboard-header">
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 gradient-text-cyber flex items-center">
                <User className="w-10 h-10 md:w-12 md:h-12 mr-4 text-primary hover:scale-110 transition-transform duration-300" data-testid="icon-dashboard" />
                Your Dashboard
              </h1>
              <p className="text-xl md:text-2xl text-accent/90 leading-relaxed">
                Manage your AI assets and track your marketplace activity
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-2">Connected Wallet</div>
              <div className="font-mono text-sm glass-panel px-4 py-2 rounded-xl border-primary/20" data-testid="text-wallet-address">
                {address?.slice(0, 8)}...{address?.slice(-6)}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" data-testid="dashboard-tabs">
            <TabsList className="grid w-full lg:w-fit grid-cols-2 lg:grid-cols-5 mb-8 glass-cyber">
              <TabsTrigger value="overview" className="flex items-center" data-testid="tab-overview">
                <BarChart3 className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center" data-testid="tab-activity">
                <Activity className="w-4 h-4 mr-2" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="earnings" className="flex items-center" data-testid="tab-earnings">
                <TrendingUp className="w-4 h-4 mr-2" />
                Earnings
              </TabsTrigger>
              <TabsTrigger value="assets" className="flex items-center" data-testid="tab-assets">
                <Shield className="w-4 h-4 mr-2" />
                Assets
              </TabsTrigger>
              <TabsTrigger value="reputation" className="flex items-center" data-testid="tab-reputation">
                <Trophy className="w-4 h-4 mr-2" />
                Reputation
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6" data-testid="quick-stats">
                <Card className="glass-cyber hover-cyber">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold gradient-text-cyber">
                          {datasetsLoading ? '...' : userDatasets.length}
                        </div>
                        <div className="text-sm text-muted-foreground">AI Models</div>
                      </div>
                      <Upload className="w-8 h-8 text-primary/30" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-cyber hover-cyber">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold gradient-text-cyber">
                          {transactionsLoading ? '...' : purchasedDatasets.length}
                        </div>
                        <div className="text-sm text-muted-foreground">Purchases</div>
                      </div>
                      <ShoppingCart className="w-8 h-8 text-secondary/30" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-cyber hover-cyber">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold text-green-400">
                          {transactionsLoading ? '...' : totalEarnings.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">ZAI Earned</div>
                      </div>
                      <ArrowUpRight className="w-8 h-8 text-green-400/30" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-cyber hover-cyber">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold text-orange-400">
                          {transactionsLoading ? '...' : totalSpent.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">ZAI Spent</div>
                      </div>
                      <ArrowDownRight className="w-8 h-8 text-orange-400/30" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity & Assets Preview */}
              <div className="grid lg:grid-cols-2 gap-8">
                <Card className="glass-cyber">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-primary" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {userTransactions.slice(0, 5).map((transaction: Transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 glass-panel rounded-xl" data-testid={`activity-${transaction.id}`}>
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${
                              transaction.status === 'confirmed' ? 'bg-green-400' :
                              transaction.status === 'pending' ? 'bg-yellow-400' : 'bg-red-400'
                            }`}></div>
                            <div>
                              <div className="text-sm font-medium">Transaction</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(transaction.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{transaction.amount} ZAI</div>
                            <Badge variant={
                              transaction.status === 'confirmed' ? 'default' : 
                              transaction.status === 'pending' ? 'secondary' : 'destructive'
                            }>
                              {transaction.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {userTransactions.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Activity className="mx-auto mb-2 w-8 h-8 opacity-50" />
                          <p>No activity yet</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-cyber">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-secondary" />
                      Your AI Assets
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {userDatasets.slice(0, 5).map((dataset: Dataset) => (
                        <div key={dataset.id} className="flex items-center justify-between p-3 glass-panel rounded-xl" data-testid={`asset-${dataset.id}`}>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                              <Star className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <div>
                              <div className="text-sm font-medium">{dataset.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {dataset.downloads} downloads
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-primary">{dataset.price} ZAI</div>
                            <div className="text-xs text-muted-foreground">{dataset.category}</div>
                          </div>
                        </div>
                      ))}
                      {userDatasets.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Upload className="mx-auto mb-2 w-8 h-8 opacity-50" />
                          <p>No assets yet</p>
                          <Button asChild size="sm" className="mt-2 gradient-primary" data-testid="button-upload-first">
                            <Link href="/upload">Upload Your First Dataset</Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6">
              <Card className="glass-cyber">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-primary" />
                    Transaction History
                  </CardTitle>
                  <CardDescription>
                    Complete record of your marketplace transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {transactionsLoading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-16 glass-panel rounded-xl"></div>
                          </div>
                        ))}
                      </div>
                    ) : userTransactions.length > 0 ? (
                      userTransactions.map((transaction: Transaction) => (
                        <div key={transaction.id} className="p-4 glass-panel rounded-xl hover:bg-primary/5 transition-colors" data-testid={`transaction-${transaction.id}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`w-3 h-3 rounded-full ${
                                transaction.status === 'confirmed' ? 'bg-green-400' :
                                transaction.status === 'pending' ? 'bg-yellow-400' : 'bg-red-400'
                              }`}></div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <code className="text-xs glass-panel px-2 py-1 rounded">
                                    {transaction.txHash?.slice(0, 8)}...{transaction.txHash?.slice(-6)}
                                  </code>
                                  <Badge variant={
                                    transaction.status === 'confirmed' ? 'default' : 
                                    transaction.status === 'pending' ? 'secondary' : 'destructive'
                                  }>
                                    {transaction.status}
                                  </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {new Date(transaction.createdAt).toLocaleDateString()} • 
                                  {new Date(transaction.createdAt).toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-lg">
                                {transaction.amount} ZAI
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Activity className="mx-auto mb-4 w-12 h-12 opacity-50" />
                        <p className="text-lg mb-2">No transactions yet</p>
                        <p className="text-sm">Start by uploading datasets or purchasing from the marketplace</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Earnings Tab */}
            <TabsContent value="earnings" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="glass-cyber">
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="w-8 h-8 mx-auto mb-4 text-green-400" />
                    <div className="text-3xl font-bold gradient-text-cyber mb-2">
                      {totalEarnings.toFixed(2)} ZAI
                    </div>
                    <div className="text-sm text-muted-foreground">Total Earnings</div>
                  </CardContent>
                </Card>

                <Card className="glass-cyber">
                  <CardContent className="p-6 text-center">
                    <ArrowDownRight className="w-8 h-8 mx-auto mb-4 text-orange-400" />
                    <div className="text-3xl font-bold gradient-text-cyber mb-2">
                      {totalSpent.toFixed(2)} ZAI
                    </div>
                    <div className="text-sm text-muted-foreground">Total Spent</div>
                  </CardContent>
                </Card>

                <Card className="glass-cyber">
                  <CardContent className="p-6 text-center">
                    <Coins className="w-8 h-8 mx-auto mb-4 text-primary" />
                    <div className="text-3xl font-bold gradient-text-cyber mb-2">
                      {(totalEarnings - totalSpent).toFixed(2)} ZAI
                    </div>
                    <div className="text-sm text-muted-foreground">Net Balance</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Assets Tab */}
            <TabsContent value="assets" className="space-y-6">
              <Card className="glass-cyber">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="w-5 h-5 mr-2 text-primary" />
                    Your Published AI Models
                  </CardTitle>
                  <CardDescription>
                    Manage and monitor your AI assets in the marketplace
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {datasetsLoading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-24 glass-panel rounded-xl"></div>
                          </div>
                        ))}
                      </div>
                    ) : userDatasets.length > 0 ? (
                      userDatasets.map((dataset: Dataset) => (
                        <div key={dataset.id} className="p-4 glass-panel rounded-xl hover:bg-primary/5 transition-colors" data-testid={`dataset-${dataset.id}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
                                <Star className="w-6 h-6 text-primary-foreground" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-lg mb-2">{dataset.title}</h4>
                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                  {dataset.description}
                                </p>
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                  <span className="flex items-center">
                                    <Star className="w-4 h-4 mr-1 text-primary" />
                                    {dataset.rating || '0'} ({dataset.reviewCount})
                                  </span>
                                  <span className="flex items-center">
                                    <Eye className="w-4 h-4 mr-1 text-secondary" />
                                    {dataset.downloads} downloads
                                  </span>
                                  <Badge variant={dataset.isActive ? 'default' : 'secondary'}>
                                    {dataset.isActive ? 'Active' : 'Inactive'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-xl text-primary mb-1">
                                {dataset.price} ZAI
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {dataset.category}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Upload className="mx-auto mb-4 w-12 h-12 opacity-50" />
                        <p className="text-lg mb-2">No AI models published yet</p>
                        <p className="text-sm mb-4">Upload your first dataset to start earning from your AI models</p>
                        <Button asChild className="gradient-primary" data-testid="button-upload-model">
                          <Link href="/upload">Upload Your First Dataset</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reputation Tab */}
            <TabsContent value="reputation" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="glass-cyber">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Trophy className="w-5 h-5 mr-2 text-primary" />
                        Reputation Score
                      </CardTitle>
                      <CardDescription>
                        Your standing in the Zenkai community
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center mb-6">
                        <div className="text-6xl font-bold gradient-text-cyber mb-2">
                          {Math.round(reputationScore)}
                        </div>
                        <Progress value={reputationScore} className="w-full mb-4" />
                        <Badge className="bg-primary/10 text-primary border-primary/20">
                          {reputationScore >= 80 ? 'Elite' : 
                           reputationScore >= 60 ? 'Expert' :
                           reputationScore >= 40 ? 'Advanced' :
                           reputationScore >= 20 ? 'Intermediate' : 'Novice'} Contributor
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="text-center p-4 glass-panel rounded-xl">
                          <Upload className="w-6 h-6 mx-auto mb-2 text-primary" />
                          <div className="text-2xl font-bold">{userDatasets.length}</div>
                          <div className="text-xs text-muted-foreground">Models Published</div>
                        </div>
                        
                        <div className="text-center p-4 glass-panel rounded-xl">
                          <Star className="w-6 h-6 mx-auto mb-2 text-secondary" />
                          <div className="text-2xl font-bold">
                            {userDatasets.length > 0 ? 
                              (userDatasets.reduce((sum: number, d: Dataset) => sum + d.rating, 0) / userDatasets.length).toFixed(1) :
                              '0.0'
                            }
                          </div>
                          <div className="text-xs text-muted-foreground">Avg Rating</div>
                        </div>
                        
                        <div className="text-center p-4 glass-panel rounded-xl">
                          <Eye className="w-6 h-6 mx-auto mb-2 text-accent" />
                          <div className="text-2xl font-bold">
                            {userDatasets.reduce((sum: number, d: Dataset) => sum + d.downloads, 0)}
                          </div>
                          <div className="text-xs text-muted-foreground">Total Downloads</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="glass-cyber">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Award className="w-5 h-5 mr-2 text-primary" />
                        Achievements
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className={`flex items-center space-x-3 p-3 rounded-xl ${
                        userDatasets.length >= 1 ? 'glass-panel' : 'opacity-50'
                      }`}>
                        <Crown className={`w-6 h-6 ${userDatasets.length >= 1 ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div>
                          <div className="font-medium text-sm">First Upload</div>
                          <div className="text-xs text-muted-foreground">Published your first AI model</div>
                        </div>
                      </div>

                      <div className={`flex items-center space-x-3 p-3 rounded-xl ${
                        totalEarnings >= 10 ? 'glass-panel' : 'opacity-50'
                      }`}>
                        <Coins className={`w-6 h-6 ${totalEarnings >= 10 ? 'text-secondary' : 'text-muted-foreground'}`} />
                        <div>
                          <div className="font-medium text-sm">First Earnings</div>
                          <div className="text-xs text-muted-foreground">Earned your first 10 ZAI</div>
                        </div>
                      </div>

                      <div className={`flex items-center space-x-3 p-3 rounded-xl ${
                        userDatasets.length >= 5 ? 'glass-panel' : 'opacity-50'
                      }`}>
                        <Target className={`w-6 h-6 ${userDatasets.length >= 5 ? 'text-accent' : 'text-muted-foreground'}`} />
                        <div>
                          <div className="font-medium text-sm">Prolific Creator</div>
                          <div className="text-xs text-muted-foreground">Published 5+ AI models</div>
                        </div>
                      </div>

                      <div className={`flex items-center space-x-3 p-3 rounded-xl ${
                        userDatasets.some((d: Dataset) => d.rating >= 4.5) ? 'glass-panel' : 'opacity-50'
                      }`}>
                        <Star className={`w-6 h-6 ${userDatasets.some((d: Dataset) => d.rating >= 4.5) ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div>
                          <div className="font-medium text-sm">Quality Expert</div>
                          <div className="text-xs text-muted-foreground">Model rated 4.5+ stars</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}