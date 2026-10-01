import { useAccount } from 'wagmi'
import { ChevronRight, Clock, Milestone } from 'lucide-react'
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
      className="w-full rounded-2xl border p-5 text-left transition-all hover:shadow-md group"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center gap-4">
        {/* Left: title + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-base font-semibold truncate" style={{ color: 'var(--ink)' }}>
              {agreement.title}
            </span>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <AgreementBadge status={agreement.status} />
            <span
              className="text-xs px-2 py-0.5 rounded-md font-medium"
              style={{ background: 'var(--surface-muted)', color: 'var(--subtle)' }}
            >
              {isClient ? 'Client' : 'Contributor'}
            </span>
            <span className="text-xs flex items-center gap-1" style={{ color: 'var(--subtle)' }}>
              <Clock className="size-3" />
              {formatRelativeTime(agreement.createdAt)}
            </span>
            <span className="text-xs flex items-center gap-1" style={{ color: 'var(--subtle)' }}>
              <Milestone className="size-3" />
              {Number(agreement.milestoneCount)} milestone{Number(agreement.milestoneCount) !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Progress bar (active/completed) */}
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
        </div>

        {/* Right: value + chevron */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5 mb-0.5">
              <TokenUSDC variant="branded" size={14} />
              <span className="display text-lg font-700 tabular-nums" style={{ color: 'var(--ink)' }}>
                {formatUsdc(agreement.totalAmount)}
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--subtle)' }}>USDC</p>
          </div>
          <ChevronRight
            className="size-5 transition-transform group-hover:translate-x-0.5"
            style={{ color: 'var(--border-strong)' }}
          />
        </div>
      </div>
    </button>
  )
}
