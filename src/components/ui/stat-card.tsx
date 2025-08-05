import { MagicCard } from "@/components/ui/magic-card";
import { CardContent } from "@/components/ui/card";
import NumberTicker from "@/components/ui/number-ticker";
import { cn } from "@/lib/utils";
import type { StatCardProps } from "@/types";

export const StatCard = ({ 
  title, 
  stats, 
  className,
  gradientColor = "#D9D9D955"
}: StatCardProps) => {
  return (
    <MagicCard className={cn("h-full", className)} gradientColor={gradientColor}>
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <div className="space-y-4">
          {stats.map((stat, index) => (
            <div key={index} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {stat.icon}
                <span className="text-muted-foreground">{stat.label}</span>
              </div>
              <NumberTicker 
                value={stat.value} 
                className={cn(
                  "text-2xl font-bold",
                  stat.color || "text-primary"
                )}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </MagicCard>
  );
};