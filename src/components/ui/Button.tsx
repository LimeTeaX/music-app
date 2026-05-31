import { cn } from '../../lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'circular'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Button({ variant = 'primary', size = 'md', children, className, ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-accent hover:bg-accent-hover text-black font-bold',
    secondary: 'bg-bg-button hover:bg-bg-button-hover text-white font-bold',
    outline: 'bg-transparent border border-border-light text-white font-bold hover:border-white',
    circular: 'bg-white hover:scale-105 text-black rounded-full shadow-heavy',
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }
  
  const isCircular = variant === 'circular'
  
  return (
    <button
      className={cn(
        'transition-all duration-200',
        variants[variant],
        isCircular ? 'p-3 rounded-full' : sizes[size],
        'uppercase tracking-wide',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}