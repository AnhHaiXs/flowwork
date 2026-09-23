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

  // Accept agreement
  const { writeContract: acceptAgreement, data: acceptHash, isPending: isAcceptPending, error: acceptError } = useWriteContract()
  const { isLoading: isAcceptConfirming, isSuccess: isAcceptSuccess } = useWaitForTransactionReceipt({ hash: acceptHash })

  // Cancel agreement
  const { writeContract: cancelAgreement, data: cancelHash, isPending: isCancelPending, error: cancelError } = useWriteContract()
  const { isLoading: isCancelConfirming, isSuccess: isCancelSuccess } = useWaitForTransactionReceipt({ hash: cancelHash })

  if (isAcceptSuccess) { toast.success('Agreement accepted — start delivering!'); refetchAgreement() }
  if (isCancelSuccess) { toast.success('Agreement cancelled — USDC refunded'); refetchAgreement() }
  if (acceptError) toast.error(parseOnchainError(acceptError))
  if (cancelError) toast.error(parseOnchainError(cancelError))

  function handleRefresh() {
    refetchAgreement()
    refetchMilestones()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="size-8 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: 'var(--accent)' }} />
      </div>
    )
  }

  if (!agreement) {
    return (
      <div className="max-w-2xl mx-auto px-4 lg:px-6 py-6">
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
      <div className="max-w-2xl mx-auto px-4 lg:px-6 py-6 pb-24 lg:pb-8 space-y-5">
        {/* Header */}
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm mb-4 -ml-1 p-1 rounded-lg hover:bg-black/5"
            style={{ color: 'var(--muted)' }}
          >
            <ArrowLeft className="size-4" /> All agreements
          </button>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="display text-xl font-700 mb-2" style={{ color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                {agreement.title}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <AgreementBadge status={agreement.status} size="md" />
                {isClient && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: 'var(--surface-muted)', color: 'var(--subtle)' }}
                  >
                    You are the client
                  </span>
                )}
                {isContributor && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: 'var(--surface-muted)', color: 'var(--subtle)' }}
                  >
                    You are the contributor
                  </span>
                )}
                {isArbiter && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: 'rgba(245,158,11,0.1)', color: '#d97706' }}
                  >
                    You are the arbiter
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Value card ─────────────────────────────────────── */}
        <div
          className="rounded-2xl border p-5"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--subtle)' }}>Total value</p>
              <div className="flex items-baseline gap-1">
                <TokenUSDC variant="branded" size={18} />
                <span className="display text-3xl font-700 tabular-nums" style={{ color: 'var(--ink)', letterSpacing: '-0.03em' }}>
                  {formatUsdc(agreement.totalAmount)}
                </span>
                <span className="text-base" style={{ color: 'var(--subtle)' }}>USDC</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--subtle)' }}>Released</p>
              <div className="flex items-baseline gap-1 justify-end">
                <span className="display text-lg font-700 tabular-nums" style={{ color: 'var(--ink)' }}>
                  {formatUsdc(agreement.releasedAmount)}
                </span>
                <span className="text-sm" style={{ color: 'var(--subtle)' }}>USDC</span>
              </div>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                {approvedMilestones}/{Number(agreement.milestoneCount)} milestones
              </p>
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="h-2 rounded-full" style={{ background: 'var(--surface-muted)' }}>
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  background: progress === 100 ? 'var(--success)' : 'var(--accent)',
                }}
              />
            </div>
            <p className="text-xs mt-1.5" style={{ color: 'var(--subtle)' }}>
              {progress}% complete
            </p>
          </div>
        </div>

        {/* ── Parties ────────────────────────────────────────── */}
        <div
          className="rounded-2xl border p-4 space-y-3"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <h2 className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Parties</h2>
          <AddressRow
            label="Client"
            address={agreement.client}
            isYou={isClient}
          />
          <AddressRow
            label="Contributor"
            address={agreement.contributor}
            isYou={isContributor}
          />
          {hasArbiter && (
            <AddressRow
              label="Arbiter"
              address={agreement.arbiter}
              isYou={isArbiter}
              icon={<Shield className="size-3.5" />}
            />
          )}

          {/* Dates */}
          <div className="pt-2 border-t flex flex-wrap gap-3" style={{ borderColor: 'var(--border)' }}>
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

        {/* ── Status callout ─────────────────────────────────── */}
        {agreement.status === AgreementStatus.Open && isContributor && (
          <div
            className="rounded-2xl border p-4 flex gap-3"
            style={{ background: 'rgba(26,128,71,0.05)', borderColor: 'rgba(26,128,71,0.25)' }}
          >
            <CheckCircle2 className="size-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--success)' }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Work offer waiting</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                Accept to confirm you will deliver the milestones below.
              </p>
            </div>
          </div>
        )}

        {agreement.status === AgreementStatus.Disputed && (
          <div
            className="rounded-2xl border p-4 flex gap-3"
            style={{ background: 'rgba(186,43,76,0.05)', borderColor: 'rgba(186,43,76,0.3)' }}
          >
            <AlertTriangle className="size-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--danger)' }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Dispute in progress</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                {hasArbiter
                  ? 'Waiting for the arbiter to resolve the disputed milestone.'
                  : 'No arbiter was set — contact the other party directly to resolve.'}
              </p>
            </div>
          </div>
        )}

        {agreement.status === AgreementStatus.Completed && (
          <div
            className="rounded-2xl border p-4 flex gap-3"
            style={{ background: 'rgba(26,128,71,0.05)', borderColor: 'rgba(26,128,71,0.25)' }}
          >
            <CheckCircle2 className="size-5 flex-shrink-0" style={{ color: 'var(--success)' }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--success)' }}>
                All milestones complete — {formatUsdc(agreement.totalAmount)} USDC paid
              </p>
            </div>
          </div>
        )}

        {agreement.status === AgreementStatus.Cancelled && (
          <div
            className="rounded-2xl border p-4 flex gap-3"
            style={{ background: 'var(--surface-muted)', borderColor: 'var(--border)' }}
          >
            <XCircle className="size-5 flex-shrink-0" style={{ color: 'var(--subtle)' }} />
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Cancelled — USDC refunded to client
            </p>
          </div>
        )}

        {/* ── Milestones ─────────────────────────────────────── */}
        <div>
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--ink)' }}>
            Milestones
          </h2>
          {milestones.length === 0 ? (
            <div className="text-sm" style={{ color: 'var(--muted)' }}>Loading milestones…</div>
          ) : (
            <div className="space-y-2.5">
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

        {/* ── Accept / Cancel actions ────────────────────────── */}
        {(canAccept || canCancel) && (
          <div className="flex gap-2">
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
          </div>
        )}

        {/* TX links */}
        {(acceptHash || cancelHash) && (
          <a
            href={buildTxExplorerUrl(ARC_TESTNET_CHAIN_ID, (acceptHash ?? cancelHash)!)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 text-xs"
            style={{ color: 'var(--success)' }}
          >
            <ExternalLink className="size-3" /> View on ArcScan
          </a>
        )}
      </div>
    </WalletGate>
  )
}

function AddressRow({
  label,
  address,
  isYou,
  icon,
}: {
  label: string
  address: string
  isYou: boolean
  icon?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3">
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
          <span
            className="text-xs px-1.5 py-0.5 rounded font-medium"
            style={{ background: 'var(--surface-muted)', color: 'var(--subtle)' }}
          >
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
