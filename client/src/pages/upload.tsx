import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Upload, 
  FileText, 
  BookOpen,
  Tag,
  CheckCircle
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
              {content.uploadPage.headline}
            </h1>
            <p className="text-xl md:text-2xl text-accent/90 leading-relaxed max-w-3xl mx-auto">
              {content.uploadPage.subHeadline}
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="space-y-8">
              
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

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}