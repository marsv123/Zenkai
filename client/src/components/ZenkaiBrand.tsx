import { cn } from '@/lib/utils';

interface ZenkaiBrandProps {
  className?: string;
  /**
   * The primary color context - used to determine the opposite color for "ai"
   * 'orange' | 'white' | 'inherit' (inherits from parent)
   */
  colorContext?: 'orange' | 'white' | 'inherit';
}

/**
 * ZenkaiBrand component that renders "Zenkai" with split colorization:
 * - "Zenk" keeps the original/context color
 * - "ai" renders in the opposite color (orange ↔ white)
 */
export function ZenkaiBrand({ className, colorContext = 'inherit' }: ZenkaiBrandProps) {
  // Determine colors based on context
  const getColors = () => {
    switch (colorContext) {
      case 'orange':
        return {
          zenkColor: 'text-[hsl(22_100%_60%)]', // Orange for "Zenk"
          aiColor: 'text-white', // White for "ai"
        };
      case 'white':
        return {
          zenkColor: 'text-white', // White for "Zenk"
          aiColor: 'text-[hsl(22_100%_60%)]', // Orange for "ai"
        };
      case 'inherit':
      default:
        return {
          zenkColor: '', // Inherit parent color for "Zenk"
          aiColor: 'text-[hsl(22_100%_60%)]', // Default to orange for "ai" when inheriting
        };
    }
  };

  const { zenkColor, aiColor } = getColors();

  return (
    <span className={cn(className)}>
      <span className={zenkColor}>Zenk</span>
      <span className={aiColor}>ai</span>
    </span>
  );
}