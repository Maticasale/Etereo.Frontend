import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s/g, '-')

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium font-[var(--font-body)] text-[var(--color-text-secondary)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral)] flex items-center">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-[var(--radius-md)] border px-3 py-2.5 text-sm',
              'font-[var(--font-body)] text-[var(--color-text-primary)]',
              'bg-white placeholder:text-[var(--color-text-muted)]',
              'outline-none transition-colors duration-150',
              'border-[var(--color-neutral-light)]',
              'focus:border-[var(--color-secondary)] focus:ring-2 focus:ring-[var(--color-secondary)]/20',
              error && 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]/20',
              leftIcon && 'pl-10',
              className,
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-[var(--color-error)] font-[var(--font-body)]">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-xs text-[var(--color-text-muted)] font-[var(--font-body)]">{helperText}</p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
