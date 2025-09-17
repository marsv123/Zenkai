import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  DollarSign, 
  TrendingUp, 
  Target, 
  BarChart3, 
  Users, 
  Calendar,
  Sparkles,
  ArrowRight,
  Check
} from 'lucide-react';
import content from '@/lib/config/content.json';

interface PricingStrategy {
  type: 'subscription' | 'oneTime' | 'custom';
  suggestedPrice?: number;
  customPrice?: number;
  frequency?: 'monthly' | 'quarterly' | 'yearly';
}

export default function MonetizePage() {
  const [selectedDataset, setSelectedDataset] = useState<string>('');
  const [pricingStrategy, setPricingStrategy] = useState<PricingStrategy>({
    type: 'subscription',
    suggestedPrice: 29.99,
    frequency: 'monthly'
  });
  const [customPrice, setCustomPrice] = useState<string>('');

  // Mock data for demonstration
  const mockDatasets = [
    { id: '1', title: 'Financial Market Trends', category: 'Finance', size: '2.1 GB' },
    { id: '2', title: 'Healthcare Analytics', category: 'Healthcare', size: '5.8 GB' },
    { id: '3', title: 'IoT Sensor Data', category: 'IoT', size: '1.3 GB' }
  ];

  const projectedEarnings = {
    monthly: pricingStrategy.type === 'subscription' 
      ? (pricingStrategy.suggestedPrice || 0) * 15 
      : (pricingStrategy.customPrice || 0) * 8,
    exposure: '2.4K',
    downloads: 147
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12" data-testid="monetize-header">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 gradient-text-cyber">
              {content.monetizePage.headline}
            </h1>
            <p className="text-xl md:text-2xl text-accent/90 leading-relaxed max-w-3xl mx-auto">
              {content.monetizePage.subHeadline}
            </p>
          </div>

          <div className="space-y-8">
            
            {/* Unified Monetization Form */}
            <Card className="max-w-6xl mx-auto glass-cyber hover-cyber" data-testid="card-monetization-form">
              <CardHeader>
                <CardTitle className="text-2xl font-display gradient-text-cyber">
                  Dataset Monetization
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground">
                  Set up pricing and monetization strategy for your dataset
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                
                {/* Dataset Selection */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="dataset-select" className="text-lg font-semibold">Select Dataset to Monetize</Label>
                  </div>
                  <Select value={selectedDataset} onValueChange={setSelectedDataset} data-testid="select-dataset">
                    <SelectTrigger id="dataset-select" className="w-full h-12 bg-background/50 border-border/50">
                      <SelectValue placeholder="Choose a dataset" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockDatasets.map((dataset) => (
                        <SelectItem key={dataset.id} value={dataset.id}>
                          <div className="flex items-center justify-between w-full">
                            <div>
                              <div className="font-medium">{dataset.title}</div>
                              <div className="text-sm text-muted-foreground">{dataset.category} • {dataset.size}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Pricing Strategy Options */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-lg font-semibold">Pricing Strategy</Label>
                    <p className="text-sm text-muted-foreground mb-4">Choose how you want to monetize your dataset</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card 
                      className={`cursor-pointer transition-all duration-300 ${
                        pricingStrategy.type === 'subscription' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setPricingStrategy({...pricingStrategy, type: 'subscription'})}
                      data-testid="option-subscription"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center mb-2">
                          <Calendar className="w-5 h-5 mr-2 text-primary" />
                          <h4 className="font-display font-semibold">{content.monetizePage.options.subscription}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{content.monetizePage.options.subscriptionDesc}</p>
                      </CardContent>
                    </Card>

                    <Card 
                      className={`cursor-pointer transition-all duration-300 ${
                        pricingStrategy.type === 'oneTime' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setPricingStrategy({...pricingStrategy, type: 'oneTime'})}
                      data-testid="option-one-time"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center mb-2">
                          <DollarSign className="w-5 h-5 mr-2 text-secondary" />
                          <h4 className="font-display font-semibold">{content.monetizePage.options.oneTime}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{content.monetizePage.options.oneTimeDesc}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Enhanced AI Suggested Pricing */}
                <Card className="border-accent/30 bg-gradient-to-br from-accent/5 via-accent/3 to-transparent" data-testid="ai-suggested-pricing">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-accent rounded-xl mr-3">
                          <Sparkles className="w-5 h-5 text-accent-foreground" />
                        </div>
                        <div>
                          <h4 className="font-display font-semibold text-accent text-lg">AI-Powered Price Suggestion</h4>
                          <p className="text-xs text-accent/70 mt-1">Based on market analysis and dataset quality</p>
                        </div>
                      </div>
                      <Badge className="bg-accent/20 text-accent border-accent/30">
                        Recommended
                      </Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="text-3xl font-bold gradient-text-cyber">
                          {pricingStrategy.suggestedPrice || '29.99'} ZAI
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {pricingStrategy.type === 'subscription' ? 'per month access' : 'one-time purchase'}
                        </div>
                        <div className="text-xs text-accent/80 mt-2">
                          💡 Optimized for maximum revenue potential
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-2 rounded-lg bg-background/50">
                          <span className="text-sm text-muted-foreground">Similar datasets:</span>
                          <span className="text-sm font-medium">25-45 ZAI</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-lg bg-background/50">
                          <span className="text-sm text-muted-foreground">Data quality score:</span>
                          <Badge className="bg-accent/20 text-accent border-accent/30 text-xs">Premium</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-lg bg-background/50">
                          <span className="text-sm text-muted-foreground">Market demand:</span>
                          <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">High</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-lg bg-background/50">
                          <span className="text-sm text-muted-foreground">Confidence:</span>
                          <span className="text-sm font-medium text-accent">92%</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Quick Accept Button */}
                    <div className="mt-4 pt-4 border-t border-accent/20">
                      <Button 
                        variant="outline"
                        className="w-full border-accent/30 hover:border-accent/50 hover:bg-accent/10 text-accent"
                        onClick={() => {
                          setPricingStrategy(prev => ({...prev, type: 'subscription'}));
                          // Auto-fill suggested price if using subscription
                        }}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Use AI Suggestion
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Custom Pricing */}
                <Card 
                  className={`cursor-pointer transition-all duration-300 ${
                    pricingStrategy.type === 'custom' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setPricingStrategy({...pricingStrategy, type: 'custom'})}
                  data-testid="option-custom"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center mb-4">
                      <Target className="w-5 h-5 mr-2 text-primary" />
                      <h4 className="font-display font-semibold">{content.monetizePage.options.custom}</h4>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Input
                          id="custom-price"
                          type="number"
                          placeholder="Enter your price in ZAI tokens"
                          value={customPrice}
                          onChange={(e) => setCustomPrice(e.target.value)}
                          className="mt-1"
                          data-testid="input-custom-price"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Enhanced Demo Revenue Preview */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold mb-3 flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-primary" />
                      Demo Revenue Preview
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Projected earnings based on current market trends and similar datasets
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="glass-panel p-4 rounded-xl border border-primary/20">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <TrendingUp className="w-4 h-4 mr-2 text-primary" />
                          <span className="text-sm font-medium">Monthly Revenue</span>
                        </div>
                      </div>
                      <div className="text-2xl font-bold gradient-text-cyber">
                        {projectedEarnings.monthly > 0 ? projectedEarnings.monthly.toFixed(0) : '450'} ZAI
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        +12% from last month trend
                      </div>
                    </div>
                    
                    <div className="glass-panel p-4 rounded-xl border border-accent/20">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2 text-accent" />
                          <span className="text-sm font-medium">Market Exposure</span>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-accent">
                        {projectedEarnings.exposure || '2.4K'} views
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Estimated reach per month
                      </div>
                    </div>
                    
                    <div className="glass-panel p-4 rounded-xl border border-secondary/20">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <ArrowRight className="w-4 h-4 mr-2 text-secondary" />
                          <span className="text-sm font-medium">Downloads</span>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-secondary">
                        {projectedEarnings.downloads || 147}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Expected monthly downloads
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional Revenue Insights */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 rounded-xl border border-border/50">
                    <h5 className="text-sm font-semibold mb-3 text-foreground">Revenue Breakdown</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary">65%</div>
                        <div className="text-muted-foreground text-xs">Subscription Revenue</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-accent">25%</div>
                        <div className="text-muted-foreground text-xs">One-time Sales</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-secondary">8%</div>
                        <div className="text-muted-foreground text-xs">Premium Features</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold gradient-text-cyber">2%</div>
                        <div className="text-muted-foreground text-xs">Platform Fee</div>
                      </div>
                    </div>
                  </div>
                  
                  {!selectedDataset && (
                    <div className="mt-4 p-3 bg-muted/30 border border-border/50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Select a dataset above to see personalized revenue projections
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Publish Button */}
                <div className="text-center pt-4">
                  <Button 
                    size="lg" 
                    className="w-full max-w-md mx-auto gradient-primary hover-cyber font-display font-semibold text-lg py-6"
                    disabled={!selectedDataset}
                    data-testid="button-publish"
                  >
                    <DollarSign className="w-5 h-5 mr-2" />
                    {content.monetizePage.button}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-3">
                    Your dataset will be listed on the marketplace once published
                  </p>
                </div>

              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}