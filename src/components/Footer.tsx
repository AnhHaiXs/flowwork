import { ExternalLink, Github, Twitter, Shield, FileText, Zap } from 'lucide-react'
import { AppView } from '@/types'
import { FLOWWORK_ADDRESS, ARC_TESTNET_CHAIN_ID } from '@/contract'
import { buildAddressExplorerUrl } from '@/onchain-facts'

interface FooterProps {
  onNav: (v: AppView) => void
}

const YEAR = new Date().getFullYear()

export function Footer({ onNav }: FooterProps) {
  return (
    <footer
      className="hidden md:block border-t mt-auto"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      {/* ── Main columns ─────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-4 gap-10">

          {/* Col 1 — Brand */}
          <div className="col-span-1 space-y-4">
            <button
              onClick={() => onNav('dashboard')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div
                className="size-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--accent)' }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7L5 10L12 3" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="display text-base font-700" style={{ color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                FlowWork
              </span>
            </button>

            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
              Milestone-based freelance escrow with onchain verification. Built on Arc, powered by USDC.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://github.com/AnhHaiXs/flowwork"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="size-8 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
                style={{ background: 'var(--surface-muted)', color: 'var(--muted)' }}
              >
                <Github className="size-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter / X"
                className="size-8 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
                style={{ background: 'var(--surface-muted)', color: 'var(--muted)' }}
              >
                <Twitter className="size-4" />
              </a>
            </div>
          </div>

          {/* Col 2 — Product */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--subtle)' }}>
              Product
            </p>
            <ul className="space-y-2.5">
              {[
                { label: 'Overview', view: 'dashboard' as AppView },
                { label: 'Agreements', view: 'agreements' as AppView },
                { label: 'New agreement', view: 'create' as AppView },
                { label: 'My profile', view: 'profile' as AppView },
              ].map(({ label, view }) => (
                <li key={view}>
                  <button
                    onClick={() => onNav(view)}
                    className="text-sm hover:opacity-80 transition-opacity text-left"
                    style={{ color: 'var(--muted)' }}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Resources */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--subtle)' }}>
              Resources
            </p>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="https://docs.arc.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--muted)' }}
                >
                  <Zap className="size-3.5 flex-shrink-0" />
                  Arc Docs
                  <ExternalLink className="size-3 opacity-50" />
                </a>
              </li>
              <li>
                <a
                  href="https://developers.circle.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--muted)' }}
                >
                  <Shield className="size-3.5 flex-shrink-0" />
                  Circle Dev Docs
                  <ExternalLink className="size-3 opacity-50" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/AnhHaiXs/flowwork"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--muted)' }}
                >
                  <Github className="size-3.5 flex-shrink-0" />
                  Source Code
                  <ExternalLink className="size-3 opacity-50" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/AnhHaiXs/flowwork/tree/main/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--muted)' }}
                >
                  <FileText className="size-3.5 flex-shrink-0" />
                  Documentation
                  <ExternalLink className="size-3 opacity-50" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4 — Onchain */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--subtle)' }}>
              Onchain
            </p>
            <ul className="space-y-3">
              <li>
                <p className="text-xs mb-1" style={{ color: 'var(--subtle)' }}>FlowWork Contract</p>
                <a
                  href={buildAddressExplorerUrl(ARC_TESTNET_CHAIN_ID, FLOWWORK_ADDRESS)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mono text-xs flex items-center gap-1 hover:opacity-70 transition-opacity break-all"
                  style={{ color: 'var(--muted)' }}
                >
                  {FLOWWORK_ADDRESS.slice(0, 10)}…{FLOWWORK_ADDRESS.slice(-8)}
                  <ExternalLink className="size-3 flex-shrink-0 opacity-60" />
                </a>
              </li>
              <li>
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg w-fit"
                  style={{ background: 'var(--status-active-bg)' }}
                >
                  <div
                    className="size-1.5 rounded-full animate-pulse"
                    style={{ background: 'var(--status-active)' }}
                  />
                  <span className="text-xs font-medium" style={{ color: 'var(--status-active)' }}>
                    Arc Testnet
                  </span>
                </div>
              </li>
              <li>
                <a
                  href="https://scan.arc.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--muted)' }}
                >
                  ArcScan Explorer
                  <ExternalLink className="size-3 opacity-50" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ───────────────────────────────────────── */}
      <div
        className="border-t"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-xs" style={{ color: 'var(--subtle)' }}>
            © {YEAR} FlowWork. Built on{' '}
            <a
              href="https://arc.io"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity underline underline-offset-2"
              style={{ color: 'var(--muted)' }}
            >
              Arc
            </a>
            {' '}with{' '}
            <a
              href="https://www.circle.com/usdc"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity underline underline-offset-2"
              style={{ color: 'var(--muted)' }}
            >
              Circle USDC
            </a>
            .
          </p>

          <div className="flex items-center gap-4">
            <span className="text-xs" style={{ color: 'var(--subtle)' }}>
              Testnet — not for production use
            </span>
            <div
              className="flex items-center gap-1.5 px-2 py-1 rounded-md"
              style={{ background: 'var(--surface-muted)' }}
            >
              <Shield className="size-3" style={{ color: 'var(--subtle)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--subtle)' }}>
                Non-custodial
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
