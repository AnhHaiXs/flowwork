import { useTheme } from '@/hooks/useTheme'
import { Sun, Moon } from 'lucide-react'

interface ThemeToggleProps {
  /** When true renders as a compact icon-only button (for header) */
  compact?: boolean
}

export function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  if (compact) {
    return (
      <button
        onClick={toggle}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Light mode' : 'Dark mode'}
        className="relative flex items-center justify-center size-8 rounded-lg transition-colors"
        style={{
          background: 'var(--surface-muted)',
          color: 'var(--muted)',
          border: '1px solid var(--border)',
        }}
      >
        {isDark ? (
          <Sun className="size-4" strokeWidth={2} />
        ) : (
          <Moon className="size-4" strokeWidth={2} />
        )}
      </button>
    )
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors"
      style={{
        background: 'var(--surface-muted)',
        color: 'var(--muted)',
        border: '1px solid var(--border)',
      }}
    >
      {isDark ? (
        <>
          <Sun className="size-4" strokeWidth={2} />
          <span>Light</span>
        </>
      ) : (
        <>
          <Moon className="size-4" strokeWidth={2} />
          <span>Dark</span>
        </>
      )}
    </button>
  )
}
