import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { ConnectKitButton } from 'connectkit'
import { ExternalLink, Copy, CheckCheck } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { WalletGate } from '@/components/WalletGate'
import { useClientAgreements, useContributorAgreements, useAgreements, useUsdcBalance, usePendingWithdrawals } from '@/hooks/useFlowWork'
import { TxButton } from '@/components/TxButton'
import { formatAddress, formatUsdc, parseOnchainError } from '@/utils'
import { buildAddressExplorerUrl } from '@/onchain-facts'
import { ARC_TESTNET_CHAIN_ID, FLOWWORK_ABI, FLOWWORK_ADDRESS } from '@/contract'
import { AgreementStatus } from '@/types'
import { TokenUSDC } from '@web3icons/react'
import { AgreementBadge } from '@/components/StatusBadge'

export function Profile() {
  const { address } = useAccount()
  const [copied, setCopied] = useState(false)

  const { data: clientIds = [] } = useClientAgreements(address)
  const { data: contributorIds = [] } = useContributorAgreements(address)
  const allIds = [...new Set([...(clientIds as bigint[]), ...(contributorIds as bigint[])])]
  const { data: agreements = [] } = useAgreements(allIds)
  const { data: usdcBalance } = useUsdcBalance(address)
  const { data: pendingAmount, refetch: refetchPending } = usePendingWithdrawals(address)
  const hasPending = pendingAmount !== undefined && (pendingAmount) > 0n

  // Withdraw
  const { writeContract: doWithdraw, data: withdrawHash, isPending: isWithdrawPending, error: withdrawError } = useWriteContract()
  const { isLoading: isWithdrawConfirming, isSuccess: isWithdrawSuccess } = useWaitForTransactionReceipt({ hash: withdrawHash })

  if (isWithdrawSuccess) { toast.success('USDC withdrawn to your wallet!'); refetchPending() }
  if (withdrawError) toast.error(parseOnchainError(withdrawError))

  // Reputation metrics
  const completedAsContributor = agreements.filter(
    (a) => a.contributor.toLowerCase() === address?.toLowerCase() && a.status === AgreementStatus.Completed
  ).length
  const completedAsClient = agreements.filter(
    (a) => a.client.toLowerCase() === address?.toLowerCase() && a.status === AgreementStatus.Completed
  ).length
  const totalEarned = agreements
    .filter((a) => a.contributor.toLowerCase() === address?.toLowerCase())
    .reduce((sum, a) => sum + a.releasedAmount, 0n)
  const totalPaid = agreements
    .filter((a) => a.client.toLowerCase() === address?.toLowerCase())
    .reduce((sum, a) => sum + a.releasedAmount, 0n)
  const disputeCount = agreements.filter(
    (a) => a.status === AgreementStatus.Disputed
  ).length

  function handleCopy() {
    if (!address) return
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <WalletGate>
      <div className="max-w-2xl mx-auto px-4 lg:px-6 py-6 pb-24 lg:pb-8 space-y-5">
        {/* Header */}
        <div>
          <h1 className="display text-2xl font-700 mb-1" style={{ color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            Profile
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Your onchain reputation and wallet
          </p>
        </div>

        {/* Wallet card */}
        <div
          className="rounded-2xl border p-5"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--subtle)' }}>Wallet</p>
              <div className="flex items-center gap-2">
                <span className="mono text-base font-medium" style={{ color: 'var(--ink)' }}>
                  {formatAddress(address ?? '')}
                </span>
                <button onClick={handleCopy} className="p-1 hover:opacity-70" style={{ color: 'var(--subtle)' }}>
                  {copied ? <CheckCheck className="size-4" style={{ color: 'var(--success)' }} /> : <Copy className="size-4" />}
                </button>
                <a
                  href={buildAddressExplorerUrl(ARC_TESTNET_CHAIN_ID, address ?? '')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 hover:opacity-70"
                  style={{ color: 'var(--subtle)' }}
                >
                  <ExternalLink className="size-4" />
                </a>
              </div>
            </div>
            <ConnectKitButton />
          </div>
          <div
            className="rounded-xl border px-4 py-3 flex items-center justify-between"
            style={{ background: 'var(--surface-muted)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-2">
              <TokenUSDC variant="branded" size={18} />
              <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>USDC Balance</span>
            </div>
            <span className="display text-lg font-700 tabular-nums" style={{ color: 'var(--ink)' }}>
              {usdcBalance !== undefined ? formatUsdc(usdcBalance) : '—'}
            </span>
          </div>
        </div>

        {/* Pending withdrawals */}
        {hasPending && (
          <div
            className="rounded-2xl border p-4 flex items-center justify-between gap-4"
            style={{ background: 'rgba(26,128,71,0.06)', borderColor: 'rgba(26,128,71,0.3)' }}
          >
            <div>
              <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--ink)' }}>
                USDC available to withdraw
              </p>
              <div className="flex items-center gap-1">
                <TokenUSDC variant="branded" size={14} />
                <span className="display text-xl font-700 tabular-nums" style={{ color: 'var(--success)', letterSpacing: '-0.02em' }}>
                  {formatUsdc(pendingAmount)}
                </span>
                <span className="text-sm" style={{ color: 'var(--subtle)' }}>USDC</span>
              </div>
            </div>
            <TxButton
              label="Withdraw"
              isPending={isWithdrawPending}
              isConfirming={isWithdrawConfirming}
              onClick={() => doWithdraw({
                address: FLOWWORK_ADDRESS,
                abi: FLOWWORK_ABI,
                functionName: 'withdraw',
                args: [],
                chainId: ARC_TESTNET_CHAIN_ID,
              })}
            />
          </div>
        )}

        {/* Reputation */}
        <div
          className="rounded-2xl border p-5"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--ink)' }}>
            Onchain reputation
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <ReputationCard
              label="Completed as contributor"
              value={String(completedAsContributor)}
              sub="agreements"
            />
            <ReputationCard
              label="Completed as client"
              value={String(completedAsClient)}
              sub="agreements"
            />
            <ReputationCard
              label="Total earned"
              value={formatUsdc(totalEarned)}
              sub="USDC received"
              usdc
            />
            <ReputationCard
              label="Total paid out"
              value={formatUsdc(totalPaid)}
              sub="USDC released"
              usdc
            />
          </div>
          <div className="text-xs" style={{ color: 'var(--subtle)' }}>
            {disputeCount > 0 && (
              <p>{disputeCount} open dispute{disputeCount !== 1 ? 's' : ''}</p>
            )}
            <p className="mt-0.5">
              All data is read directly from the FlowWork contract on Arc Testnet — fully verifiable onchain.
            </p>
          </div>
        </div>

        {/* Recent agreements */}
        {agreements.length > 0 && (
          <div
            className="rounded-2xl border p-5"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--ink)' }}>Agreement history</h2>
            <div className="space-y-2">
              {agreements
                .slice()
                .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))
                .map((a) => (
                  <div
                    key={String(a.id)}
                    className="flex items-center justify-between gap-3 py-1.5"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--ink)' }}>{a.title}</p>
                      <p className="text-xs" style={{ color: 'var(--subtle)' }}>
                        {a.client.toLowerCase() === address?.toLowerCase() ? 'Client' : 'Contributor'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <TokenUSDC variant="branded" size={12} />
                        <span className="text-xs font-medium tabular-nums" style={{ color: 'var(--ink)' }}>
                          {formatUsdc(a.totalAmount)}
                        </span>
                      </div>
                      <AgreementBadge status={a.status} />
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

function ReputationCard({
  label,
  value,
  sub,
  usdc,
}: {
  label: string
  value: string
  sub: string
  usdc?: boolean
}) {
  return (
    <div
      className="rounded-xl border p-3"
      style={{ background: 'var(--surface-muted)', borderColor: 'var(--border)' }}
    >
      <p className="text-xs mb-1.5" style={{ color: 'var(--subtle)' }}>{label}</p>
      <div className="flex items-baseline gap-1">
        {usdc && <TokenUSDC variant="branded" size={13} />}
        <span className="display text-lg font-700 tabular-nums" style={{ color: 'var(--ink)' }}>{value}</span>
      </div>
      <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{sub}</p>
    </div>
  )
}
