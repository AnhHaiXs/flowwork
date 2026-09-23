import { useReadContract, useReadContracts } from 'wagmi'
import type { Abi } from 'viem'
import { FLOWWORK_ABI, FLOWWORK_ADDRESS, ARC_TESTNET_CHAIN_ID } from '@/contract'
import { Agreement, AgreementStatus, Milestone, MilestoneStatus } from '@/types'

// ── Raw contract tuple → typed structs ───────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toAgreement(raw: any): Agreement | null {
  if (!raw || raw.id === undefined) return null
  return {
    id: raw.id,
    client: raw.client,
    contributor: raw.contributor,
    arbiter: raw.arbiter,
    totalAmount: raw.totalAmount,
    releasedAmount: raw.releasedAmount,
    status: raw.status as AgreementStatus,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    title: raw.title,
    milestoneCount: raw.milestoneCount,
    deadline: raw.deadline,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toMilestone(raw: any): Milestone | null {
  if (!raw || raw.id === undefined) return null
  return {
    id: raw.id,
    agreementId: raw.agreementId,
    title: raw.title,
    amount: raw.amount,
    status: raw.status as MilestoneStatus,
    deliveryHash: raw.deliveryHash,
    submittedAt: raw.submittedAt,
    approvedAt: raw.approvedAt,
  }
}

// ── Is contract deployed? ─────────────────────────────────────────
export function useIsDeployed(): boolean {
  return FLOWWORK_ADDRESS !== '0x0000000000000000000000000000000000000000'
}

// ── Agreement count ───────────────────────────────────────────────
export function useAgreementCount() {
  return useReadContract({
    address: FLOWWORK_ADDRESS,
    abi: FLOWWORK_ABI,
    functionName: 'agreementCount',
    chainId: ARC_TESTNET_CHAIN_ID,
    query: { enabled: useIsDeployed() },
  })
}

// ── Client agreements ─────────────────────────────────────────────
export function useClientAgreements(address: `0x${string}` | undefined) {
  const deployed = useIsDeployed()
  return useReadContract({
    address: FLOWWORK_ADDRESS,
    abi: FLOWWORK_ABI,
    functionName: 'getClientAgreements',
    args: address ? [address] : undefined,
    chainId: ARC_TESTNET_CHAIN_ID,
    query: { enabled: deployed && !!address },
  })
}

// ── Contributor agreements ────────────────────────────────────────
export function useContributorAgreements(address: `0x${string}` | undefined) {
  const deployed = useIsDeployed()
  return useReadContract({
    address: FLOWWORK_ADDRESS,
    abi: FLOWWORK_ABI,
    functionName: 'getContributorAgreements',
    args: address ? [address] : undefined,
    chainId: ARC_TESTNET_CHAIN_ID,
    query: { enabled: deployed && !!address },
  })
}

// ── Single agreement ──────────────────────────────────────────────
export function useAgreement(id: bigint | undefined) {
  const deployed = useIsDeployed()
  const { data, ...rest } = useReadContract({
    address: FLOWWORK_ADDRESS,
    abi: FLOWWORK_ABI,
    functionName: 'getAgreement',
    args: id !== undefined ? [id] : undefined,
    chainId: ARC_TESTNET_CHAIN_ID,
    query: { enabled: deployed && id !== undefined },
  })
  return { data: data ? toAgreement(data) : null, ...rest }
}

// ── Milestones for agreement ──────────────────────────────────────
export function useMilestones(agreementId: bigint | undefined) {
  const deployed = useIsDeployed()
  const { data, ...rest } = useReadContract({
    address: FLOWWORK_ADDRESS,
    abi: FLOWWORK_ABI,
    functionName: 'getMilestones',
    args: agreementId !== undefined ? [agreementId] : undefined,
    chainId: ARC_TESTNET_CHAIN_ID,
    query: { enabled: deployed && agreementId !== undefined },
  })
  const milestones = Array.isArray(data) ? (data as unknown[]).map(toMilestone).filter(Boolean) as Milestone[] : []
  return { data: milestones, ...rest }
}

// ── Multiple agreements by IDs ────────────────────────────────────
export function useAgreements(ids: readonly bigint[]) {
  const deployed = useIsDeployed()
  const contracts = ids.map((id) => ({
    address: FLOWWORK_ADDRESS,
    abi: FLOWWORK_ABI as Abi,
    functionName: 'getAgreement' as const,
    args: [id] as const,
    chainId: ARC_TESTNET_CHAIN_ID,
  }))

  const { data, ...rest } = useReadContracts({
    contracts,
    query: { enabled: deployed && ids.length > 0 },
  })

  const agreements = (data ?? [])
    .map((r) => (r.status === 'success' ? toAgreement(r.result) : null))
    .filter(Boolean) as Agreement[]

  return { data: agreements, ...rest }
}

// ── USDC balance ──────────────────────────────────────────────────
import { erc20Abi } from 'viem'
import { getUsdc } from '@/onchain-facts'

const usdcFact = getUsdc(ARC_TESTNET_CHAIN_ID)

export function useUsdcBalance(address: `0x${string}` | undefined) {
  return useReadContract({
    address: usdcFact?.address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: ARC_TESTNET_CHAIN_ID,
    query: { enabled: !!address && !!usdcFact },
  })
}

// ── Pending withdrawals ───────────────────────────────────────────
export function usePendingWithdrawals(address: `0x${string}` | undefined) {
  const deployed = useIsDeployed()
  return useReadContract({
    address: FLOWWORK_ADDRESS,
    abi: FLOWWORK_ABI,
    functionName: 'pendingWithdrawals',
    args: address ? [address] : undefined,
    chainId: ARC_TESTNET_CHAIN_ID,
    query: { enabled: deployed && !!address },
  })
}

// ── USDC allowance ────────────────────────────────────────────────
export function useUsdcAllowance(owner: `0x${string}` | undefined) {
  return useReadContract({
    address: usdcFact?.address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'allowance',
    args: owner ? [owner, FLOWWORK_ADDRESS] : undefined,
    chainId: ARC_TESTNET_CHAIN_ID,
    query: { enabled: !!owner && !!usdcFact },
  })
}
