import { useAccount } from 'wagmi'
import { PlusCircle, FileText, Clock } from 'lucide-react'
import { AppView } from '@/types'
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

  // Combine and deduplicate agreement IDs
  const allIds = [...new Set([...(clientIds as bigint[]), ...(contributorIds as bigint[])])]

  const { data: agreements = [] } = useAgreements(allIds)
  const { data: usdcBalance } = useUsdcBalance(address)

  // Stats
  const activeCount = agreements.filter((a) => a.status === 1).length
  const completedCount = agreements.filter((a) => a.status === 2).length
  const totalEscrowed = agreements
    .filter((a) => a.status === 0 || a.status === 1)
    .reduce((sum, a) => sum + a.totalAmount - a.releasedAmount, 0n)

  const recentAgreements = agreements
    .slice()
    .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))
    .slice(0, 3)

  return (
    <WalletGate>
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6 pb-24 lg:pb-8 space-y-6">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="display text-2xl font-700" style={{ color: 'var(--ink)', letterSpacing: '-0.02em' }}>
              Overview
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
              Track and manage your onchain work agreements
            </p>
          </div>
          <button
            onClick={() => onNav('create')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex-shrink-0"
            style={{ background: 'var(--accent)' }}
          >
            <PlusCircle className="size-4" />
            New agreement
          </button>
        </div>

        {/* ── Not deployed banner ────────────────────────────────── */}
        {!isDeployed && (
          <div
            className="rounded-2xl border p-4 flex gap-3"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div
              className="size-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(245,158,11,0.12)' }}
            >
              <Clock className="size-4" style={{ color: '#d97706' }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                Contract not yet deployed
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                Deploy the FlowWork contract to start creating agreements. All stats and data will appear here.
              </p>
            </div>
          </div>
        )}

        {/* ── Stats row ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="USDC Balance"
            value={usdcBalance !== undefined ? formatUsdc(usdcBalance) : '—'}
            sub="in your wallet"
            accent
          />
          <StatCard
            label="Active"
            value={String(activeCount)}
            sub="agreements"
          />
          <StatCard
            label="Completed"
            value={String(completedCount)}
            sub="agreements"
          />
          <StatCard
            label="In Escrow"
            value={formatUsdc(totalEscrowed)}
            sub="USDC locked"
          />
        </div>

        {/* ── Recent agreements ──────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold" style={{ color: 'var(--ink)' }}>Recent</h2>
            {agreements.length > 3 && (
              <button
                onClick={() => onNav('agreements')}
                className="text-sm font-medium"
                style={{ color: 'var(--accent-hover)' }}
              >
                View all
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
            <div className="space-y-2.5">
              {recentAgreements.map((a) => (
                <AgreementCard
                  key={String(a.id)}
                  agreement={a}
                  onClick={() => onSelectAgreement(a.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── How it works ───────────────────────────────────────── */}
        {agreements.length === 0 && (
          <div
            className="rounded-2xl border p-5 space-y-4"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <h2 className="text-base font-semibold" style={{ color: 'var(--ink)' }}>How FlowWork works</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { n: '1', title: 'Create', desc: 'Set milestones and lock USDC in escrow. Your contributor knows exactly what to deliver and when.' },
                { n: '2', title: 'Deliver', desc: 'The contributor submits a delivery hash onchain for each milestone — verifiable and immutable.' },
                { n: '3', title: 'Release', desc: 'You approve each milestone and USDC is released instantly to the contributor. Disputes go to an arbiter.' },
              ].map(({ n, title, desc }) => (
                <div key={n} className="flex gap-3">
                  <div
                    className="size-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
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
        )}
      </div>
    </WalletGate>
  )
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div
      className="rounded-2xl border p-4"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--subtle)' }}>
        {label}
      </p>
      <div className="flex items-baseline gap-1">
        {accent && <TokenUSDC variant="branded" size={14} />}
        <p className="display text-xl font-700 tabular-nums" style={{ color: 'var(--ink)', letterSpacing: '-0.02em' }}>
          {value}
        </p>
      </div>
      <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{sub}</p>
    </div>
  )
}
