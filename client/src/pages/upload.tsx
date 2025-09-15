import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import DatasetRegistration from '@/components/DatasetRegistration';

export default function UploadDataset() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12" data-testid="upload-header">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 flex items-center justify-center gradient-text-cyber">
              <Upload className="w-10 h-10 md:w-12 md:h-12 mr-4 text-primary hover:scale-110 transition-transform duration-300" data-testid="icon-upload" />
              Upload Datasets
            </h1>
            <p className="text-xl md:text-2xl text-accent/90 leading-relaxed max-w-2xl mx-auto">
              Share your data with the world and earn ZAI tokens
            </p>
          </div>

          {/* Upload Form */}
          <Card className="glass-cyber hover-cyber mb-8" data-testid="card-dataset-form">
            <CardHeader>
              <CardTitle className="text-2xl font-display gradient-text-cyber">Dataset Information</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Provide accurate details about your dataset to maximize credibility and discovery.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DatasetRegistration />
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="glass-cyber hover-cyber" data-testid="card-instructions">
            <CardHeader>
              <CardTitle className="text-2xl font-display gradient-text-cyber">Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-l-4 border-primary/40 pl-6 hover:border-primary transition-colors duration-300" data-testid="instruction-prepare">
                <h4 className="font-display font-semibold mb-3 text-lg text-foreground">1. Prepare your dataset</h4>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Ensure your dataset is clean, well-documented, and valuable to the community.
                </p>
              </div>
              <div className="border-l-4 border-secondary/40 pl-6 hover:border-secondary transition-colors duration-300" data-testid="instruction-ipfs">
                <h4 className="font-display font-semibold mb-3 text-lg text-foreground">2. Upload to IPFS</h4>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Upload your dataset to IPFS using tools like Pinata, IPFS Desktop, or web3.storage.
                  You'll need the IPFS hash (starting with "ipfs://").
                </p>
              </div>
              <div className="border-l-4 border-accent/40 pl-6 hover:border-accent transition-colors duration-300" data-testid="instruction-pricing">
                <h4 className="font-display font-semibold mb-3 text-lg text-foreground">3. Set your price</h4>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Determine a fair price in ZAI tokens based on the size, quality, and uniqueness of your dataset.
                </p>
              </div>
              <div className="border-l-4 border-primary/40 pl-6 hover:border-primary transition-colors duration-300" data-testid="instruction-publish">
                <h4 className="font-display font-semibold mb-3 text-lg text-foreground">4. Publish to blockchain</h4>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Once you submit the form, your dataset will be registered on the 0G blockchain and listed in the marketplace.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}