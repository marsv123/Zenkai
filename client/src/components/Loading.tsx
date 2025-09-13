import samuraiLogoUrl from '@assets/samurai-logo.png';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

export default function Loading({ 
  size = 'medium', 
  message = 'meditating on intelligence...', 
  fullScreen = false,
  className = ''
}: LoadingProps) {
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-20 h-20',
    large: 'w-32 h-32'
  };

  const textSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center space-y-8">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 blur-2xl animate-pulse"></div>
            <img
              src={samuraiLogoUrl}
              alt="zatorai loading"
              className={`${sizeClasses.large} loading-samurai relative z-10 mx-auto`}
            />
          </div>
          <div className="space-y-2">
            <p className={`${textSizes.large} font-accent text-muted-foreground`}>
              {message}
            </p>
            <div className="flex items-center justify-center space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse delay-150"></div>
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse delay-300"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 blur-xl animate-pulse"></div>
        <img
          src={samuraiLogoUrl}
          alt="zatorai loading"
          className={`${sizeClasses[size]} loading-samurai relative z-10`}
        />
      </div>
      {message && (
        <p className={`${textSizes[size]} font-accent text-muted-foreground text-center`}>
          {message}
        </p>
      )}
    </div>
  );
}

// Skeleton loading component for cards and content
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`card-elevated animate-pulse ${className}`}>
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="h-6 bg-muted rounded-lg w-3/4"></div>
            <div className="h-4 bg-muted/60 rounded-full w-1/4"></div>
          </div>
          <div className="h-8 bg-primary/20 rounded-full w-20"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-muted/60 rounded w-full"></div>
          <div className="h-4 bg-muted/60 rounded w-2/3"></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="h-4 bg-muted/60 rounded w-1/3"></div>
          <div className="h-4 bg-muted/60 rounded w-1/4"></div>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 h-10 bg-primary/20 rounded-lg"></div>
          <div className="h-10 w-12 bg-accent/20 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

// Loading spinner for inline use
export function LoadingSpinner({ size = 'medium', className = '' }: { size?: 'small' | 'medium' | 'large'; className?: string }) {
  const spinnerSizes = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  return (
    <div className={`loading-spinner ${spinnerSizes[size]} ${className}`}></div>
  );
}