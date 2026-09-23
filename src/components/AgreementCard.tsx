import { useAccount } from 'wagmi'
import { ChevronRight, Clock } from 'lucide-react'
import { Agreement, AgreementStatus } from '@/types'
import { AgreementBadge } from './StatusBadge'
import { formatUsdc, formatRelativeTime, progressPercent } from '@/utils'
import { TokenUSDC } from '@web3icons/react'

interface AgreementCardProps {
  agreement: Agreement
  onClick: () => void
}

export function AgreementCard({ agreement, onClick }: AgreementCardProps) {
  const { address } = useAccount()
  const isClient = agreement.client.toLowerCase() === address?.toLowerCase()
  const progress = progressPercent(agreement.releasedAmount, agreement.totalAmount)

  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl border p-4 text-left hover:shadow-sm transition-shadow group"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>
              {agreement.title}
            </span>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-2 flex-wrap">
            <AgreementBadge status={agreement.status} />
            <span
              className="text-xs px-1.5 py-0.5 rounded font-medium"
              style={{ background: 'var(--surface-muted)', color: 'var(--subtle)' }}
            >
              {isClient ? 'Client' : 'Contributor'}
            </span>
            <span className="text-xs flex items-center gap-1" style={{ color: 'var(--subtle)' }}>
              <Clock className="size-3" />
              {formatRelativeTime(agreement.createdAt)}
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-right">
            <div className="flex items-center justify-end gap-1">
              <TokenUSDC variant="branded" size={13} />
              <span className="display text-base font-700 tabular-nums" style={{ color: 'var(--ink)' }}>
                {formatUsdc(agreement.totalAmount)}
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--subtle)' }}>
              {Number(agreement.milestoneCount)} milestone{Number(agreement.milestoneCount) !== 1 ? 's' : ''}
            </p>
          </div>
          <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" style={{ color: 'var(--border-strong)' }} />
        </div>
      </div>

      {/* Progress bar (only for active/completed) */}
      {(agreement.status === AgreementStatus.Active || agreement.status === AgreementStatus.Completed) && (
        <div className="mt-3">
          <div className="h-1.5 rounded-full" style={{ background: 'var(--surface-muted)' }}>
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: progress === 100 ? 'var(--success)' : 'var(--accent)',
              }}
            />
          </div>
        </div>
      )}
    </button>
  )
}
