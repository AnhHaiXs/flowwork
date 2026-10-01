import { useAccount } from 'wagmi'
import { PlusCircle, FileText, Clock, TrendingUp, ArrowRight, CheckCircle2, Activity } from 'lucide-react'
import { AppView, AgreementStatus } from '@/types'
import { WalletGate } from '@/components/WalletGate'
import { AgreementCard } from '@/components/AgreementCard'
import { EmptyState } from '@/components/EmptyState'
import { useClientAgreements, useContributorAgreements, useAgreements, useUsdcBalance, useIsDeployed } from '@/hooks/useFlowWork'
import { formatUsdc } from '@/utils'
import { TokenUSDC } from '@web3icons/react'

interface DashboardProps {
  onNav: (v: AppView) => void
  onSelectAgreement: (id: bigint) => void
}

export function Dashboard({ onNav, onSelectAgreement }: DashboardProps) {
  const { address } = useAccount()
  const isDeployed = useIsDeployed()

  const { data: clientIds = [] } = useClientAgreements(address)
  const { data: contributorIds = [] } = useContributorAgreements(address)

  const allIds = [...new Set([...(clientIds as bigint[]), ...(contributorIds as bigint[])])]
  const { data: agreements = [] } = useAgreements(allIds)
  const { data: usdcBalance } = useUsdcBalance(address)

  const activeCount = agreements.filter((a) => a.status === AgreementStatus.Active).length
  const completedCount = agreements.filter((a) => a.status === AgreementStatus.Completed).length
  const openCount = agreements.filter((a) => a.status === AgreementStatus.Open).length
  const totalEscrowed = agreements
    .filter((a) => a.status === AgreementStatus.Open || a.status === AgreementStatus.Active)
    .reduce((sum, a) => sum + a.totalAmount - a.releasedAmount, 0n)

  const recentAgreements = agreements
    .slice()
    .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))
    .slice(0, 5)

  const activeAgreements = agreements.filter((a) => a.status === AgreementStatus.Active).slice(0, 3)

  return (
    <WalletGate>
      <div className="px-6 xl:px-10 py-8 pb-24 lg:pb-10 max-w-screen-2xl">

        {/* ── Page header ─────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-6 mb-8">
          <div>
            <h1 className="display text-3xl font-700 mb-1" style={{ color: 'var(--ink)', letterSpacing: '-0.03em' }}>
              Overview
            </h1>
            <p className="text-base" style={{ color: 'var(--muted)' }}>
              Track and manage your onchain work agreements
            </p>
          </div>
          <button
            onClick={() => onNav('create')}
            className="hidden lg:flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white flex-shrink-0"
            style={{ background: 'var(--accent)' }}
          >
            <PlusCircle className="size-4" />
            New agreement
          </button>
        </div>

        {/* ── Not deployed banner ─────────────────────────────────── */}
        {!isDeployed && (
          <div
            className="rounded-2xl border p-4 flex gap-3 mb-6"
            style={{ background: 'var(--surface)', borderColor: 'rgba(217,119,6,0.3)' }}
          >
            <div
              className="size-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(245,158,11,0.12)' }}
            >
              <Clock className="size-5" style={{ color: '#d97706' }} />
            </div>
            <div>
              <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--ink)' }}>
                Contract not yet deployed
              </p>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                Deploy the FlowWork contract to start creating agreements.
              </p>
            </div>
          </div>
        )}

        {/* ── Stats row ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="USDC Balance"
            value={usdcBalance !== undefined ? formatUsdc(usdcBalance) : '—'}
            sub="in wallet"
            icon={<TokenUSDC variant="branded" size={20} />}
            accent
          />
          <StatCard
            label="In Escrow"
            value={formatUsdc(totalEscrowed)}
            sub="USDC locked"
            icon={<div className="size-5 rounded-full flex items-center justify-center" style={{ background: 'var(--status-open-bg)' }}><TrendingUp className="size-3" style={{ color: 'var(--status-open)' }} /></div>}
          />
          <StatCard
            label="Active"
            value={String(activeCount)}
            sub={`${openCount} open`}
            icon={<div className="size-5 rounded-full flex items-center justify-center" style={{ background: 'var(--status-active-bg)' }}><Activity className="size-3" style={{ color: 'var(--status-active)' }} /></div>}
          />
          <StatCard
            label="Completed"
            value={String(completedCount)}
            sub="all time"
            icon={<div className="size-5 rounded-full flex items-center justify-center" style={{ background: 'var(--status-complete-bg)' }}><CheckCircle2 className="size-3" style={{ color: 'var(--success)' }} /></div>}
          />
        </div>

        {/* ── Main content: 2-col on large screens ───────────────── */}
        <div className="grid lg:grid-cols-5 gap-6">

          {/* Left: Recent agreements (3/5) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--ink)' }}>Recent agreements</h2>
              {agreements.length > 5 && (
                <button
                  onClick={() => onNav('agreements')}
                  className="flex items-center gap-1 text-sm font-medium"
                  style={{ color: 'var(--accent)' }}
                >
                  View all <ArrowRight className="size-4" />
                </button>
              )}
            </div>

            {recentAgreements.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No agreements yet"
                description="Create your first onchain work agreement with milestone-based USDC payments."
                action={{ label: 'Create agreement', onClick: () => onNav('create') }}
              />
            ) : (
              <div className="space-y-3">
                {recentAgreements.map((a) => (
                  <AgreementCard
                    key={String(a.id)}
                    agreement={a}
                    onClick={() => onSelectAgreement(a.id)}
                  />
                ))}
                {agreements.length > 5 && (
                  <button
                    onClick={() => onNav('agreements')}
                    className="w-full py-3 rounded-xl text-sm font-medium border transition-colors hover:opacity-70"
                    style={{ color: 'var(--muted)', borderColor: 'var(--border)', background: 'var(--surface)' }}
                  >
                    View all {agreements.length} agreements
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right: Active + How it works (2/5) */}
          <div className="lg:col-span-2 space-y-4">

            {/* Active agreements quick-view */}
            {activeAgreements.length > 0 && (
              <div
                className="rounded-2xl border p-5"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--ink)' }}>Active now</h2>
                <div className="space-y-3">
                  {activeAgreements.map((a) => {
                    const pct = a.totalAmount > 0n
                      ? Math.round(Number((a.releasedAmount * 100n) / a.totalAmount))
                      : 0
                    return (
                      <button
                        key={String(a.id)}
                        onClick={() => onSelectAgreement(a.id)}
                        className="w-full text-left group"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-medium truncate group-hover:opacity-70 transition-opacity" style={{ color: 'var(--ink)' }}>
                            {a.title}
                          </span>
                          <span className="text-xs ml-2 flex-shrink-0 tabular-nums" style={{ color: 'var(--muted)' }}>
                            {pct}%
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: 'var(--surface-muted)' }}>
                          <div
                            className="h-1.5 rounded-full transition-all"
                            style={{ width: `${pct}%`, background: 'var(--accent)' }}
                          />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* How it works */}
            <div
              className="rounded-2xl border p-5"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--ink)' }}>How FlowWork works</h2>
              <div className="space-y-4">
                {[
                  { n: '1', title: 'Create & Fund', desc: 'Lock USDC in escrow and define milestones. The contributor sees exactly what to deliver.' },
                  { n: '2', title: 'Deliver onchain', desc: 'Contributor submits a delivery hash for each milestone — immutable proof of completion.' },
                  { n: '3', title: 'Approve & Release', desc: 'Approve milestones to release USDC instantly. Disputes go to an arbiter.' },
                ].map(({ n, title, desc }) => (
                  <div key={n} className="flex gap-3">
                    <div
                      className="size-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                      style={{ background: 'var(--accent)' }}
                    >
                      {n}
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--ink)' }}>{title}</p>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </WalletGate>
  )
}

function StatCard({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string
  value: string
  sub: string
  icon?: React.ReactNode
  accent?: boolean
}) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
          {label}
        </p>
        {icon}
      </div>
      <p
        className="display text-3xl font-700 tabular-nums mb-0.5"
        style={{ color: accent ? 'var(--accent)' : 'var(--ink)', letterSpacing: '-0.03em' }}
      >
        {value}
      </p>
      <p className="text-xs" style={{ color: 'var(--subtle)' }}>{sub}</p>
    </div>
  )
}
