import { LayoutDashboard, FileText, PlusCircle, User, Sun, Moon, BookOpen, Zap } from 'lucide-react'
import { ConnectKitButton } from 'connectkit'
import { AppView } from '@/types'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Footer } from '@/components/Footer'
import { useTheme } from '@/hooks/useTheme'
import { FlowWorkLogo } from '@/components/FlowWorkLogo'

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
  { view: 'create', label: 'New agreement', icon: PlusCircle },
  { view: 'profile', label: 'Profile', icon: User },
  { view: 'docs', label: 'Docs', icon: BookOpen },
]

const MOBILE_NAV = NAV_ITEMS.filter((i) => i.view !== 'docs')

export function Layout({ children, view, onNav }: LayoutProps) {
  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg-gradient)' }}>

      {/* ── Mobile top bar ────────────────────────────────────────── */}
      <header
        className="fw-topbar lg:hidden sticky top-0 z-40 border-b"
        style={{
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="px-4 h-14 flex items-center justify-between gap-4">
          <button onClick={() => onNav('dashboard')} className="hover:opacity-80 transition-opacity">
            <FlowWorkLogo size="md" />
          </button>
          <div className="flex items-center gap-2">
            <ThemeToggle compact />
            <ConnectKitButton />
          </div>
        </div>
      </header>

      {/* ── Desktop shell ─────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-1 min-h-dvh">

        {/* Sidebar */}
        <aside
          className="w-60 xl:w-64 flex-shrink-0 flex flex-col sticky top-0 h-screen overflow-y-auto border-r"
          style={{
            background: 'var(--surface-strong)',
            borderColor: 'var(--border)',
          }}
        >
          {/* Logo */}
          <div className="px-5 pt-6 pb-4">
            <button onClick={() => onNav('dashboard')} className="hover:opacity-80 transition-opacity">
              <FlowWorkLogo size="md" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 space-y-0.5">
            {NAV_ITEMS.map(({ view: v, label, icon: Icon }) => {
              const isActive = view === v || (view === 'detail' && v === 'agreements')
              return (
                <button
                  key={v}
                  onClick={() => onNav(v)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-colors"
                  style={{
                    background: isActive ? 'var(--surface-muted)' : 'transparent',
                    color: isActive ? 'var(--ink)' : 'var(--muted)',
                  }}
                >
                  <Icon
                    className="size-4 flex-shrink-0"
                    style={{ color: isActive ? 'var(--accent)' : 'var(--subtle)' }}
                  />
                  {label}
                </button>
              )
            })}
          </nav>

          {/* Sidebar bottom */}
          <div
            className="px-3 py-4 border-t space-y-2"
            style={{ borderColor: 'var(--border)' }}
          >
            {/* New agreement CTA */}
            <button
              onClick={() => onNav('create')}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'var(--accent)' }}
            >
              <PlusCircle className="size-4" />
              New agreement
            </button>

            {/* Theme + Connect */}
            <div className="flex items-center gap-2 pt-1">
              <ThemeToggle compact />
              <div className="flex-1 min-w-0">
                <ConnectKitButton />
              </div>
            </div>

            {/* Network badge */}
            <div
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg"
              style={{ background: 'var(--status-active-bg)' }}
            >
              <Zap className="size-3 flex-shrink-0" style={{ color: 'var(--status-active)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--status-active)' }}>
                Arc Testnet
              </span>
              <div
                className="size-1.5 rounded-full animate-pulse ml-auto"
                style={{ background: 'var(--status-active)' }}
              />
            </div>
          </div>
        </aside>

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1">{children}</main>
          <Footer onNav={onNav} />
        </div>
      </div>

      {/* ── Mobile main content ───────────────────────────────────── */}
      <main className="lg:hidden flex-1">{children}</main>

      {/* ── Mobile bottom nav ──────────────────────────────────────── */}
      <nav
        className="fw-mobile-nav fixed bottom-0 left-0 right-0 lg:hidden border-t z-40"
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-stretch h-16">
          {MOBILE_NAV.map(({ view: v, label, icon: Icon }) => (
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
              <span className="text-xs font-medium">{label === 'New agreement' ? 'New' : label}</span>
            </button>
          ))}
          <MobileThemeToggleSlot />
        </div>
      </nav>
    </div>
  )
}
