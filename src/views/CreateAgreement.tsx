import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Plus, Trash2, AlertCircle, ExternalLink, Info, ArrowLeft } from 'lucide-react'
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
  const [, setStep] = useState<'form' | 'approve' | 'create'>('form')
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>()

  const { data: usdcBalance } = useUsdcBalance(address)
  const { data: allowance, refetch: refetchAllowance } = useUsdcAllowance(address)

  // Computed totals
  const totalRaw = milestones.reduce((sum, m) => {
    const n = parseFloat(m.amount || '0')
    return sum + (isNaN(n) ? 0 : n)
  }, 0)
  const totalParsed = parseUnits(totalRaw.toFixed(6), USDC_DECIMALS)

  const hasEnoughBalance = usdcBalance !== undefined && (usdcBalance) >= totalParsed
  const hasEnoughAllowance = allowance !== undefined && (allowance) >= totalParsed
  const needsApproval = totalParsed > 0n && !hasEnoughAllowance

  // ── Approve USDC ──────────────────────────────────────────────
  const { writeContract: approveUsdc, data: approveHash, isPending: isApprovePending, error: approveError } = useWriteContract()
  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash })

  useEffect(() => {
    if (isApproveSuccess) {
      toast.success('USDC approved')
      refetchAllowance()
      setStep('create')
    }
  }, [isApproveSuccess])

  useEffect(() => {
    if (approveError) toast.error(parseOnchainError(approveError))
  }, [approveError])

  // ── Create agreement ──────────────────────────────────────────
  const { writeContract: createAgreement, data: createHash, isPending: isCreatePending, error: createError } = useWriteContract()
  const { isLoading: isCreateConfirming, isSuccess: isCreateSuccess, data: createReceipt } = useWaitForTransactionReceipt({ hash: createHash })

  useEffect(() => {
    if (isCreateSuccess && createReceipt) {
      // Find the AgreementCreated event and extract the id
      // The first topic of the event is the signature, second is the indexed `id`
      toast.success('Agreement created successfully!')
      setTxHash(createHash)
      setTimeout(() => onNav('agreements'), 2000)
    }
  }, [isCreateSuccess])

  useEffect(() => {
    if (createError) toast.error(parseOnchainError(createError))
  }, [createError])

  // Validation
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
    approveUsdc({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: 'approve',
      args: [FLOWWORK_ADDRESS, totalParsed],
      chainId: ARC_TESTNET_CHAIN_ID,
    })
    setStep('approve')
  }

  function handleCreate() {
    const amounts = milestones.map((m) => parseUnits(parseFloat(m.amount).toFixed(6), USDC_DECIMALS))
    const titles = milestones.map((m) => m.title.trim())
    const deadlineTs = deadline ? BigInt(Math.floor(new Date(deadline).getTime() / 1000)) : 0n

    createAgreement({
      address: FLOWWORK_ADDRESS,
      abi: FLOWWORK_ABI,
      functionName: 'createAgreement',
      args: [
        contributor as `0x${string}`,
        (arbiter && isValidAddress(arbiter) ? arbiter : '0x0000000000000000000000000000000000000000') as `0x${string}`,
        title.trim(),
        amounts,
        titles,
        deadlineTs,
      ],
      chainId: ARC_TESTNET_CHAIN_ID,
    })
    setStep('create')
  }

  return (
    <WalletGate>
      <div className="max-w-2xl mx-auto px-4 lg:px-6 py-6 pb-24 lg:pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => onNav('dashboard')}
            className="p-2 -ml-2 rounded-xl hover:bg-black/5 transition-colors"
            style={{ color: 'var(--muted)' }}
          >
            <ArrowLeft className="size-5" />
          </button>
          <div>
            <h1 className="display text-2xl font-700" style={{ color: 'var(--ink)', letterSpacing: '-0.02em' }}>
              New agreement
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
              Lock USDC in escrow and define milestones
            </p>
          </div>
        </div>

        {!isDeployed && (
          <div
            className="rounded-2xl border p-4 mb-5 flex gap-2"
            style={{ background: 'rgba(245,158,11,0.05)', borderColor: 'rgba(217,119,6,0.3)' }}
          >
            <AlertCircle className="size-4 mt-0.5 flex-shrink-0" style={{ color: '#d97706' }} />
            <p className="text-sm" style={{ color: '#92400e' }}>
              The FlowWork contract is not yet deployed. Deploy it first from the Contracts panel.
            </p>
          </div>
        )}

        <div className="space-y-5">
          {/* ── Agreement details ─────────────────────────────── */}
          <section
            className="rounded-2xl border p-5"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--ink)' }}>Agreement details</h2>
            <div className="space-y-4">
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

              <Field
                label="Arbiter address"
                error={errors.arbiter}
                hint="Optional — resolves disputes. Leave blank for no arbiter."
              >
                <input
                  className="input-field w-full mono"
                  placeholder="0x... (optional)"
                  value={arbiter}
                  onChange={(e) => setArbiter(e.target.value)}
                />
              </Field>

              <Field label="Deadline" hint="Optional — when all work should be complete">
                <input
                  type="date"
                  className="input-field"
                  value={deadline}
                  min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </Field>
            </div>
          </section>

          {/* ── Milestones ────────────────────────────────────── */}
          <section
            className="rounded-2xl border p-5"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                Milestones ({milestones.length}/5)
              </h2>
              {milestones.length < 5 && (
                <button
                  onClick={() => setMilestones([...milestones, { ...EMPTY_MILESTONE }])}
                  className="flex items-center gap-1 text-xs font-semibold"
                  style={{ color: 'var(--accent-hover)' }}
                >
                  <Plus className="size-3.5" /> Add milestone
                </button>
              )}
            </div>
            <div className="space-y-3">
              {milestones.map((m, i) => (
                <div
                  key={i}
                  className="rounded-xl border p-3"
                  style={{ background: 'var(--surface-muted)', borderColor: 'var(--border)' }}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-semibold" style={{ color: 'var(--subtle)' }}>
                      Milestone {i + 1}
                    </span>
                    {milestones.length > 1 && (
                      <button
                        onClick={() => setMilestones(milestones.filter((_, j) => j !== i))}
                        className="p-1 rounded-md hover:bg-black/5"
                        style={{ color: 'var(--muted)' }}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input
                        className="input-field w-full text-sm"
                        placeholder="What will be delivered?"
                        value={m.title}
                        onChange={(e) => {
                          const next = [...milestones]
                          next[i] = { ...next[i], title: e.target.value }
                          setMilestones(next)
                        }}
                      />
                      {errors[`m_title_${i}`] && (
                        <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>
                          {errors[`m_title_${i}`]}
                        </p>
                      )}
                    </div>
                    <div className="w-32">
                      <div className="input-field flex items-center gap-1.5 pr-2">
                        <TokenUSDC variant="branded" size={14} />
                        <input
                          type="number"
                          inputMode="decimal"
                          className="w-full bg-transparent text-sm tabular-nums outline-none"
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
                        <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>
                          {errors[`m_amount_${i}`]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-4 pt-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <span className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Total to lock in escrow</span>
              <div className="flex items-center gap-1.5">
                <TokenUSDC variant="branded" size={16} />
                <span className="display text-lg font-700 tabular-nums" style={{ color: 'var(--ink)' }}>
                  {totalRaw.toFixed(2)}
                </span>
                <span className="text-sm" style={{ color: 'var(--subtle)' }}>USDC</span>
              </div>
            </div>

            {/* Balance check */}
            {usdcBalance !== undefined && totalParsed > 0n && !hasEnoughBalance && (
              <div
                className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2.5"
                style={{ background: 'rgba(186,43,76,0.07)' }}
              >
                <AlertCircle className="size-4 flex-shrink-0" style={{ color: 'var(--danger)' }} />
                <p className="text-xs" style={{ color: 'var(--danger)' }}>
                  Insufficient balance — you have {formatUsdc(usdcBalance)} USDC. Get test USDC from the sidebar.
                </p>
              </div>
            )}
          </section>

          {/* ── Security note ─────────────────────────────────── */}
          <div
            className="flex gap-2 rounded-xl px-4 py-3"
            style={{ background: 'var(--surface-muted)' }}
          >
            <Info className="size-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--subtle)' }} />
            <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
              You will approve the exact USDC amount and then create the agreement in a second transaction. Funds are locked until you approve each milestone or cancel the agreement.
            </p>
          </div>

          {/* ── Action buttons ────────────────────────────────── */}
          <div className="space-y-2.5">
            {isCreateSuccess && txHash ? (
              <div
                className="rounded-2xl border p-4 flex items-center justify-between"
                style={{ background: 'rgba(26,128,71,0.07)', borderColor: 'rgba(26,128,71,0.3)' }}
              >
                <p className="text-sm font-semibold" style={{ color: 'var(--success)' }}>
                  Agreement created!
                </p>
                <a
                  href={buildTxExplorerUrl(ARC_TESTNET_CHAIN_ID, txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs"
                  style={{ color: 'var(--success)' }}
                >
                  <ExternalLink className="size-3" /> View on ArcScan
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
                    USDC already approved — one transaction left
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </WalletGate>
  )
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ink)' }}>
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs mt-1" style={{ color: 'var(--subtle)' }}>
          {hint}
        </p>
      )}
      {error && (
        <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>
          {error}
        </p>
      )}
    </div>
  )
}
