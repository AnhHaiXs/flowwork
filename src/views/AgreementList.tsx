import { useState } from 'react'
import { useAccount } from 'wagmi'
import { PlusCircle, Search, FileText } from 'lucide-react'
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
type StatusFilter = 'all' | 'active' | 'completed' | 'disputed'

export function AgreementList({ onNav, onSelectAgreement }: AgreementListProps) {
  const { address } = useAccount()
  const [tab, setTab] = useState<FilterTab>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')

  const { data: clientIds = [], refetch: refetchClient } = useClientAgreements(address as `0x${string}` | undefined)
  const { data: contributorIds = [], refetch: refetchContributor } = useContributorAgreements(address as `0x${string}` | undefined)

  const idsForTab: bigint[] =
    tab === 'as-client'
      ? (clientIds as bigint[])
      : tab === 'as-contributor'
        ? (contributorIds as bigint[])
        : [...new Set([...(clientIds as bigint[]), ...(contributorIds as bigint[])])]

  const { data: agreements = [] } = useAgreements(idsForTab)

  // Filter
  const filtered = agreements.filter((a) => {
    if (statusFilter === 'active' && a.status !== AgreementStatus.Active) return false
    if (statusFilter === 'completed' && a.status !== AgreementStatus.Completed) return false
    if (statusFilter === 'disputed' && a.status !== AgreementStatus.Disputed) return false
    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const sorted = filtered.slice().sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))

  return (
    <WalletGate>
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6 pb-24 lg:pb-8 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="display text-2xl font-700" style={{ color: 'var(--ink)', letterSpacing: '-0.02em' }}>
              Agreements
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
              {agreements.length} agreement{agreements.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => onNav('create')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex-shrink-0"
            style={{ background: 'var(--accent)' }}
          >
            <PlusCircle className="size-4" />
            New
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex rounded-xl p-1 gap-1"
          style={{ background: 'var(--surface-muted)' }}
        >
          {(['all', 'as-client', 'as-contributor'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all"
              style={{
                background: tab === t ? 'var(--surface-strong)' : 'transparent',
                color: tab === t ? 'var(--ink)' : 'var(--subtle)',
                boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              {t === 'all' ? 'All' : t === 'as-client' ? 'As client' : 'As contributor'}
            </button>
          ))}
        </div>

        {/* Search + status filter row */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: 'var(--subtle)' }} />
            <input
              type="text"
              className="input-field w-full pl-9 text-sm"
              placeholder="Search by title…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input-field text-sm pr-8"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            style={{ minWidth: 'auto' }}
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="disputed">Disputed</option>
          </select>
        </div>

        {/* List */}
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
          <div className="space-y-2.5">
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
