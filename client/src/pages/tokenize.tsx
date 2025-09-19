import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'wouter';
import { ArrowLeft, Shield, Image, FileText, Percent, TrendingUp, Target, Hash, Lock, DollarSign, Coins, Share2 } from 'lucide-react';
import { useAccount, useWriteContract, useSwitchChain } from 'wagmi';
import { parseEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import content from '@/lib/config/content.json';

// INFT Minting form schema
const inftSchema = z.object({
  name: z.string().min(3, 'INFT name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  datasetURI: z.string().min(1, 'Dataset URI is required').regex(/^(ipfs|0g):\/\//, 'Must be valid IPFS or 0G Storage URI'),
  modelURI: z.string().optional().refine((val) => !val || /^(ipfs|0g):\/\//.test(val), 'Must be valid IPFS or 0G Storage URI or empty'),
  encryptedMetaURI: z.string().optional(),
  royaltyPercentage: z.number().min(0).max(10),
  attributes: z.string().optional(),
});

type INFTFormData = z.infer<typeof inftSchema>;

export default function TokenizePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [minted, setMinted] = useState(false);
  const [royaltyPercentage, setRoyaltyPercentage] = useState<number[]>([5]);
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [mintedTokenId, setMintedTokenId] = useState<string>('');
  
  // Web3 hooks
  const { address, chainId } = useAccount();
  const { writeContract } = useWriteContract();
  const { switchChain } = useSwitchChain();

  // Mock uploaded assets (would come from user's uploads)
  const uploadedAssets = [
    { 
      id: 'asset-1', 
      name: 'Financial Sentiment Dataset', 
      type: 'dataset',
      uri: '0g://Qm123...abc', 
      storageProvider: '0g',
      zkProtected: true,
      size: '2.1 GB'
    },
    { 
      id: 'asset-2', 
      name: 'Image Classification Model', 
      type: 'model',
      uri: 'ipfs://Qm456...def', 
      storageProvider: 'ipfs',
      zkProtected: false,
      size: '156 MB'
    },
    { 
      id: 'asset-3', 
      name: 'NLP Training Dataset', 
      type: 'dataset',
      uri: '0g://Qm789...ghi', 
      storageProvider: '0g',
      zkProtected: true,
      size: '850 MB'
    },
  ];

  const form = useForm<INFTFormData>({
    resolver: zodResolver(inftSchema),
    defaultValues: {
      name: '',
      description: 'Unique AI asset with verifiable provenance and performance metrics. Perfect for collectors and AI enthusiasts seeking authentic intelligence assets.',
      datasetURI: '',
      modelURI: '',
      encryptedMetaURI: '',
      royaltyPercentage: 5,
      attributes: '',
    },
  });

  // Auto-detect ZK protection from selected asset
  const isZKProtected = useCallback(() => {
    if (!selectedAsset) return false;
    const asset = uploadedAssets.find(a => a.id === selectedAsset);
    return asset?.zkProtected || false;
  }, [selectedAsset]);

  // Handle INFT minting
  const handleSubmit = async (data: INFTFormData) => {
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Ensure we're on 0G Galileo testnet
      if (chainId !== 16601) {
        await switchChain({ chainId: 16601 });
      }

      // For demo, simulate successful minting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // TODO: Integrate with actual ZenkaiINFT contract
      const mockTokenId = `INFT-${Date.now()}`;
      setMintedTokenId(mockTokenId);
      setMinted(true);
    } catch (error) {
      console.error('INFT minting failed:', error);
      alert('Failed to mint INFT. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (minted) {
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
            <h1 className="text-2xl font-bold gradient-text-cyber">INFT Minted Successfully</h1>
          </div>
        </div>

        {/* Success Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 gradient-primary rounded-full flex items-center justify-center mx-auto mb-8">
              <Shield className="w-12 h-12 text-primary-foreground" />
            </div>
            
            <h2 className="text-4xl font-bold gradient-text-cyber mb-6">
              Your Intelligence NFT is Live!
            </h2>
            
            <p className="text-xl text-foreground/80 mb-8 max-w-lg mx-auto">
              {form.getValues('name')} has been successfully minted as a unique Intelligence NFT on the 0G blockchain.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="glass-cyber p-6 rounded-xl">
                <Hash className="w-8 h-8 text-primary mb-4 mx-auto" />
                <div className="text-lg font-bold gradient-text-cyber mb-2">
                  {mintedTokenId}
                </div>
                <div className="text-sm text-foreground/70">Token ID</div>
              </div>
              
              <div className="glass-cyber p-6 rounded-xl">
                <Percent className="w-8 h-8 text-secondary mb-4 mx-auto" />
                <div className="text-2xl font-bold gradient-text-cyber mb-2">
                  {royaltyPercentage[0]}%
                </div>
                <div className="text-sm text-foreground/70">Creator Royalty</div>
              </div>
              
              <div className="glass-cyber p-6 rounded-xl">
                {isZKProtected() ? (
                  <Lock className="w-8 h-8 text-accent mb-4 mx-auto" />
                ) : (
                  <Shield className="w-8 h-8 text-primary mb-4 mx-auto" />
                )}
                <div className="text-2xl font-bold gradient-text-cyber mb-2">
                  {isZKProtected() ? 'ZK Protected' : 'Public'}
                </div>
                <div className="text-sm text-foreground/70">Privacy</div>
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
              Mint Intelligence NFTs
            </h1>
            <p className="text-xl md:text-2xl text-accent/90 leading-relaxed max-w-3xl mx-auto">
              Transform your AI datasets and models into tradeable Intelligence NFTs with verifiable provenance and creator royalties.
            </p>
          </div>

          <div className="space-y-8">
            {/* Unified Tokenization Form */}
            <Card className="max-w-6xl mx-auto glass-cyber hover-cyber" data-testid="card-tokenization-form">
              <CardHeader>
                <CardTitle className="text-2xl font-display gradient-text-cyber">
                  Intelligence NFT Minting
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground">
                  Create unique NFTs for your AI datasets and models with built-in royalties
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                    
                    {/* Select AI Model */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          Select Asset to Mint
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">Choose a dataset or model from your uploads</p>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4">
                        {uploadedAssets.map((asset) => (
                          <div
                            key={asset.id}
                            className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 hover-cyber ${
                              selectedAsset === asset.id
                                ? 'border-primary/50 glass-panel bg-primary/5 shadow-md'
                                : 'border-primary/20 glass-panel hover:border-primary/30'
                            }`}
                            onClick={() => {
                              setSelectedAsset(asset.id);
                              // Auto-populate asset data when selected
                              if (!form.getValues('name')) {
                                form.setValue('name', `${asset.name} INFT`);
                              }
                              form.setValue('datasetURI', asset.uri);
                            }}
                            data-testid={`asset-${asset.id}`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-sm">{asset.name}</h4>
                              <div className="flex gap-1">
                                <Badge className="bg-secondary/10 text-secondary border-secondary/20 text-xs">
                                  {asset.type}
                                </Badge>
                                {asset.zkProtected && (
                                  <Badge className="bg-accent/10 text-accent border-accent/20 text-xs">
                                    <Lock className="w-3 h-3 mr-1" />
                                    ZK
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-xs text-foreground/70 mb-2">
                              Storage: {asset.storageProvider.toUpperCase()} • Size: {asset.size}
                            </div>
                            
                            {/* Model Details Preview */}
                            <div className="text-xs space-y-1 pt-2 border-t border-border/20">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Storage URI:</span>
                                <span className="text-primary font-medium text-xs">
                                  {asset.uri.slice(0, 12)}...
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">NFT potential:</span>
                                <span className="text-secondary font-medium">High</span>
                              </div>
                            </div>
                            
                            {selectedAsset === asset.id && (
                              <div className="mt-3 text-center">
                                <Badge className="bg-primary text-primary-foreground text-xs">
                                  ✓ Selected for Minting
                                </Badge>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* Selected Model Summary */}
                      {selectedAsset && (
                        <div className="mt-6 p-4 glass-panel rounded-xl border border-primary/10">
                          <h4 className="text-sm font-semibold mb-3 flex items-center">
                            <Target className="w-4 h-4 mr-2 text-primary" />
                            Selected Asset Overview
                          </h4>
                          {(() => {
                            const asset = uploadedAssets.find(a => a.id === selectedAsset);
                            return (
                              <div className="grid md:grid-cols-3 gap-4 text-sm">
                                <div className="space-y-1">
                                  <div className="text-muted-foreground">Asset Name:</div>
                                  <div className="font-medium text-primary">{asset?.name}</div>
                                </div>
                                <div className="space-y-1">
                                  <div className="text-muted-foreground">Storage:</div>
                                  <div className="font-medium text-secondary">{asset?.storageProvider.toUpperCase()} • {asset?.size}</div>
                                </div>
                                <div className="space-y-1">
                                  <div className="text-muted-foreground">Est. INFT Value:</div>
                                  <div className="font-medium text-accent">0.5 - 2.0 ETH</div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Model Details */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          Define INFT Details
                        </h3>
                        
                      </div>
                      
                      <div className="space-y-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>INFT Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g. Advanced Sentiment Dataset INFT"
                                  className="glass-panel border-primary/20"
                                  data-testid="input-inft-name"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Public name for your Intelligence NFT
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
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe your AI asset's capabilities, uniqueness, and value proposition..."
                                  className="glass-panel border-primary/20 min-h-24"
                                  data-testid="input-description"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Detailed description for potential collectors
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="datasetURI"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dataset URI</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="0g://... or ipfs://..."
                                  className="glass-panel border-primary/20"
                                  data-testid="input-dataset-uri"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Primary dataset URI from your uploads
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="modelURI"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Model URI (Optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="0g://... or ipfs://..."
                                  className="glass-panel border-secondary/20"
                                  data-testid="input-model-uri"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Optional trained model URI if available
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Tokenomics Configuration */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          INFT Royalty Settings
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">Configure creator royalties for secondary sales</p>
                      </div>
                      
                      <div className="space-y-6">
                        {/* Optional Attributes Field */}
                        <FormField
                          control={form.control}
                          name="attributes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center">
                                <Hash className="w-4 h-4 mr-1 text-secondary" />
                                Attributes (Optional)
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="type=dataset,category=finance,quality=premium"
                                  className="glass-panel border-secondary/20"
                                  data-testid="input-attributes"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription className="text-sm">
                                Comma-separated attributes for enhanced discoverability
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                            {/* Royalty Percentage Slider */}
                        <div className="space-y-4">
                          <FormLabel className="flex items-center mb-4">
                            <Percent className="w-4 h-4 mr-1 text-accent" />
                            Creator Royalty: {royaltyPercentage[0]}%
                          </FormLabel>
                          
                          <div className="glass-panel p-6 rounded-xl border border-accent/20">
                            <div className="mb-4">
                              <Slider
                                value={royaltyPercentage}
                                onValueChange={(value) => {
                                  setRoyaltyPercentage(value);
                                  form.setValue('royaltyPercentage', value[0]);
                                }}
                                max={10}
                                min={0}
                                step={1}
                                className="w-full"
                                data-testid="slider-royalty-percentage"
                              />
                              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                <span>0% (No Royalty)</span>
                                <span className="text-accent">5% (Recommended)</span>
                                <span>10% (Max)</span>
                              </div>
                            </div>

                            {/* Royalty Preview */}
                            <div className="mt-6 p-4 glass-panel rounded-lg border border-primary/10">
                              <h4 className="text-sm font-semibold mb-3 flex items-center">
                                <TrendingUp className="w-4 h-4 mr-2 text-primary" />
                                Royalty Preview
                              </h4>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-foreground/70">Your Royalty:</span>
                                    <span className="font-medium text-primary">{royaltyPercentage[0]}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-foreground/70">Per Sale:</span>
                                    <span className="font-medium text-accent">Automatic</span>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-foreground/70">Example (1 ETH sale):</span>
                                    <span className="font-medium text-secondary">
                                      {(royaltyPercentage[0] / 100).toFixed(2)} ETH
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-foreground/70">Standard:</span>
                                    <span className="font-medium text-accent">EIP-2981</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <FormDescription className="text-sm">
                            Set creator royalty percentage for secondary sales (0-10%)
                          </FormDescription>
                        </div>

                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-6">
                      <Button 
                        type="submit" 
                        className="w-full gradient-primary hover-cyber font-display font-semibold text-lg py-6"
                        disabled={isSubmitting || !selectedAsset}
                        data-testid="button-mint-inft"
                      >
                        <Shield className="w-5 h-5 mr-2" />
                        {isSubmitting ? 'Minting INFT...' : 'Mint Intelligence NFT'}
                      </Button>
                    </div>

                  </form>
                </Form>

              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}