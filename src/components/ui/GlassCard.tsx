import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  animate?: boolean
  delay?: number
}

export function GlassCard({ children, className, animate = true, delay = 0 }: GlassCardProps) {
  const Component = animate ? motion.div : 'div'
  
  const animateProps = animate ? {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-50px" },
    transition: { duration: 0.5, delay }
  } : {}
  
  return (
    <Component
      {...animateProps}
      className={cn(
        "glass-card rounded-xl overflow-hidden",
        className
      )}
    >
      {children}
    </Component>
  )
}