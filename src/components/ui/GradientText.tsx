import { cn } from '../../lib/utils'

interface GradientTextProps {
  children: React.ReactNode
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span'
}

export function GradientText({ children, className, as: Component = 'span' }: GradientTextProps) {
  return (
    <Component className={cn("gradient-text", className)}>
      {children}
    </Component>
  )
}