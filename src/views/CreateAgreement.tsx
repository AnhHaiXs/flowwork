import { useState, useEffect, useMemo } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Plus, Trash2, AlertCircle, ExternalLink, Info, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { erc20Abi, parseUnits } from 'viem'
import { AppView } from '@/types'
import { WalletGate } from '@/components/WalletGate'
import { TxButton } from '@/components/TxButton'
import { FLOWWORK_ABI, FLOWWORK_ADDRESS, USDC_ADDRESS, USDC_DECIMALS, ARC_TESTNET_CHAIN_ID } from '@/contract'
import { useUsdcBalance, useUsdcAllowance, useIsDeployed } from '@/hooks/useFlowWork'
import { formatUsdc, parseOnchainError, isValidAddress } from '@/utils'
import { buildTxExplorerUrl } from '@/onchain-facts'
import { TokenUSDC } from '@web3icons/react'

interface CreateAgreementProps {
  onNav: (v: AppView) => void
  onCreated?: (id: bigint) => void
}

const EMPTY_MILESTONE = { title: '', amount: '' }

export function CreateAgreement({ onNav, onCreated: _onCreated }: CreateAgreementProps) {
  const { address } = useAccount()
  const isDeployed = useIsDeployed()

  const [contributor, setContributor] = useState('')
  const [arbiter, setArbiter] = useState('')
  const [title, setTitle] = useState('')
  const [deadline, setDeadline] = useState('')
  const [milestones, setMilestones] = useState([{ ...EMPTY_MILESTONE }, { ...EMPTY_MILESTONE }])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const minDeadlineDate = useMemo(() => new Date(Date.now() + 86400000).toISOString().split('T')[0], [])

  const { data: usdcBalance } = useUsdcBalance(address)
  const { data: allowance, refetch: refetchAllowance } = useUsdcAllowance(address)

  const totalRaw = milestones.reduce((sum, m) => {
    const n = parseFloat(m.amount || '0')
    return sum + (isNaN(n) ? 0 : n)
  }, 0)
  const totalParsed = parseUnits(totalRaw.toFixed(6), USDC_DECIMALS)

  const hasEnoughBalance = usdcBalance !== undefined && (usdcBalance) >= totalParsed
  const hasEnoughAllowance = allowance !== undefined && (allowance) >= totalParsed
  const needsApproval = totalParsed > 0n && !hasEnoughAllowance

  const { writeContract: approveUsdc, data: approveHash, isPending: isApprovePending, error: approveError } = useWriteContract()
  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash })

  useEffect(() => {
    if (isApproveSuccess) { toast.success('USDC approved'); void refetchAllowance() }
  }, [isApproveSuccess, refetchAllowance])

  useEffect(() => {
    if (approveError) toast.error(parseOnchainError(approveError))
  }, [approveError])

  const { writeContract: createAgreement, data: createHash, isPending: isCreatePending, error: createError } = useWriteContract()
  const { isLoading: isCreateConfirming, isSuccess: isCreateSuccess, data: createReceipt } = useWaitForTransactionReceipt({ hash: createHash })

  const txHash = isCreateSuccess ? createHash : undefined

  useEffect(() => {
    if (isCreateSuccess && createReceipt) {
      toast.success('Agreement created successfully!')
      setTimeout(() => onNav('agreements'), 2000)
    }
  }, [isCreateSuccess, createReceipt, onNav])

  useEffect(() => {
    if (createError) toast.error(parseOnchainError(createError))
  }, [createError])

  const errors: Record<string, string> = {}
  if (contributor && !isValidAddress(contributor)) errors.contributor = 'Invalid address'
  if (contributor && contributor.toLowerCase() === address?.toLowerCase()) errors.contributor = 'Cannot be your own address'
  if (arbiter && !isValidAddress(arbiter)) errors.arbiter = 'Invalid address'
  if (!title.trim()) errors.title = 'Required'
  if (title.trim().length > 100) errors.title = 'Max 100 characters'
  milestones.forEach((m, i) => {
    if (!m.title.trim()) errors[`m_title_${i}`] = 'Required'
    const n = parseFloat(m.amount)
    if (isNaN(n) || n <= 0) errors[`m_amount_${i}`] = 'Must be > 0'
  })
  const isFormValid =
    Object.keys(errors).length === 0 &&
    contributor.trim() &&
    title.trim() &&
    milestones.every((m) => m.title.trim() && parseFloat(m.amount) > 0)

  function handleApprove() {
    approveUsdc({ address: USDC_ADDRESS, abi: erc20Abi, functionName: 'approve', args: [FLOWWORK_ADDRESS, totalParsed], chainId: ARC_TESTNET_CHAIN_ID })
  }

  function handleCreate() {
    const amounts = milestones.map((m) => parseUnits(parseFloat(m.amount).toFixed(6), USDC_DECIMALS))
    const titles = milestones.map((m) => m.title.trim())
    const deadlineTs = deadline ? BigInt(Math.floor(new Date(deadline).getTime() / 1000)) : 0n
    createAgreement({
      address: FLOWWORK_ADDRESS, abi: FLOWWORK_ABI, functionName: 'createAgreement',
      args: [
        contributor as `0x${string}`,
        (arbiter && isValidAddress(arbiter) ? arbiter : '0x0000000000000000000000000000000000000000') as `0x${string}`,
        title.trim(), amounts, titles, deadlineTs,
      ],
      chainId: ARC_TESTNET_CHAIN_ID,
    })
  }

  return (
    <WalletGate>
      <div className="px-6 xl:px-10 py-8 pb-24 lg:pb-10 max-w-screen-xl">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => onNav('dashboard')}
            className="p-2 -ml-2 rounded-xl hover:bg-black/5 transition-colors"
            style={{ color: 'var(--muted)' }}
          >
            <ArrowLeft className="size-5" />
          </button>
          <div>
            <h1 className="display text-3xl font-700" style={{ color: 'var(--ink)', letterSpacing: '-0.03em' }}>
              New agreement
            </h1>
            <p className="text-base mt-0.5" style={{ color: 'var(--muted)' }}>
              Lock USDC in escrow and define milestones
            </p>
          </div>
        </div>

        {!isDeployed && (
          <div
            className="rounded-2xl border p-4 mb-6 flex gap-2"
            style={{ background: 'rgba(245,158,11,0.05)', borderColor: 'rgba(217,119,6,0.3)' }}
          >
            <AlertCircle className="size-5 mt-0.5 flex-shrink-0" style={{ color: '#d97706' }} />
            <p className="text-sm" style={{ color: '#92400e' }}>
              The FlowWork contract is not yet deployed. Deploy it first from the Contracts panel.
            </p>
          </div>
        )}

        {/* 2-col layout on large screens */}
        <div className="grid lg:grid-cols-5 gap-6">

          {/* Left: form (3/5) */}
          <div className="lg:col-span-3 space-y-5">

            {/* Agreement details */}
            <section
              className="rounded-2xl border p-6"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <h2 className="text-base font-semibold mb-5" style={{ color: 'var(--ink)' }}>Agreement details</h2>
              <div className="space-y-5">
                <Field label="Title" error={errors.title} hint="Short description of the work">
                  <input
                    className="input-field w-full"
                    placeholder="e.g. Smart contract audit for TokenX"
                    maxLength={100}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </Field>
                <Field label="Contributor address" error={errors.contributor} hint="Wallet of the person doing the work">
                  <input
                    className="input-field w-full mono"
                    placeholder="0x..."
                    value={contributor}
                    onChange={(e) => setContributor(e.target.value)}
                  />
                </Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Arbiter address" error={errors.arbiter} hint="Optional — resolves disputes">
                    <input
                      className="input-field w-full mono"
                      placeholder="0x... (optional)"
                      value={arbiter}
                      onChange={(e) => setArbiter(e.target.value)}
                    />
                  </Field>
                  <Field label="Deadline" hint="Optional — when work should be complete">
                    <input
                      type="date"
                      className="input-field w-full"
                      value={deadline}
                      min={minDeadlineDate}
                      onChange={(e) => setDeadline(e.target.value)}
                    />
                  </Field>
                </div>
              </div>
            </section>

            {/* Milestones */}
            <section
              className="rounded-2xl border p-6"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold" style={{ color: 'var(--ink)' }}>
                  Milestones <span style={{ color: 'var(--subtle)' }}>({milestones.length}/5)</span>
                </h2>
                {milestones.length < 5 && (
                  <button
                    onClick={() => setMilestones([...milestones, { ...EMPTY_MILESTONE }])}
                    className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg"
                    style={{ color: 'var(--accent)', background: 'var(--surface-muted)' }}
                  >
                    <Plus className="size-3.5" /> Add
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {milestones.map((m, i) => (
                  <div
                    key={i}
                    className="rounded-xl border p-4"
                    style={{ background: 'var(--surface-muted)', borderColor: 'var(--border)' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--subtle)' }}>
                        Milestone {i + 1}
                      </span>
                      {milestones.length > 1 && (
                        <button
                          onClick={() => setMilestones(milestones.filter((_, j) => j !== i))}
                          className="p-1.5 rounded-lg hover:bg-black/5"
                          style={{ color: 'var(--muted)' }}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <input
                          className="input-field w-full"
                          placeholder="What will be delivered?"
                          value={m.title}
                          onChange={(e) => {
                            const next = [...milestones]
                            next[i] = { ...next[i], title: e.target.value }
                            setMilestones(next)
                          }}
                        />
                        {errors[`m_title_${i}`] && (
                          <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors[`m_title_${i}`]}</p>
                        )}
                      </div>
                      <div className="w-36">
                        <div className="input-field flex items-center gap-2">
                          <TokenUSDC variant="branded" size={16} />
                          <input
                            type="number"
                            inputMode="decimal"
                            className="w-full bg-transparent tabular-nums outline-none"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            value={m.amount}
                            onChange={(e) => {
                              const next = [...milestones]
                              next[i] = { ...next[i], amount: e.target.value }
                              setMilestones(next)
                            }}
                          />
                        </div>
                        {errors[`m_amount_${i}`] && (
                          <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors[`m_amount_${i}`]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right: summary + actions (2/5) */}
          <div className="lg:col-span-2 space-y-4">

            {/* Escrow summary */}
            <div
              className="rounded-2xl border p-5 sticky top-8"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--ink)' }}>Summary</h2>

              {/* Total */}
              <div
                className="rounded-xl border p-4 mb-4"
                style={{ background: 'var(--surface-muted)', borderColor: 'var(--border)' }}
              >
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--subtle)' }}>Total to lock in escrow</p>
                <div className="flex items-baseline gap-1.5">
                  <TokenUSDC variant="branded" size={20} />
                  <span className="display text-3xl font-700 tabular-nums" style={{ color: 'var(--ink)', letterSpacing: '-0.03em' }}>
                    {totalRaw.toFixed(2)}
                  </span>
                  <span className="text-base" style={{ color: 'var(--subtle)' }}>USDC</span>
                </div>
                {usdcBalance !== undefined && (
                  <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>
                    Wallet: {formatUsdc(usdcBalance)} USDC
                  </p>
                )}
              </div>

              {/* Balance warning */}
              {usdcBalance !== undefined && totalParsed > 0n && !hasEnoughBalance && (
                <div
                  className="rounded-xl px-3 py-2.5 flex items-center gap-2 mb-4"
                  style={{ background: 'rgba(186,43,76,0.07)' }}
                >
                  <AlertCircle className="size-4 flex-shrink-0" style={{ color: 'var(--danger)' }} />
                  <p className="text-xs" style={{ color: 'var(--danger)' }}>
                    Insufficient balance. Get test USDC from the sidebar.
                  </p>
                </div>
              )}

              {/* Milestone list */}
              {milestones.filter((m) => m.title && parseFloat(m.amount) > 0).length > 0 && (
                <div className="mb-4 space-y-1.5">
                  {milestones.map((m, i) =>
                    m.title && parseFloat(m.amount) > 0 ? (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="truncate pr-2" style={{ color: 'var(--muted)' }}>{m.title}</span>
                        <span className="flex-shrink-0 font-medium tabular-nums" style={{ color: 'var(--ink)' }}>
                          {parseFloat(m.amount).toFixed(2)} USDC
                        </span>
                      </div>
                    ) : null
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="space-y-2.5">
                {isCreateSuccess && txHash ? (
                  <div
                    className="rounded-xl border p-3 flex items-center justify-between"
                    style={{ background: 'rgba(26,128,71,0.07)', borderColor: 'rgba(26,128,71,0.3)' }}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4" style={{ color: 'var(--success)' }} />
                      <p className="text-sm font-semibold" style={{ color: 'var(--success)' }}>Agreement created!</p>
                    </div>
                    <a
                      href={buildTxExplorerUrl(ARC_TESTNET_CHAIN_ID, txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs"
                      style={{ color: 'var(--success)' }}
                    >
                      <ExternalLink className="size-3" /> ArcScan
                    </a>
                  </div>
                ) : needsApproval ? (
                  <>
                    <TxButton
                      label={`Approve ${totalRaw.toFixed(2)} USDC`}
                      pendingLabel="Confirm approval in wallet…"
                      confirmingLabel="Approving…"
                      onClick={handleApprove}
                      isPending={isApprovePending}
                      isConfirming={isApproveConfirming}
                      disabled={!isFormValid || !hasEnoughBalance || !isDeployed}
                      fullWidth
                    />
                    <p className="text-xs text-center" style={{ color: 'var(--subtle)' }}>
                      Step 1 of 2 — allow FlowWork to lock your USDC
                    </p>
                  </>
                ) : (
                  <>
                    <TxButton
                      label="Create agreement"
                      pendingLabel="Confirm in wallet…"
                      confirmingLabel="Creating agreement…"
                      onClick={handleCreate}
                      isPending={isCreatePending}
                      isConfirming={isCreateConfirming}
                      disabled={!isFormValid || !hasEnoughBalance || !isDeployed || totalParsed === 0n}
                      fullWidth
                    />
                    {!needsApproval && totalParsed > 0n && (
                      <p className="text-xs text-center" style={{ color: 'var(--success)' }}>
                        USDC approved — one transaction left
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Security note */}
              <div className="flex gap-2 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <Info className="size-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--subtle)' }} />
                <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
                  Funds are locked until you approve each milestone or cancel the agreement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WalletGate>
  )
}

function Field({ label, hint, error, children }: {
  label: string; hint?: string; error?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs mt-1.5" style={{ color: 'var(--subtle)' }}>{hint}</p>}
      {error && <p className="text-xs mt-1.5" style={{ color: 'var(--danger)' }}>{error}</p>}
    </div>
  )
}
