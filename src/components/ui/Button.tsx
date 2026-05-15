import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Spinner } from './Spinner'

export type ButtonVariant = 'primary' | 'secondary' | 'outlined' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-[var(--color-primary)] text-[var(--color-tertiary)]
    hover:bg-[var(--color-primary-hover)]
    disabled:bg-[var(--color-neutral)] disabled:cursor-not-allowed
  `,
  secondary: `
    bg-[var(--color-secondary)] text-[var(--color-text-primary)]
    hover:bg-[var(--color-secondary-hover)]
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  outlined: `
    border border-[var(--color-primary)] text-[var(--color-primary)] bg-transparent
    hover:bg-[var(--color-primary)] hover:text-[var(--color-tertiary)]
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  ghost: `
    border-0 text-[var(--color-text-secondary)] bg-transparent
    hover:bg-[var(--color-neutral-light)]
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  danger: `
    bg-[var(--color-error)] text-white
    hover:opacity-90
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-[var(--radius-md)]',
          'transition-colors duration-150 outline-none focus-visible:ring-2',
          'focus-visible:ring-[var(--color-secondary)] focus-visible:ring-offset-1',
          'font-[var(--font-body)]',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {loading ? (
          <Spinner size={size === 'lg' ? 'md' : 'sm'} />
        ) : (
          leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    )
  },
)

Button.displayName = 'Button'
