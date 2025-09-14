import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'wouter';
import { ArrowLeft, Shield, DollarSign, Globe, Coins, TrendingUp, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

// Tokenize form schema
const tokenizeSchema = z.object({
  modelName: z.string().min(3, 'Model name must be at least 3 characters'),
  endpointUrl: z.string().url('Please enter a valid URL'),
  pricePerQuery: z.string().min(1, 'Price is required').regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid price'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  totalTokens: z.string().min(1, 'Total tokens is required').regex(/^\d+$/, 'Enter a valid number'),
});

type TokenizeFormData = z.infer<typeof tokenizeSchema>;

export default function TokenizePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenized, setTokenized] = useState(false);

  const form = useForm<TokenizeFormData>({
    resolver: zodResolver(tokenizeSchema),
    defaultValues: {
      modelName: '',
      endpointUrl: '',
      pricePerQuery: '',
      description: '',
      totalTokens: '',
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
      {/* Header */}
      <div className="border-b border-primary/20 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold gradient-text-cyber">Tokenize Your AI</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="glass-cyber border-primary/30">
              <CardHeader>
                <CardTitle className="gradient-text-cyber flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Register Your AI Asset
                </CardTitle>
                <CardDescription>
                  Turn your AI model into an investable asset on the blockchain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="modelName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g. Advanced Sentiment Analyzer"
                              className="glass-panel border-primary/20"
                              data-testid="input-model-name"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            A unique name for your AI model
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
                          <FormLabel>Endpoint URL</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://api.example.com/model/v1"
                              className="glass-panel border-primary/20"
                              data-testid="input-endpoint-url"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            The API endpoint where your model is hosted
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="pricePerQuery"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price per Query (ZAI)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="0.05"
                                className="glass-panel border-primary/20"
                                data-testid="input-price-per-query"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Cost in ZAI tokens for each query
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
                            <FormLabel>Total Tokens</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="100000"
                                className="glass-panel border-primary/20"
                                data-testid="input-total-tokens"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Total number of tokens to create
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your AI model's capabilities and use cases..."
                              className="glass-panel border-primary/20 min-h-24"
                              data-testid="input-description"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Detailed description of your AI model
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full gradient-primary hover-cyber"
                      disabled={isSubmitting}
                      data-testid="button-tokenize"
                    >
                      {isSubmitting ? 'Tokenizing...' : 'Tokenize AI Model'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            <Card className="glass-cyber border-primary/30">
              <CardHeader>
                <CardTitle className="text-lg gradient-text-cyber">Tokenization Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Coins className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h5 className="font-medium">Generate Revenue</h5>
                    <p className="text-sm text-foreground/70">Earn ZAI tokens for every query</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h5 className="font-medium">Attract Investors</h5>
                    <p className="text-sm text-foreground/70">Allow others to buy stakes in your AI</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h5 className="font-medium">Blockchain Security</h5>
                    <p className="text-sm text-foreground/70">Immutable ownership and provenance</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h5 className="font-medium">Track Performance</h5>
                    <p className="text-sm text-foreground/70">Monitor usage and earnings</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-cyber border-primary/30">
              <CardHeader>
                <CardTitle className="text-lg gradient-text-cyber">Estimated Returns</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 glass-panel rounded-xl">
                  <div className="text-2xl font-bold gradient-text-cyber mb-2">~500</div>
                  <div className="text-sm text-foreground/70">Estimated queries/month</div>
                </div>
                
                <div className="text-center p-4 glass-panel rounded-xl">
                  <div className="text-2xl font-bold gradient-text-cyber mb-2">25 ZAI</div>
                  <div className="text-sm text-foreground/70">Projected monthly earnings</div>
                </div>
                
                <Badge className="w-full justify-center glass-panel border-primary/30 gradient-text-zen py-2">
                  <Clock className="w-4 h-4 mr-2" />
                  Based on similar models
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}