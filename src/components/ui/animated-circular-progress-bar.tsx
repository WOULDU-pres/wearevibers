"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface AnimatedCircularProgressBarProps {
  max: number;
  min?: number;
  value: number;
  gaugePrimaryColor?: string;
  gaugeSecondaryColor?: string;
  className?: string;
}

export const AnimatedCircularProgressBar = ({
  max = 100,
  min = 0,
  value = 0,
  gaugePrimaryColor = "#9c40ff",
  gaugeSecondaryColor = "#d1d5db",
  className,
}: AnimatedCircularProgressBarProps) => {
  const [circumference, setCircumference] = useState(0);
  const radius = 45;
  const strokeWidth = 10;

  useEffect(() => {
    const circumference = 2 * Math.PI * radius;
    setCircumference(circumference);
  }, [radius]);

  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (((value - min) / (max - min)) * circumference);

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className="relative flex items-center justify-center">
        <svg
          width="120"
          height="120"
          className="rotate-[-90deg] transform"
        >
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke={gaugeSecondaryColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            className="drop-shadow-sm"
          />
          {/* Progress circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke={gaugePrimaryColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="drop-shadow-sm transition-all duration-300 ease-in-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold text-gray-700 dark:text-gray-200">
            {Math.round(((value - min) / (max - min)) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};