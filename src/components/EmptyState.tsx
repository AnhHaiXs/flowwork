import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      className="rounded-2xl border flex flex-col items-center justify-center py-20 px-6 text-center"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div
        className="size-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: 'var(--surface-muted)', color: 'var(--subtle)' }}
      >
        <Icon className="size-8" />
      </div>
      <h3 className="display text-lg font-700 mb-2" style={{ color: 'var(--ink)', letterSpacing: '-0.01em' }}>
        {title}
      </h3>
      <p className="text-sm max-w-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 px-6 py-3 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'var(--accent)' }}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
