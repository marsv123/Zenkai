import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'wouter';
import { ArrowLeft, Shield, DollarSign, Globe, Coins, TrendingUp, Users, Clock, Percent, ChartBar, Target, Banknote, Share2, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import content from '@/lib/config/content.json';

// Enhanced Tokenize form schema with revenue sharing
const tokenizeSchema = z.object({
  modelName: z.string().min(3, 'Model name must be at least 3 characters'),
  endpointUrl: z.string().url('Please enter a valid URL'),
  pricePerQuery: z.string().min(1, 'Price is required').regex(/^\d+(\.\d{1,4})?$/, 'Enter a valid price'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  totalTokens: z.string().min(1, 'Total tokens is required').regex(/^\d+$/, 'Enter a valid number'),
  revenueShare: z.number().min(0).max(100),
  stakingRewards: z.string().min(1, 'Staking rewards is required').regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid percentage'),
});

type TokenizeFormData = z.infer<typeof tokenizeSchema>;

export default function TokenizePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenized, setTokenized] = useState(false);
  const [revenueShare, setRevenueShare] = useState<number[]>([15]);
  const [selectedModel, setSelectedModel] = useState<string>('');

  // Mock trained models
  const trainedModels = [
    { id: 'model-1', name: 'Text Classifier v1', accuracy: '92.3%', status: 'trained' },
    { id: 'model-2', name: 'Sentiment Analyzer v2', accuracy: '89.7%', status: 'trained' },
    { id: 'model-3', name: 'Image Recognition Model', accuracy: '94.1%', status: 'trained' },
  ];

  const form = useForm<TokenizeFormData>({
    resolver: zodResolver(tokenizeSchema),
    defaultValues: {
      modelName: '',
      endpointUrl: '',
      pricePerQuery: '',
      description: '',
      totalTokens: '',
      revenueShare: 15,
      stakingRewards: '',
    },
  });

  const handleSubmit = async (data: TokenizeFormData) => {
    setIsSubmitting(true);
    
    // Simulate tokenization process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setTokenized(true);
  };

  if (tokenized) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-primary/20 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </Link>
            </div>
            <h1 className="text-2xl font-bold gradient-text-cyber">Tokenization Complete</h1>
          </div>
        </div>

        {/* Success Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 gradient-primary rounded-full flex items-center justify-center mx-auto mb-8">
              <Shield className="w-12 h-12 text-primary-foreground" />
            </div>
            
            <h2 className="text-4xl font-bold gradient-text-cyber mb-6">
              Your AI is now tokenized!
            </h2>
            
            <p className="text-xl text-foreground/80 mb-8 max-w-lg mx-auto">
              {form.getValues('modelName')} has been successfully registered as an investable asset on the blockchain.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="glass-cyber p-6 rounded-xl">
                <Coins className="w-8 h-8 text-primary mb-4 mx-auto" />
                <div className="text-2xl font-bold gradient-text-cyber mb-2">
                  {form.getValues('totalTokens')}
                </div>
                <div className="text-sm text-foreground/70">Total Tokens</div>
              </div>
              
              <div className="glass-cyber p-6 rounded-xl">
                <DollarSign className="w-8 h-8 text-primary mb-4 mx-auto" />
                <div className="text-2xl font-bold gradient-text-cyber mb-2">
                  {form.getValues('pricePerQuery')} ZAI
                </div>
                <div className="text-sm text-foreground/70">Per Query</div>
              </div>
              
              <div className="glass-cyber p-6 rounded-xl">
                <TrendingUp className="w-8 h-8 text-primary mb-4 mx-auto" />
                <div className="text-2xl font-bold gradient-text-cyber mb-2">
                  Active
                </div>
                <div className="text-sm text-foreground/70">Status</div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button asChild className="gradient-primary hover-cyber">
                <Link href="/marketplace">View in Marketplace</Link>
              </Button>
              <Button asChild variant="outline" className="border-primary/30 hover:border-primary/50 hover-cyber">
                <Link href="/dashboard">Manage Assets</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12" data-testid="tokenize-header">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 gradient-text-cyber">
              <Coins className="w-10 h-10 md:w-12 md:h-12 mr-4 text-primary hover:scale-110 transition-transform duration-300 inline-block" data-testid="icon-tokenize" />
              {content.tokenizePage.headline}
            </h1>
            <p className="text-xl md:text-2xl text-accent/90 leading-relaxed max-w-3xl mx-auto">
              {content.tokenizePage.subHeadline}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left Column: Configuration */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Model Selection */}
              <Card className="glass-cyber hover-cyber" data-testid="card-model-selection">
                <CardHeader>
                  <CardTitle className="text-xl font-display gradient-text-cyber flex items-center">
                    <Target className="w-6 h-6 mr-2 text-primary" />
                    {content.tokenizePage.sections.modelSelection.title}
                  </CardTitle>
                  <CardDescription className="text-lg text-muted-foreground">
                    {content.tokenizePage.sections.modelSelection.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    {trainedModels.map((model) => (
                      <div
                        key={model.id}
                        className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                          selectedModel === model.id
                            ? 'border-primary/50 glass-panel bg-primary/5'
                            : 'border-primary/20 glass-panel hover:border-primary/30'
                        }`}
                        onClick={() => setSelectedModel(model.id)}
                        data-testid={`model-${model.id}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-sm">{model.name}</h4>
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                            {model.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-foreground/70 space-y-1">
                          <div>Accuracy: {model.accuracy}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tokenomics Configuration */}
              <Card className="glass-cyber hover-cyber" data-testid="card-tokenomics">
                <CardHeader>
                  <CardTitle className="text-xl font-display gradient-text-cyber flex items-center">
                    <PieChart className="w-6 h-6 mr-2 text-secondary" />
                    {content.tokenizePage.sections.tokenomics.title}
                  </CardTitle>
                  <CardDescription className="text-lg text-muted-foreground">
                    {content.tokenizePage.sections.tokenomics.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                      
                      {/* Pricing Section */}
                      <div className="space-y-4">
                        <h4 className="font-display font-semibold text-lg gradient-text-cyber">Pricing Structure</h4>
                        <div className="grid md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="pricePerQuery"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center">
                                  <DollarSign className="w-4 h-4 mr-1 text-primary" />
                                  {content.tokenizePage.fields.queryPrice}
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="0.0025"
                                    className="glass-panel border-primary/20"
                                    data-testid="input-price-per-query"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription className="text-sm">
                                  {content.tokenizePage.fields.queryPriceDesc}
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="totalTokens"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center">
                                  <Coins className="w-4 h-4 mr-1 text-secondary" />
                                  {content.tokenizePage.fields.tokenSupply}
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="1000000"
                                    className="glass-panel border-secondary/20"
                                    data-testid="input-total-tokens"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription className="text-sm">
                                  {content.tokenizePage.fields.tokenSupplyDesc}
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* Revenue Sharing */}
                      <div className="space-y-4">
                        <h4 className="font-display font-semibold text-lg gradient-text-cyber">Revenue Sharing</h4>
                        <div className="space-y-6">
                          <div>
                            <FormLabel className="flex items-center mb-4">
                              <Share2 className="w-4 h-4 mr-1 text-accent" />
                              {content.tokenizePage.fields.revenueShare}: {revenueShare[0]}%
                            </FormLabel>
                            <div className="px-4">
                              <Slider
                                value={revenueShare}
                                onValueChange={(value) => {
                                  setRevenueShare(value);
                                  form.setValue('revenueShare', value[0]);
                                }}
                                max={50}
                                min={5}
                                step={5}
                                className="w-full"
                                data-testid="slider-revenue-share"
                              />
                              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                <span>5% (Min)</span>
                                <span>25% (Recommended)</span>
                                <span>50% (Max)</span>
                              </div>
                            </div>
                            <FormDescription className="text-sm mt-2">
                              {content.tokenizePage.fields.revenueShareDesc}
                            </FormDescription>
                          </div>

                          <FormField
                            control={form.control}
                            name="stakingRewards"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center">
                                  <Percent className="w-4 h-4 mr-1 text-primary" />
                                  {content.tokenizePage.fields.stakingRewards}
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="2.5"
                                    className="glass-panel border-primary/20"
                                    data-testid="input-staking-rewards"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription className="text-sm">
                                  {content.tokenizePage.fields.stakingRewardsDesc}
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* Model Details */}
                      <div className="space-y-4">
                        <h4 className="font-display font-semibold text-lg gradient-text-cyber">Model Details</h4>
                        <div className="space-y-6">
                          <FormField
                            control={form.control}
                            name="modelName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Token Name</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="e.g. Advanced Sentiment Analyzer Token"
                                    className="glass-panel border-primary/20"
                                    data-testid="input-model-name"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Public name for your tokenized AI model
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Token Description</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Describe your AI model's capabilities, use cases, and potential for revenue generation..."
                                    className="glass-panel border-primary/20 min-h-24"
                                    data-testid="input-description"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Detailed description for potential investors
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="endpointUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>API Endpoint</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="https://api.yourmodel.com/v1/predict"
                                    className="glass-panel border-primary/20"
                                    data-testid="input-endpoint-url"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Public API endpoint for model access
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full gradient-primary hover-cyber font-display font-semibold text-lg py-6"
                        disabled={isSubmitting || !selectedModel}
                        data-testid="button-tokenize"
                      >
                        <Coins className="w-5 h-5 mr-2" />
                        {isSubmitting ? 'Tokenizing...' : content.tokenizePage.button}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Preview & Stats */}
            <div className="space-y-6">
              
              {/* Revenue Breakdown */}
              <Card className="glass-cyber hover-cyber border-primary/20" data-testid="card-revenue-breakdown">
                <CardHeader>
                  <CardTitle className="text-lg font-display gradient-text-cyber flex items-center">
                    <ChartBar className="w-5 h-5 mr-2 text-primary" />
                    Revenue Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 glass-panel rounded-xl">
                      <div className="flex items-center">
                        <Banknote className="w-4 h-4 mr-2 text-primary" />
                        <span className="text-sm font-medium">Your Share</span>
                      </div>
                      <span className="text-lg font-bold gradient-text-cyber">
                        {100 - revenueShare[0]}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 glass-panel rounded-xl">
                      <div className="flex items-center">
                        <Share2 className="w-4 h-4 mr-2 text-accent" />
                        <span className="text-sm font-medium">Token Holders</span>
                      </div>
                      <span className="text-lg font-bold text-accent">
                        {revenueShare[0]}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 glass-panel rounded-xl">
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 mr-2 text-secondary" />
                        <span className="text-sm font-medium">Platform Fee</span>
                      </div>
                      <span className="text-lg font-bold text-secondary">4%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Marketplace Preview */}
              <Card className="glass-cyber hover-cyber" data-testid="card-marketplace-preview">
                <CardHeader>
                  <CardTitle className="text-lg font-display gradient-text-cyber flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                    {content.tokenizePage.sections.marketplace.title}
                  </CardTitle>
                  <CardDescription>
                    {content.tokenizePage.sections.marketplace.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="text-center p-4 glass-panel rounded-xl">
                      <div className="text-2xl font-bold gradient-text-cyber mb-2">~1.2K</div>
                      <div className="text-sm text-foreground/70">Est. queries/month</div>
                    </div>
                    <div className="text-center p-4 glass-panel rounded-xl">
                      <div className="text-2xl font-bold gradient-text-cyber mb-2">
                        {form.watch('pricePerQuery') ? 
                          (parseFloat(form.watch('pricePerQuery') || '0') * 1200).toFixed(0) : 
                          '--'
                        } ZAI
                      </div>
                      <div className="text-sm text-foreground/70">Monthly revenue</div>
                    </div>
                    <div className="text-center p-4 glass-panel rounded-xl">
                      <div className="text-2xl font-bold gradient-text-cyber mb-2">
                        {form.watch('totalTokens') ? 
                          (parseInt(form.watch('totalTokens') || '0') / 1000000).toFixed(1) + 'M' : 
                          '--'
                        }
                      </div>
                      <div className="text-sm text-foreground/70">Tokens available</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}