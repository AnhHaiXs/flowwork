import { useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { ArrowLeft, ExternalLink, User, Calendar, Clock, AlertTriangle, CheckCircle2, XCircle, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { AppView, AgreementStatus, MilestoneStatus } from '@/types'
import { WalletGate } from '@/components/WalletGate'
import { AgreementBadge } from '@/components/StatusBadge'
import { MilestoneRow } from '@/components/MilestoneRow'
import { TxButton } from '@/components/TxButton'
import { useAgreement, useMilestones } from '@/hooks/useFlowWork'
import { FLOWWORK_ABI, FLOWWORK_ADDRESS, ARC_TESTNET_CHAIN_ID } from '@/contract'
import { formatUsdc, formatAddress, formatDate, progressPercent, parseOnchainError } from '@/utils'
import { buildTxExplorerUrl, buildAddressExplorerUrl } from '@/onchain-facts'
import { TokenUSDC } from '@web3icons/react'

interface AgreementDetailProps {
  agreementId: bigint
  onBack: () => void
  onNav: (v: AppView) => void
}

export function AgreementDetail({ agreementId, onBack, onNav: _onNav }: AgreementDetailProps) {
  const { address } = useAccount()

  const { data: agreement, refetch: refetchAgreement, isLoading } = useAgreement(agreementId)
  const { data: milestones, refetch: refetchMilestones } = useMilestones(agreementId)

  const isClient = agreement?.client.toLowerCase() === address?.toLowerCase()
  const isContributor = agreement?.contributor.toLowerCase() === address?.toLowerCase()
  const isArbiter = agreement?.arbiter.toLowerCase() === address?.toLowerCase()

  const canAccept = isContributor && agreement?.status === AgreementStatus.Open
  const canCancel = isClient && agreement?.status === AgreementStatus.Open

  const { writeContract: acceptAgreement, data: acceptHash, isPending: isAcceptPending, error: acceptError } = useWriteContract()
  const { isLoading: isAcceptConfirming, isSuccess: isAcceptSuccess } = useWaitForTransactionReceipt({ hash: acceptHash })

  const { writeContract: cancelAgreement, data: cancelHash, isPending: isCancelPending, error: cancelError } = useWriteContract()
  const { isLoading: isCancelConfirming, isSuccess: isCancelSuccess } = useWaitForTransactionReceipt({ hash: cancelHash })

  useEffect(() => {
    if (isAcceptSuccess) { toast.success('Agreement accepted — start delivering!'); void refetchAgreement() }
  }, [isAcceptSuccess]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isCancelSuccess) { toast.success('Agreement cancelled — USDC refunded'); void refetchAgreement() }
  }, [isCancelSuccess]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (acceptError) toast.error(parseOnchainError(acceptError))
  }, [acceptError])

  useEffect(() => {
    if (cancelError) toast.error(parseOnchainError(cancelError))
  }, [cancelError])

  function handleRefresh() {
    void refetchAgreement()
    void refetchMilestones()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="size-9 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: 'var(--accent)' }} />
      </div>
    )
  }

  if (!agreement) {
    return (
      <div className="px-6 xl:px-10 py-8">
        <button onClick={onBack} className="flex items-center gap-2 text-sm mb-4" style={{ color: 'var(--muted)' }}>
          <ArrowLeft className="size-4" /> Back
        </button>
        <p style={{ color: 'var(--muted)' }}>Agreement not found.</p>
      </div>
    )
  }

  const progress = progressPercent(agreement.releasedAmount, agreement.totalAmount)
  const approvedMilestones = milestones.filter((m) => m.status === MilestoneStatus.Approved).length
  const hasArbiter = agreement.arbiter !== '0x0000000000000000000000000000000000000000'

  return (
    <WalletGate>
      <div className="px-6 xl:px-10 py-8 pb-24 lg:pb-10 max-w-screen-xl">

        {/* ── Back + title ────────────────────────────────────────── */}
        <div className="mb-7">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm mb-4 -ml-1 px-2 py-1.5 rounded-lg hover:bg-black/5 transition-colors"
            style={{ color: 'var(--muted)' }}
          >
            <ArrowLeft className="size-4" /> All agreements
          </button>

          <div className="flex items-start gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <h1 className="display text-2xl xl:text-3xl font-700 mb-2.5" style={{ color: 'var(--ink)', letterSpacing: '-0.03em' }}>
                {agreement.title}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <AgreementBadge status={agreement.status} size="md" />
                {isClient && <RolePill label="You are the client" />}
                {isContributor && <RolePill label="You are the contributor" />}
                {isArbiter && <RolePill label="You are the arbiter" warning />}
              </div>
            </div>
          </div>
        </div>

        {/* ── 2-column desktop layout ─────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left: milestones (2/3) */}
          <div className="lg:col-span-2 space-y-5">

            {/* Status callouts */}
            {agreement.status === AgreementStatus.Open && isContributor && (
              <Callout
                icon={<CheckCircle2 className="size-5" style={{ color: 'var(--success)' }} />}
                title="Work offer waiting"
                desc="Accept to confirm you will deliver the milestones below."
                color="success"
              />
            )}
            {agreement.status === AgreementStatus.Disputed && (
              <Callout
                icon={<AlertTriangle className="size-5" style={{ color: 'var(--danger)' }} />}
                title="Dispute in progress"
                desc={hasArbiter
                  ? 'Waiting for the arbiter to resolve the disputed milestone.'
                  : 'No arbiter was set — contact the other party directly to resolve.'}
                color="danger"
              />
            )}
            {agreement.status === AgreementStatus.Completed && (
              <Callout
                icon={<CheckCircle2 className="size-5" style={{ color: 'var(--success)' }} />}
                title={`All milestones complete — ${formatUsdc(agreement.totalAmount)} USDC paid`}
                color="success"
              />
            )}
            {agreement.status === AgreementStatus.Cancelled && (
              <Callout
                icon={<XCircle className="size-5" style={{ color: 'var(--subtle)' }} />}
                title="Cancelled — USDC refunded to client"
                color="muted"
              />
            )}

            {/* Milestones */}
            <div
              className="rounded-2xl border"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                <h2 className="text-base font-semibold" style={{ color: 'var(--ink)' }}>
                  Milestones
                </h2>
                <span className="text-sm" style={{ color: 'var(--muted)' }}>
                  {approvedMilestones} / {Number(agreement.milestoneCount)} approved
                </span>
              </div>
              <div className="p-3">
                {milestones.length === 0 ? (
                  <p className="text-sm text-center py-8" style={{ color: 'var(--muted)' }}>Loading milestones…</p>
                ) : (
                  <div className="space-y-2">
                    {milestones.map((m, i) => (
                      <MilestoneRow
                        key={String(m.id)}
                        milestone={m}
                        index={i}
                        agreement={agreement}
                        onRefresh={handleRefresh}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: info + actions sidebar (1/3) */}
          <div className="space-y-4">

            {/* Value card */}
            <div
              className="rounded-2xl border p-5"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--subtle)' }}>Total value</p>
              <div className="flex items-baseline gap-1.5 mb-1">
                <TokenUSDC variant="branded" size={20} />
                <span className="display text-3xl font-700 tabular-nums" style={{ color: 'var(--ink)', letterSpacing: '-0.03em' }}>
                  {formatUsdc(agreement.totalAmount)}
                </span>
                <span className="text-base" style={{ color: 'var(--subtle)' }}>USDC</span>
              </div>
              <div className="flex items-center justify-between text-xs mb-3" style={{ color: 'var(--muted)' }}>
                <span>Released: {formatUsdc(agreement.releasedAmount)} USDC</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 rounded-full" style={{ background: 'var(--surface-muted)' }}>
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    background: progress === 100 ? 'var(--success)' : 'var(--accent)',
                  }}
                />
              </div>
            </div>

            {/* Parties */}
            <div
              className="rounded-2xl border p-4 space-y-3"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <h2 className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Parties</h2>
              <AddressRow label="Client" address={agreement.client} isYou={isClient} />
              <AddressRow label="Contributor" address={agreement.contributor} isYou={isContributor} />
              {hasArbiter && (
                <AddressRow label="Arbiter" address={agreement.arbiter} isYou={isArbiter} icon={<Shield className="size-3.5" />} />
              )}
              <div className="pt-2 border-t space-y-1.5" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--subtle)' }}>
                  <Clock className="size-3.5" />
                  <span>Created {formatDate(agreement.createdAt)}</span>
                </div>
                {agreement.deadline > 0n && (
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--subtle)' }}>
                    <Calendar className="size-3.5" />
                    <span>Deadline {formatDate(agreement.deadline)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Accept / Cancel */}
            {(canAccept || canCancel) && (
              <div
                className="rounded-2xl border p-4 space-y-2.5"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--ink)' }}>Actions</h2>
                {canAccept && (
                  <TxButton
                    label="Accept agreement"
                    isPending={isAcceptPending}
                    isConfirming={isAcceptConfirming}
                    onClick={() => acceptAgreement({
                      address: FLOWWORK_ADDRESS,
                      abi: FLOWWORK_ABI,
                      functionName: 'acceptAgreement',
                      args: [agreement.id],
                      chainId: ARC_TESTNET_CHAIN_ID,
                    })}
                    fullWidth
                  />
                )}
                {canCancel && (
                  <TxButton
                    label="Cancel & refund"
                    variant="outline"
                    isPending={isCancelPending}
                    isConfirming={isCancelConfirming}
                    onClick={() => cancelAgreement({
                      address: FLOWWORK_ADDRESS,
                      abi: FLOWWORK_ABI,
                      functionName: 'cancelAgreement',
                      args: [agreement.id],
                      chainId: ARC_TESTNET_CHAIN_ID,
                    })}
                    fullWidth
                  />
                )}
                {(acceptHash || cancelHash) && (
                  <a
                    href={buildTxExplorerUrl(ARC_TESTNET_CHAIN_ID, (acceptHash ?? cancelHash)!)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 text-xs pt-1"
                    style={{ color: 'var(--success)' }}
                  >
                    <ExternalLink className="size-3" /> View on ArcScan
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </WalletGate>
  )
}

function RolePill({ label, warning }: { label: string; warning?: boolean }) {
  return (
    <span
      className="text-xs px-2.5 py-1 rounded-full font-medium"
      style={{
        background: warning ? 'rgba(245,158,11,0.1)' : 'var(--surface-muted)',
        color: warning ? '#d97706' : 'var(--subtle)',
      }}
    >
      {label}
    </span>
  )
}

function Callout({ icon, title, desc, color }: {
  icon: React.ReactNode
  title: string
  desc?: string
  color: 'success' | 'danger' | 'muted'
}) {
  const bg = color === 'success' ? 'rgba(26,128,71,0.06)' : color === 'danger' ? 'rgba(186,43,76,0.06)' : 'var(--surface-muted)'
  const border = color === 'success' ? 'rgba(26,128,71,0.25)' : color === 'danger' ? 'rgba(186,43,76,0.3)' : 'var(--border)'
  return (
    <div
      className="rounded-2xl border p-4 flex gap-3"
      style={{ background: bg, borderColor: border }}
    >
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div>
        <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{title}</p>
        {desc && <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{desc}</p>}
      </div>
    </div>
  )
}

function AddressRow({ label, address, isYou, icon }: {
  label: string
  address: string
  isYou: boolean
  icon?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <div
          className="size-6 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--surface-muted)', color: 'var(--subtle)' }}
        >
          {icon ?? <User className="size-3.5" />}
        </div>
        <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        {isYou && (
          <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ background: 'var(--surface-muted)', color: 'var(--subtle)' }}>
            you
          </span>
        )}
        <a
          href={buildAddressExplorerUrl(ARC_TESTNET_CHAIN_ID, address)}
          target="_blank"
          rel="noopener noreferrer"
          className="mono text-xs flex items-center gap-1 hover:opacity-70"
          style={{ color: 'var(--ink-2)' }}
        >
          {formatAddress(address)}
          <ExternalLink className="size-3" />
        </a>
      </div>
    </div>
  )
}
