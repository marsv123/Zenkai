import { cn } from "@/lib/utils";

interface ZenkaiBrandProps {
  className?: string;
  hoverEffect?: boolean;
  /** Override colors for special cases */
  zenkColor?: string;
  aiColor?: string;
  /** Show as inline or block element */
  inline?: boolean;
  /** Accessibility label override */
  ariaLabel?: string;
  /** Additional data attributes for testing */
  'data-testid'?: string;
}

export function ZenkaiBrand({
  className,
  hoverEffect = true,
  zenkColor = "text-primary",
  aiColor = "text-white",
  inline = true,
  ariaLabel = "Zenkai",
  'data-testid': dataTestId,
  ...props
}: ZenkaiBrandProps & React.HTMLAttributes<HTMLSpanElement>) {
  const Component = inline ? 'span' : 'div';
  
  return (
    <Component
      className={cn(
        "zenkai-brand",
        hoverEffect && "group",
        inline ? "inline" : "block",
        className
      )}
      aria-label={ariaLabel}
      data-testid={dataTestId}
      {...props}
    >
      <span
        className={cn(
          "zenkai-zenk transition-colors duration-700",
          hoverEffect ? "text-primary group-hover:!text-white" : zenkColor
        )}
      >
        Zenk
      </span>
      <span
        className={cn(
          "zenkai-ai transition-colors duration-700",
          hoverEffect ? "text-white group-hover:!text-primary" : aiColor
        )}
      >
        ai
      </span>
    </Component>
  );
}

// Convenience wrapper for common use cases
export function ZenkaiBrandHeading({ className, ...props }: ZenkaiBrandProps & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <ZenkaiBrand
      className={cn("font-display font-bold", className)}
      inline={false}
      {...props}
    />
  );
}

export function ZenkaiBrandInline({ className, ...props }: ZenkaiBrandProps & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <ZenkaiBrand
      className={cn("font-inherit", className)}
      inline={true}
      {...props}
    />
  );
}