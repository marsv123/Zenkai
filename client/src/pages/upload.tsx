import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import DatasetRegistration from '@/components/DatasetRegistration';

export default function UploadDataset() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center justify-center">
              <Upload className="w-10 h-10 mr-3 text-primary" />
              Upload Dataset
            </h1>
            <p className="text-xl text-muted-foreground">
              Share your data with the world and earn ZAI tokens
            </p>
          </div>

          {/* Upload Form */}
          <Card>
            <CardHeader>
              <CardTitle>Dataset Information</CardTitle>
              <CardDescription>
                Provide details about your dataset. Make sure your data is uploaded to IPFS first.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DatasetRegistration />
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">1. Prepare your dataset</h4>
                <p className="text-sm text-muted-foreground">
                  Ensure your dataset is clean, well-documented, and valuable to the community.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">2. Upload to IPFS</h4>
                <p className="text-sm text-muted-foreground">
                  Upload your dataset to IPFS using tools like Pinata, IPFS Desktop, or web3.storage.
                  You'll need the IPFS hash (starting with "ipfs://").
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">3. Set your price</h4>
                <p className="text-sm text-muted-foreground">
                  Determine a fair price in ZAI tokens based on the size, quality, and uniqueness of your dataset.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">4. Publish to blockchain</h4>
                <p className="text-sm text-muted-foreground">
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