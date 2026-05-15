import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-3',
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Cargando"
      className={cn(
        'inline-block rounded-full border-transparent animate-spin',
        'border-t-[var(--color-secondary)] border-l-[var(--color-secondary)]',
        sizeMap[size],
        className,
      )}
      style={{
        borderTopColor: 'var(--color-secondary)',
        borderLeftColor: 'var(--color-secondary)',
        borderRightColor: 'transparent',
        borderBottomColor: 'transparent',
        borderStyle: 'solid',
      }}
    />
  )
}
