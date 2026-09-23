import { AgreementStatus, MilestoneStatus } from '@/types'

const AGREEMENT_CONFIG: Record<
  AgreementStatus,
  { label: string; bg: string; color: string }
> = {
  [AgreementStatus.Open]: {
    label: 'Open',
    bg: 'rgba(99,102,241,0.1)',
    color: '#6366f1',
  },
  [AgreementStatus.Active]: {
    label: 'Active',
    bg: 'rgba(26,128,71,0.1)',
    color: 'var(--success)',
  },
  [AgreementStatus.Completed]: {
    label: 'Completed',
    bg: 'rgba(26,128,71,0.12)',
    color: 'var(--success)',
  },
  [AgreementStatus.Cancelled]: {
    label: 'Cancelled',
    bg: 'var(--surface-muted)',
    color: 'var(--subtle)',
  },
  [AgreementStatus.Disputed]: {
    label: 'Disputed',
    bg: 'rgba(186,43,76,0.1)',
    color: 'var(--danger)',
  },
}

const MILESTONE_CONFIG: Record<
  MilestoneStatus,
  { label: string; bg: string; color: string }
> = {
  [MilestoneStatus.Pending]: {
    label: 'Pending',
    bg: 'var(--surface-muted)',
    color: 'var(--subtle)',
  },
  [MilestoneStatus.Submitted]: {
    label: 'Submitted',
    bg: 'rgba(99,102,241,0.1)',
    color: '#6366f1',
  },
  [MilestoneStatus.Approved]: {
    label: 'Approved',
    bg: 'rgba(26,128,71,0.1)',
    color: 'var(--success)',
  },
  [MilestoneStatus.Disputed]: {
    label: 'Disputed',
    bg: 'rgba(186,43,76,0.1)',
    color: 'var(--danger)',
  },
}

interface BadgeProps {
  size?: 'sm' | 'md'
}

export function AgreementBadge({
  status,
  size = 'sm',
}: BadgeProps & { status: AgreementStatus }) {
  const cfg = AGREEMENT_CONFIG[status]
  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${size === 'md' ? 'text-xs px-2.5 py-1' : 'text-xs px-2 py-0.5'}`}
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  )
}

export function MilestoneBadge({
  status,
  size = 'sm',
}: BadgeProps & { status: MilestoneStatus }) {
  const cfg = MILESTONE_CONFIG[status]
  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${size === 'md' ? 'text-xs px-2.5 py-1' : 'text-xs px-2 py-0.5'}`}
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  )
}
