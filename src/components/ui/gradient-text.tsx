import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef } from "react";

export interface GradientTextProps extends ComponentPropsWithoutRef<"span"> {
  /**
   * Animation speed multiplier
   * @default 1
   */
  speed?: number;
  /**
   * Starting gradient color
   * @default "#ffaa40"
   */
  colorFrom?: string;
  /**
   * Middle/ending gradient color
   * @default "#9c40ff"
   */
  colorTo?: string;
  /**
   * Text size variant
   * @default "base"
   */
  size?: "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  /**
   * Whether to animate the gradient
   * @default true
   */
  animate?: boolean;
  /**
   * Gradient direction
   * @default "to-r"
   */
  direction?: "to-r" | "to-l" | "to-t" | "to-b" | "to-br" | "to-bl";
}

const sizeClasses = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
};

export function GradientText({
  children,
  className,
  speed = 1,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",
  size = "base",
  animate = true,
  direction = "to-r",
  ...props
}: GradientTextProps) {
  return (
    <span
      style={
        {
          "--bg-size": animate ? `${speed * 300}%` : "100%",
          "--color-from": colorFrom,
          "--color-to": colorTo,
        } as React.CSSProperties
      }
      className={cn(
        `inline font-semibold bg-gradient-${direction} from-[var(--color-from)] via-[var(--color-to)] to-[var(--color-from)] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`,
        animate && "animate-gradient",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/**
 * Preset gradient text variants for common use cases
 */
export const GradientTextPresets = {
  Hero: ({ children, className, ...props }: Omit<GradientTextProps, 'size' | 'colorFrom' | 'colorTo'>) => (
    <GradientText
      size="4xl"
      colorFrom="#ffaa40"
      colorTo="#9c40ff"
      className={cn("font-bold", className)}
      {...props}
    >
      {children}
    </GradientText>
  ),
  
  Heading: ({ children, className, ...props }: Omit<GradientTextProps, 'size'>) => (
    <GradientText
      size="2xl"
      className={cn("font-semibold", className)}
      {...props}
    >
      {children}
    </GradientText>
  ),
  
  Badge: ({ children, className, ...props }: Omit<GradientTextProps, 'size' | 'animate'>) => (
    <GradientText
      size="sm"
      animate={false}
      className={cn("font-medium", className)}
      {...props}
    >
      {children}
    </GradientText>
  ),
  
  Button: ({ children, className, ...props }: Omit<GradientTextProps, 'animate'>) => (
    <GradientText
      animate={false}
      className={cn("font-semibold", className)}
      {...props}
    >
      {children}
    </GradientText>
  ),
};