import { useState } from 'react'
import { useAccount } from 'wagmi'
import { PlusCircle, Search, FileText, SlidersHorizontal } from 'lucide-react'
import { AppView, AgreementStatus } from '@/types'
import { WalletGate } from '@/components/WalletGate'
import { AgreementCard } from '@/components/AgreementCard'
import { EmptyState } from '@/components/EmptyState'
import { useClientAgreements, useContributorAgreements, useAgreements } from '@/hooks/useFlowWork'

interface AgreementListProps {
  onNav: (v: AppView) => void
  onSelectAgreement: (id: bigint) => void
}

type FilterTab = 'all' | 'as-client' | 'as-contributor'
type StatusFilter = 'all' | 'active' | 'completed' | 'disputed' | 'open'

export function AgreementList({ onNav, onSelectAgreement }: AgreementListProps) {
  const { address } = useAccount()
  const [tab, setTab] = useState<FilterTab>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')

  const { data: clientIds = [] } = useClientAgreements(address)
  const { data: contributorIds = [] } = useContributorAgreements(address)

  const idsForTab: bigint[] =
    tab === 'as-client'
      ? (clientIds as bigint[])
      : tab === 'as-contributor'
        ? (contributorIds as bigint[])
        : [...new Set([...(clientIds as bigint[]), ...(contributorIds as bigint[])])]

  const { data: agreements = [] } = useAgreements(idsForTab)

  const filtered = agreements.filter((a) => {
    if (statusFilter === 'active' && a.status !== AgreementStatus.Active) return false
    if (statusFilter === 'completed' && a.status !== AgreementStatus.Completed) return false
    if (statusFilter === 'disputed' && a.status !== AgreementStatus.Disputed) return false
    if (statusFilter === 'open' && a.status !== AgreementStatus.Open) return false
    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const sorted = filtered.slice().sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))

  // Count by status
  const counts = {
    all: agreements.length,
    active: agreements.filter((a) => a.status === AgreementStatus.Active).length,
    open: agreements.filter((a) => a.status === AgreementStatus.Open).length,
    completed: agreements.filter((a) => a.status === AgreementStatus.Completed).length,
    disputed: agreements.filter((a) => a.status === AgreementStatus.Disputed).length,
  }

  return (
    <WalletGate>
      <div className="px-6 xl:px-10 py-8 pb-24 lg:pb-10 max-w-screen-2xl">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-6 mb-8">
          <div>
            <h1 className="display text-3xl font-700 mb-1" style={{ color: 'var(--ink)', letterSpacing: '-0.03em' }}>
              Agreements
            </h1>
            <p className="text-base" style={{ color: 'var(--muted)' }}>
              {agreements.length} agreement{agreements.length !== 1 ? 's' : ''} total
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

        {/* ── Filters bar ─────────────────────────────────────────── */}
        <div
          className="rounded-2xl border p-4 mb-6"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4" style={{ color: 'var(--subtle)' }} />
              <input
                type="text"
                className="input-field w-full pl-10"
                placeholder="Search agreements by title…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Role tab */}
            <div
              className="flex rounded-xl p-1 gap-0.5 flex-shrink-0"
              style={{ background: 'var(--surface-muted)' }}
            >
              {(['all', 'as-client', 'as-contributor'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: tab === t ? 'var(--surface-strong)' : 'transparent',
                    color: tab === t ? 'var(--ink)' : 'var(--subtle)',
                    boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                  }}
                >
                  {t === 'all' ? 'All roles' : t === 'as-client' ? 'As client' : 'As contributor'}
                </button>
              ))}
            </div>

            {/* Status dropdown */}
            <div className="relative flex-shrink-0">
              <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 size-4 pointer-events-none" style={{ color: 'var(--subtle)' }} />
              <select
                className="input-field pl-9 pr-4 appearance-none cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              >
                <option value="all">All statuses ({counts.all})</option>
                <option value="open">Open ({counts.open})</option>
                <option value="active">Active ({counts.active})</option>
                <option value="completed">Completed ({counts.completed})</option>
                <option value="disputed">Disputed ({counts.disputed})</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── List ────────────────────────────────────────────────── */}
        {sorted.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={search || statusFilter !== 'all' ? 'No results' : 'No agreements yet'}
            description={
              search || statusFilter !== 'all'
                ? 'Try adjusting the filters or search term.'
                : 'Create a work agreement to start collaborating with verifiable onchain milestones.'
            }
            action={
              !search && statusFilter === 'all'
                ? { label: 'Create agreement', onClick: () => onNav('create') }
                : undefined
            }
          />
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-medium" style={{ color: 'var(--subtle)' }}>
              {sorted.length} result{sorted.length !== 1 ? 's' : ''}
              {(search || statusFilter !== 'all' || tab !== 'all') ? ' (filtered)' : ''}
            </p>
            {sorted.map((a) => (
              <AgreementCard
                key={String(a.id)}
                agreement={a}
                onClick={() => onSelectAgreement(a.id)}
              />
            ))}
          </div>
        )}
      </div>
    </WalletGate>
  )
}
