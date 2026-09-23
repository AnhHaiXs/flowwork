import { Loader2 } from 'lucide-react'
import { cn } from '@/utils'

interface TxButtonProps {
  onClick: () => void
  label: string
  pendingLabel?: string
  confirmingLabel?: string
  disabled?: boolean
  isPending?: boolean
  isConfirming?: boolean
  variant?: 'primary' | 'danger' | 'ghost' | 'outline'
  className?: string
  fullWidth?: boolean
}

export function TxButton({
  onClick,
  label,
  pendingLabel = 'Confirm in wallet…',
  confirmingLabel = 'Confirming…',
  disabled,
  isPending,
  isConfirming,
  variant = 'primary',
  className,
  fullWidth,
}: TxButtonProps) {
  const loading = isPending || isConfirming
  const isDisabled = disabled || loading

  const baseStyle = 'flex items-center justify-center gap-2 rounded-xl py-2.5 px-5 text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed'

  const variantStyle: Record<string, React.CSSProperties> = {
    primary: { background: 'var(--accent)', color: 'white' },
    danger: { background: 'var(--danger)', color: 'white' },
    ghost: { background: 'transparent', color: 'var(--muted)' },
    outline: { background: 'transparent', color: 'var(--accent)', border: '1px solid var(--border-strong)' },
  }

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={cn(baseStyle, fullWidth ? 'w-full' : '', className)}
      style={variantStyle[variant]}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {isPending ? pendingLabel : isConfirming ? confirmingLabel : label}
    </button>
  )
}
