import { MorphingSquare } from "./morphing-square"

interface LoadingScreenProps {
  message?: string
}

export function LoadingScreen({ message }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <MorphingSquare 
        message={message} 
        messagePlacement="bottom"
        className="w-12 h-12"
      />
    </div>
  )
}