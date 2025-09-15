import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Shield, 
  Database, 
  FileText, 
  CheckCircle, 
  Lock, 
  Network, 
  Zap,
  BookOpen,
  Tag,
  DollarSign
} from 'lucide-react';
import DatasetRegistration from '@/components/DatasetRegistration';
import content from '@/lib/config/content.json';

export default function UploadDataset() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12" data-testid="upload-header">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 gradient-text-cyber">
              <Upload className="w-10 h-10 md:w-12 md:h-12 mr-4 text-primary hover:scale-110 transition-transform duration-300 inline-block" data-testid="icon-upload" />
              {content.uploadPage.headline}
            </h1>
            <p className="text-xl md:text-2xl text-accent/90 leading-relaxed max-w-3xl mx-auto">
              {content.uploadPage.subHeadline}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left Column: Form */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Upload Form */}
              <Card className="glass-cyber hover-cyber" data-testid="card-dataset-form">
                <CardHeader>
                  <CardTitle className="text-2xl font-display gradient-text-cyber flex items-center">
                    <FileText className="w-6 h-6 mr-2 text-primary" />
                    {content.uploadPage.sections.datasetInfo.title}
                  </CardTitle>
                  <CardDescription className="text-lg text-muted-foreground">
                    {content.uploadPage.sections.datasetInfo.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DatasetRegistration />
                </CardContent>
              </Card>

              {/* Metadata Importance */}
              <Card className="glass-cyber hover-cyber border-accent/20" data-testid="card-metadata">
                <CardHeader>
                  <CardTitle className="text-xl font-display gradient-text-cyber flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-accent" />
                    {content.uploadPage.sections.metadata.title}
                  </CardTitle>
                  <CardDescription className="text-base text-muted-foreground">
                    {content.uploadPage.sections.metadata.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center p-3 glass-panel rounded-xl">
                        <Tag className="w-4 h-4 mr-2 text-primary" />
                        <span className="text-sm font-medium">Proper Categorization</span>
                      </div>
                      <div className="flex items-center p-3 glass-panel rounded-xl">
                        <FileText className="w-4 h-4 mr-2 text-secondary" />
                        <span className="text-sm font-medium">Rich Descriptions</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center p-3 glass-panel rounded-xl">
                        <BookOpen className="w-4 h-4 mr-2 text-accent" />
                        <span className="text-sm font-medium">Relevant Tags</span>
                      </div>
                      <div className="flex items-center p-3 glass-panel rounded-xl">
                        <CheckCircle className="w-4 h-4 mr-2 text-primary" />
                        <span className="text-sm font-medium">Use Cases</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Info & Benefits */}
            <div className="space-y-8">
              
              {/* 0G Network Benefits */}
              <Card className="glass-cyber hover-cyber border-primary/20" data-testid="card-zeroG">
                <CardHeader>
                  <CardTitle className="text-xl font-display gradient-text-cyber flex items-center">
                    <Network className="w-5 h-5 mr-2 text-primary" />
                    {content.uploadPage.sections.zeroG.title}
                  </CardTitle>
                  <CardDescription>
                    {content.uploadPage.sections.zeroG.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 glass-panel rounded-xl">
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-primary" />
                        <span className="text-sm font-medium">Ownership Protection</span>
                      </div>
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        Secured
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 glass-panel rounded-xl">
                      <div className="flex items-center">
                        <Lock className="w-4 h-4 mr-2 text-secondary" />
                        <span className="text-sm font-medium">Zero-Knowledge Privacy</span>
                      </div>
                      <Badge className="bg-secondary/10 text-secondary border-secondary/20">
                        Optional
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 glass-panel rounded-xl">
                      <div className="flex items-center">
                        <Database className="w-4 h-4 mr-2 text-accent" />
                        <span className="text-sm font-medium">Decentralized Storage</span>
                      </div>
                      <Badge className="bg-accent/10 text-accent border-accent/20">
                        Distributed
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upload Process */}
              <Card className="glass-cyber hover-cyber" data-testid="card-process">
                <CardHeader>
                  <CardTitle className="text-xl font-display gradient-text-cyber flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-primary" />
                    Upload Process
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-3 glass-panel rounded-xl">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold">
                        1
                      </div>
                      <div>
                        <div className="font-medium text-sm">Upload to IPFS</div>
                        <div className="text-xs text-muted-foreground">Store on decentralized network</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 glass-panel rounded-xl">
                      <div className="flex-shrink-0 w-8 h-8 bg-secondary/10 text-secondary rounded-full flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      <div>
                        <div className="font-medium text-sm">Register Metadata</div>
                        <div className="text-xs text-muted-foreground">Add rich descriptions</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 glass-panel rounded-xl">
                      <div className="flex-shrink-0 w-8 h-8 bg-accent/10 text-accent rounded-full flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                      <div>
                        <div className="font-medium text-sm">Blockchain Registry</div>
                        <div className="text-xs text-muted-foreground">Deploy to 0G network</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 glass-panel rounded-xl">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold">
                        4
                      </div>
                      <div>
                        <div className="font-medium text-sm">Marketplace Listing</div>
                        <div className="text-xs text-muted-foreground">Available for purchase</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps Preview */}
              <Card className="glass-cyber hover-cyber border-primary/30">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <DollarSign className="w-8 h-8 mx-auto text-primary mb-2" />
                    <h4 className="font-display font-semibold gradient-text-cyber">Next: Monetization</h4>
                    <p className="text-sm text-muted-foreground">
                      After upload, set pricing and monetize your data
                    </p>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    Coming Next →
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}