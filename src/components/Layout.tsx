import { LayoutDashboard, FileText, PlusCircle, User, Sun, Moon } from 'lucide-react'
import { ConnectKitButton } from 'connectkit'
import { AppView } from '@/types'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Footer } from '@/components/Footer'
import { useTheme } from '@/hooks/useTheme'

function MobileThemeToggleSlot() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'
  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex-1 flex flex-col items-center justify-center gap-0.5"
      style={{ color: 'var(--subtle)' }}
    >
      {isDark ? <Sun className="size-5" strokeWidth={2} /> : <Moon className="size-5" strokeWidth={2} />}
      <span className="text-xs font-medium">{isDark ? 'Light' : 'Dark'}</span>
    </button>
  )
}

interface LayoutProps {
  children: React.ReactNode
  view: AppView
  onNav: (v: AppView) => void
}

const NAV_ITEMS: { view: AppView; label: string; icon: typeof LayoutDashboard }[] = [
  { view: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { view: 'agreements', label: 'Agreements', icon: FileText },
  { view: 'create', label: 'New', icon: PlusCircle },
  { view: 'profile', label: 'Profile', icon: User },
]

export function Layout({ children, view, onNav }: LayoutProps) {
  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg-gradient)' }}>
      {/* ── Top bar ────────────────────────────────────────── */}
      <header
        className="fw-topbar sticky top-0 z-40 border-b"
        style={{
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 lg:px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <button
            onClick={() => onNav('dashboard')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div
              className="size-7 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--accent)' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7L5 10L12 3" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="display text-base font-700 hidden sm:block" style={{ color: 'var(--ink)', letterSpacing: '-0.02em' }}>
              FlowWork
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV_ITEMS.filter((i) => i.view !== 'create').map(({ view: v, label, icon: Icon }) => (
              <button
                key={v}
                onClick={() => onNav(v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  color: view === v || (view === 'detail' && v === 'agreements') ? 'var(--ink)' : 'var(--subtle)',
                  background: view === v || (view === 'detail' && v === 'agreements') ? 'var(--surface-muted)' : 'transparent',
                }}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </nav>

          {/* Right: theme toggle + connect + new */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNav('create')}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'var(--accent)', transition: 'background 0.22s ease' }}
            >
              <PlusCircle className="size-4" />
              New
            </button>
            <ThemeToggle compact />
            <ConnectKitButton />
          </div>
        </div>
      </header>

      {/* ── Main content ───────────────────────────────────── */}
      <main className="flex-1">{children}</main>

      {/* ── Footer (desktop only) ──────────────────────────── */}
      <Footer onNav={onNav} />

      {/* ── Mobile bottom nav ──────────────────────────────── */}
      <nav
        className="fw-mobile-nav fixed bottom-0 left-0 right-0 md:hidden border-t z-40"
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-stretch h-16">
          {NAV_ITEMS.map(({ view: v, label, icon: Icon }) => (
            <button
              key={v}
              onClick={() => onNav(v)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5"
              style={{
                color:
                  view === v || (view === 'detail' && v === 'agreements')
                    ? 'var(--accent)'
                    : 'var(--subtle)',
              }}
            >
              <Icon className="size-5" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
          {/* Theme toggle slot — rendered as a nav-style item on mobile */}
          <MobileThemeToggleSlot />
        </div>
      </nav>
    </div>
  )
}
