import { cn } from "@/lib/utils";
import { AnimatedList } from "@/components/ui/animated-list";

interface TechStack {
  name: string;
  category: string;
  icon: string;
  color: string;
  experience: string;
}

const techStacks: TechStack[] = [
  {
    name: "React",
    category: "Frontend Framework",
    icon: "⚛️",
    color: "#61DAFB",
    experience: "3년"
  },
  {
    name: "TypeScript",
    category: "Programming Language",
    icon: "🔷",
    color: "#3178C6",
    experience: "2년"
  },
  {
    name: "Next.js",
    category: "React Framework",
    icon: "▲",
    color: "#000000",
    experience: "2년"
  },
  {
    name: "Tailwind CSS",
    category: "CSS Framework",
    icon: "🎨",
    color: "#06B6D4",
    experience: "2년"
  },
  {
    name: "Node.js",
    category: "Backend Runtime",
    icon: "🟢",
    color: "#339933",
    experience: "3년"
  },
  {
    name: "Supabase",
    category: "Backend Platform",
    icon: "🚀",
    color: "#3ECF8E",
    experience: "1년"
  }
];

const TechStackItem = ({ name, category, icon, color, experience }: TechStack) => {
  return (
    <figure
      className={cn(
        "relative mx-auto min-h-fit w-full max-w-[300px] cursor-pointer overflow-hidden rounded-xl p-3",
        "transition-all duration-200 ease-in-out hover:scale-[103%]",
        "bg-white/80 backdrop-blur-sm [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
        "dark:bg-transparent dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]"
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <div
          className="flex size-8 items-center justify-center rounded-lg"
          style={{
            backgroundColor: `${color  }20`,
            border: `1px solid ${color}40`
          }}
        >
          <span className="text-sm">{icon}</span>
        </div>
        <div className="flex flex-col overflow-hidden flex-1">
          <div className="flex flex-row items-center justify-between">
            <figcaption className="text-sm font-semibold dark:text-white">
              {name}
            </figcaption>
            <span className="text-xs text-muted-foreground">{experience}</span>
          </div>
          <p className="text-xs font-normal text-muted-foreground dark:text-white/60">
            {category}
          </p>
        </div>
      </div>
    </figure>
  );
};

export function TechStackAnimatedList({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn(
      "relative flex h-[400px] w-full flex-col overflow-hidden rounded-lg",
      className,
    )}>
      <AnimatedList delay={1500}>
        {techStacks.map((item, idx) => (
          <TechStackItem {...item} key={idx} />
        ))}
      </AnimatedList>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-background"></div>
    </div>
  );
}