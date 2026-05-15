import * as RadixSelect from '@radix-ui/react-select'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label?: string
  placeholder?: string
  options: SelectOption[]
  value?: string
  onValueChange?: (value: string) => void
  error?: string
  disabled?: boolean
  className?: string
}

export function Select({
  label,
  placeholder = 'Seleccioná una opción',
  options,
  value,
  onValueChange,
  error,
  disabled,
  className,
}: SelectProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label && (
        <label className="text-sm font-medium font-[var(--font-body)] text-[var(--color-text-secondary)]">
          {label}
        </label>
      )}
      <RadixSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
        <RadixSelect.Trigger
          className={cn(
            'flex items-center justify-between w-full',
            'rounded-[var(--radius-md)] border px-3 py-2.5 text-sm',
            'font-[var(--font-body)] text-[var(--color-text-primary)]',
            'bg-white outline-none transition-colors duration-150',
            'border-[var(--color-neutral-light)]',
            'focus:border-[var(--color-secondary)] focus:ring-2 focus:ring-[var(--color-secondary)]/20',
            error && 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]/20',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'data-[placeholder]:text-[var(--color-text-muted)]',
          )}
        >
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon>
            <ChevronDown size={16} className="text-[var(--color-neutral)]" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content
            position="popper"
            sideOffset={4}
            className={cn(
              'z-50 min-w-[var(--radix-select-trigger-width)]',
              'bg-white rounded-[var(--radius-md)] shadow-[var(--shadow-md)]',
              'border border-[var(--color-neutral-light)]',
              'overflow-hidden',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            )}
          >
            <RadixSelect.Viewport className="p-1">
              {options.map((opt) => (
                <RadixSelect.Item
                  key={opt.value}
                  value={opt.value}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 text-sm rounded-[var(--radius-sm)]',
                    'font-[var(--font-body)] text-[var(--color-text-primary)]',
                    'cursor-pointer outline-none select-none',
                    'data-[highlighted]:bg-[var(--color-tertiary)]',
                    'data-[state=checked]:text-[var(--color-primary)] data-[state=checked]:font-semibold',
                  )}
                >
                  <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                  <RadixSelect.ItemIndicator className="ml-auto">
                    <Check size={14} />
                  </RadixSelect.ItemIndicator>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>

      {error && (
        <p className="text-xs text-[var(--color-error)] font-[var(--font-body)]">{error}</p>
      )}
    </div>
  )
}
