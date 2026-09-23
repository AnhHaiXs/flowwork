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
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div
        className="size-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'var(--surface-muted)', color: 'var(--subtle)' }}
      >
        <Icon className="size-7" />
      </div>
      <h3 className="text-base font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>
        {title}
      </h3>
      <p className="text-sm max-w-xs" style={{ color: 'var(--muted)' }}>
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'var(--accent)' }}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
