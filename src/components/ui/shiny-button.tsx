"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ShinyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  children?: React.ReactNode;
}

const ShinyButton = forwardRef<HTMLButtonElement, ShinyButtonProps>(
  (
    {
      shimmerColor = "#ffffff",
      shimmerSize = "0.05em",
      shimmerDuration = "3s",
      borderRadius = "0.5rem",
      background = "rgba(0, 0, 0, 1)",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        style={
          {
            "--spread": "90deg",
            "--shimmer-color": shimmerColor,
            "--radius": borderRadius,
            "--speed": shimmerDuration,
            "--cut": shimmerSize,
            "--bg": background,
          } as React.CSSProperties
        }
        className={cn(
          "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-white/10 px-6 py-3 text-white [background:var(--bg)] [border-radius:var(--radius)] dark:text-black",
          "transform-gpu transition-transform duration-300 ease-in-out active:translate-y-[1px]",
          className,
        )}
        ref={ref}
        {...props}
      >
        {/* spark container */}
        <div
          className={cn(
            "-z-30 blur-[2px]",
            "absolute inset-0 overflow-visible [container-type:size]",
          )}
        >
          {/* spark */}
          <div className="absolute inset-0 h-[100cqh] animate-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
            {/* spark before */}
            <div className="animate-spin-around absolute inset-[-100%] w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
          </div>
        </div>
        {children}

        {/* Highlight */}
        <div
          className={cn(
            "insert-0 absolute h-full w-full",
            "rounded-2xl px-4 py-1.5 text-sm font-medium shadow-[inset_0_1px_0_theme(colors.white/15%)] after:absolute after:inset-0 after:-z-10 after:rounded-[7px] after:bg-white/20 after:backdrop-blur-xl",
            "transform-gpu transition-all duration-300 ease-in-out group-hover:shadow-[inset_0_1px_0_theme(colors.white/10%),0_0_0_1px_theme(colors.white/20%)] group-active:bg-white/10",
            "dark:shadow-[inset_0_1px_0_theme(colors.white/15%)] dark:after:bg-white/20 dark:group-hover:shadow-[inset_0_1px_0_theme(colors.white/10%),0_0_0_1px_theme(colors.white/20%)] dark:group-active:bg-white/10",
          )}
        />
      </button>
    );
  },
);

ShinyButton.displayName = "ShinyButton";

export { ShinyButton };