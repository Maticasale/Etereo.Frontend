import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type CardVariant = 'default' | 'elevated' | 'flat'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white shadow-[var(--shadow-sm)] rounded-[var(--radius-md)]',
  elevated: 'bg-white shadow-[var(--shadow-md)] rounded-[var(--radius-md)]',
  flat: 'bg-white border border-[var(--color-neutral-light)] rounded-[var(--radius-md)]',
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('p-6', variantStyles[variant], className)}
        {...props}
      >
        {children}
      </div>
    )
  },
)

Card.displayName = 'Card'
