import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CheckCircle2, AlertTriangle, ExternalLink, ChevronDown, ChevronUp, Link } from 'lucide-react'
import { toast } from 'sonner'
import { Agreement, Milestone, AgreementStatus, MilestoneStatus } from '@/types'
import { MilestoneBadge } from './StatusBadge'
import { TxButton } from './TxButton'
import { FLOWWORK_ABI, FLOWWORK_ADDRESS, ARC_TESTNET_CHAIN_ID } from '@/contract'
import { formatUsdc, formatDate, encodeDeliveryHash, isValidDeliveryHash } from '@/utils'
import { buildTxExplorerUrl } from '@/onchain-facts'
import { TokenUSDC } from '@web3icons/react'

interface MilestoneRowProps {
  milestone: Milestone
  index: number
  agreement: Agreement
  onRefresh: () => void
}

export function MilestoneRow({ milestone, index, agreement, onRefresh }: MilestoneRowProps) {
  const { address } = useAccount()
  const [expanded, setExpanded] = useState(false)
  const [deliveryInput, setDeliveryInput] = useState('')

  const isClient = agreement.client.toLowerCase() === address?.toLowerCase()
  const isContributor = agreement.contributor.toLowerCase() === address?.toLowerCase()
  const isActive = agreement.status === AgreementStatus.Active

  const canSubmit = isContributor && isActive && milestone.status === MilestoneStatus.Pending
  const canApprove = isClient && isActive && (milestone.status === MilestoneStatus.Submitted || milestone.status === MilestoneStatus.Disputed)
  const canDispute = isClient && isActive && milestone.status === MilestoneStatus.Submitted

  // Submit delivery
  const { writeContract: submitDelivery, data: submitHash, isPending: isSubmitPending } = useWriteContract()
  const { isLoading: isSubmitConfirming, isSuccess: isSubmitSuccess } = useWaitForTransactionReceipt({ hash: submitHash })

  // Approve milestone
  const { writeContract: approveMilestone, data: approveHash, isPending: isApprovePending } = useWriteContract()
  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash })

  // Dispute milestone
  const { writeContract: disputeMilestone, data: disputeHash, isPending: isDisputePending } = useWriteContract()
  const { isLoading: isDisputeConfirming, isSuccess: isDisputeSuccess } = useWaitForTransactionReceipt({ hash: disputeHash })

  if (isSubmitSuccess) {
    toast.success('Delivery submitted — awaiting client review')
    setDeliveryInput('')
    onRefresh()
  }
  if (isApproveSuccess) {
    toast.success(`Milestone approved — ${formatUsdc(milestone.amount)} USDC released`)
    onRefresh()
  }
  if (isDisputeSuccess) {
    toast('Milestone disputed — arbiter notified')
    onRefresh()
  }

  const deliveryHashHex = milestone.deliveryHash
  const hasDelivery = deliveryHashHex && deliveryHashHex !== '0x0000000000000000000000000000000000000000000000000000000000000000'

  function handleSubmit() {
    if (!isValidDeliveryHash(deliveryInput)) return
    const hash = encodeDeliveryHash(deliveryInput)
    submitDelivery({
      address: FLOWWORK_ADDRESS,
      abi: FLOWWORK_ABI,
      functionName: 'submitDelivery',
      args: [agreement.id, BigInt(index), hash],
      chainId: ARC_TESTNET_CHAIN_ID,
    })
  }

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        background: 'var(--surface)',
        borderColor: milestone.status === MilestoneStatus.Disputed ? 'rgba(186,43,76,0.4)' : milestone.status === MilestoneStatus.Approved ? 'rgba(26,128,71,0.4)' : 'var(--border)',
      }}
    >
      {/* Header row */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        {/* Status icon */}
        <div
          className="size-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
          style={{
            background: milestone.status === MilestoneStatus.Approved ? 'var(--status-active-bg)' : 'var(--surface-muted)',
            color: milestone.status === MilestoneStatus.Approved ? 'var(--success)' : 'var(--subtle)',
          }}
        >
          {milestone.status === MilestoneStatus.Approved ? (
            <CheckCircle2 className="size-4" style={{ color: 'var(--success)' }} />
          ) : milestone.status === MilestoneStatus.Disputed ? (
            <AlertTriangle className="size-4" style={{ color: 'var(--danger)' }} />
          ) : (
            index + 1
          )}
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: 'var(--ink)' }}>
            {milestone.title}
          </p>
        </div>

        {/* Amount + badge */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1">
            <TokenUSDC variant="branded" size={13} />
            <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--ink)' }}>
              {formatUsdc(milestone.amount)}
            </span>
          </div>
          <MilestoneBadge status={milestone.status} />
          {expanded ? (
            <ChevronUp className="size-4" style={{ color: 'var(--border-strong)' }} />
          ) : (
            <ChevronDown className="size-4" style={{ color: 'var(--border-strong)' }} />
          )}
        </div>
      </button>

      {/* Expanded section */}
      {expanded && (
        <div className="px-4 pb-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="pt-3 space-y-3">
            {/* Delivery hash (if submitted) */}
            {hasDelivery && (
              <div
                className="flex items-start gap-2 rounded-lg px-3 py-2.5"
                style={{ background: 'var(--surface-muted)' }}
              >
                <Link className="size-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--muted)' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs mb-0.5" style={{ color: 'var(--subtle)' }}>Delivery hash (onchain)</p>
                  <p className="mono text-xs break-all" style={{ color: 'var(--ink)' }}>
                    {deliveryHashHex}
                  </p>
                  {milestone.submittedAt > 0n && (
                    <p className="text-xs mt-1" style={{ color: 'var(--subtle)' }}>
                      Submitted {formatDate(milestone.submittedAt)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Approved timestamp */}
            {milestone.status === MilestoneStatus.Approved && milestone.approvedAt > 0n && (
              <p className="text-xs" style={{ color: 'var(--success)' }}>
                Approved and paid {formatDate(milestone.approvedAt)}
              </p>
            )}

            {/* Contributor: submit delivery */}
            {canSubmit && (
              <div className="space-y-2">
                <p className="text-xs font-medium" style={{ color: 'var(--ink)' }}>Submit your delivery</p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  Paste a URL, IPFS CID, or description. It will be hashed and stored onchain.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input-field flex-1 text-sm"
                    placeholder="https://... or IPFS CID or description"
                    value={deliveryInput}
                    onChange={(e) => setDeliveryInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  />
                  <TxButton
                    label="Submit"
                    isPending={isSubmitPending}
                    isConfirming={isSubmitConfirming}
                    disabled={!isValidDeliveryHash(deliveryInput)}
                    onClick={handleSubmit}
                    className="flex-shrink-0"
                  />
                </div>
              </div>
            )}

            {/* Client: approve or dispute */}
            {(canApprove || canDispute) && (
              <div className="flex gap-2">
                {canApprove && (
                  <TxButton
                    label="Approve & Release"
                    isPending={isApprovePending}
                    isConfirming={isApproveConfirming}
                    onClick={() => approveMilestone({
                      address: FLOWWORK_ADDRESS,
                      abi: FLOWWORK_ABI,
                      functionName: 'approveMilestone',
                      args: [agreement.id, BigInt(index)],
                      chainId: ARC_TESTNET_CHAIN_ID,
                    })}
                    fullWidth
                  />
                )}
                {canDispute && (
                  <TxButton
                    label="Dispute"
                    variant="outline"
                    isPending={isDisputePending}
                    isConfirming={isDisputeConfirming}
                    onClick={() => disputeMilestone({
                      address: FLOWWORK_ADDRESS,
                      abi: FLOWWORK_ABI,
                      functionName: 'disputeMilestone',
                      args: [agreement.id, BigInt(index)],
                      chainId: ARC_TESTNET_CHAIN_ID,
                    })}
                    fullWidth
                  />
                )}
              </div>
            )}

            {/* Explorer links for tx hashes */}
            {approveHash && (
              <a
                href={buildTxExplorerUrl(ARC_TESTNET_CHAIN_ID, approveHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs hover:opacity-70"
                style={{ color: 'var(--success)' }}
              >
                <ExternalLink className="size-3" /> View on ArcScan
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
