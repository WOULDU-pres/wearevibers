import React, { useState } from "react"
import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  value: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  activeItem: string
  onItemChange: (value: string) => void
  className?: string
}

export function NavBar({ items, activeItem, onItemChange, className }: NavBarProps) {
  const [_isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div
      className={cn(
        "flex justify-center w-full z-10",
        className,
      )}
    >
      <div className="flex items-center gap-1 sm:gap-2 md:gap-3 bg-background/5 border border-border backdrop-blur-lg py-1 px-1 rounded-full shadow-lg">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.value

          return (
            <button
              key={item.value}
              onClick={() => onItemChange(item.value)}
              className={cn(
                "relative cursor-pointer text-sm font-semibold rounded-full transition-colors",
                "text-foreground/80 hover:text-primary",
                "px-6 py-2 md:px-6", // 데스크톱: 기본 패딩
                "sm:px-3 sm:py-2", // 모바일: 줄어든 패딩
                isActive && "bg-muted text-primary",
              )}
            >
              {/* 데스크톱: 전체 텍스트 */}
              <span className="hidden md:inline">{item.name}</span>
              {/* 모바일: 아이콘 + 축약 텍스트 */}
              <span className="md:hidden flex items-center gap-1.5">
                <Icon size={16} strokeWidth={2.5} />
                <span className="text-xs font-medium">
                  {item.name === "전체" ? "전체" :
                   item.name === "프론트엔드" ? "프론트" :
                   item.name === "백엔드" ? "백엔드" :
                   item.name === "모바일" ? "모바일" :
                   item.name === "디자인" ? "디자인" :
                   item.name === "AI/ML" ? "AI" :
                   item.name}
                </span>
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-primary/5 rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
                    <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
