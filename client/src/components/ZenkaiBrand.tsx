import { cn } from '@/lib/utils';

interface ZenkaiBrandProps {
  className?: string;
  /**
   * The primary color context - used to determine the opposite color for "ai"
   * 'orange' | 'white' | 'inherit' (inherits from parent)
   */
  colorContext?: 'orange' | 'white' | 'inherit';
  /**
   * Enable hover color swapping effect - when true, colors swap on hover
   */
  enableHover?: boolean;
}

/**
 * ZenkaiBrand component that renders "Zenkai" with split colorization:
 * - "Zenk" keeps the original/context color
 * - "ai" renders in the opposite color (orange ↔ white)
 * - With hover enabled, colors swap during hover transitions
 */
export function ZenkaiBrand({ className, colorContext = 'inherit', enableHover = false }: ZenkaiBrandProps) {
  // Determine colors based on context and hover state
  const getClasses = () => {
    const baseClasses = 'transition-colors duration-500';
    
    switch (colorContext) {
      case 'orange':
        if (enableHover) {
          return {
            zenkClasses: `${baseClasses} text-[hsl(16_100%_55%)] group-hover:text-white`,
            aiClasses: `${baseClasses} text-white group-hover:text-[hsl(16_100%_55%)]`,
          };
        }
        return {
          zenkClasses: `${baseClasses} text-[hsl(16_100%_55%)]`,
          aiClasses: `${baseClasses} text-white`,
        };
      case 'white':
        if (enableHover) {
          return {
            zenkClasses: `${baseClasses} text-white group-hover:text-[hsl(16_100%_55%)]`,
            aiClasses: `${baseClasses} text-[hsl(16_100%_55%)] group-hover:text-white`,
          };
        }
        return {
          zenkClasses: `${baseClasses} text-white`,
          aiClasses: `${baseClasses} text-[hsl(16_100%_55%)]`,
        };
      case 'inherit':
      default:
        if (enableHover) {
          return {
            zenkClasses: `${baseClasses} group-hover:text-[hsl(16_100%_55%)]`,
            aiClasses: `${baseClasses} text-[hsl(16_100%_55%)] group-hover:text-white`,
          };
        }
        return {
          zenkClasses: baseClasses,
          aiClasses: `${baseClasses} text-[hsl(16_100%_55%)]`,
        };
    }
  };

  const { zenkClasses, aiClasses } = getClasses();

  return (
    <span className={cn(className)}>
      <span className={zenkClasses}>Zenk</span>
      <span className={aiClasses}>ai</span>
    </span>
  );
}