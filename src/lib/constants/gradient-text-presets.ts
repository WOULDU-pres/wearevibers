import { GradientTextProps } from "@/components/ui/gradient-text";

/**
 * Preset gradient text configurations for common use cases
 * GradientText 컴포넌트의 공통 사용 사례를 위한 프리셋 설정
 */
export const GradientTextPresets = {
  Hero: {
    size: "4xl" as const,
    colorFrom: "#ffaa40",
    colorTo: "#9c40ff",
    className: "font-bold"
  } satisfies Partial<GradientTextProps>,
  
  Heading: {
    size: "2xl" as const,
    className: "font-semibold"
  } satisfies Partial<GradientTextProps>,
  
  Badge: {
    size: "sm" as const,
    animate: false,
    className: "font-medium"
  } satisfies Partial<GradientTextProps>,
  
  Button: {
    animate: false,
    className: "font-semibold"
  } satisfies Partial<GradientTextProps>,
};