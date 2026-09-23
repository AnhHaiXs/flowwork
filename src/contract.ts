/**
 * FlowWork contract configuration.
 * ABI is inlined (as const) so the build works without the Foundry artifact on disk.
 * Deployed on Arc Testnet — 2026-09-23
 */

export const ARC_TESTNET_CHAIN_ID = 5042002 as const

// FlowWork deployed on Arc Testnet — 2026-09-23
export const FLOWWORK_ADDRESS = '0x7bde6df4d2f103b69d1f4ae10f8f0f743a424ce7' as `0x${string}`

// USDC on Arc Testnet (ERC-20 view, 6 decimals) — from onchain-facts
export const USDC_ADDRESS = '0x3600000000000000000000000000000000000000' as `0x${string}`
export const USDC_DECIMALS = 6

export const FLOWWORK_ABI = [
  { type: 'constructor', inputs: [{ name: 'usdcToken', type: 'address', internalType: 'address' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'DISPUTE_TIMEOUT', inputs: [], outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'acceptAgreement', inputs: [{ name: 'agreementId', type: 'uint256', internalType: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'agreementCount', inputs: [], outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'approveMilestone', inputs: [{ name: 'agreementId', type: 'uint256', internalType: 'uint256' }, { name: 'milestoneIndex', type: 'uint256', internalType: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'cancelAgreement', inputs: [{ name: 'agreementId', type: 'uint256', internalType: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'createAgreement', inputs: [{ name: 'contributor', type: 'address', internalType: 'address' }, { name: 'arbiter', type: 'address', internalType: 'address' }, { name: 'title', type: 'string', internalType: 'string' }, { name: 'milestoneAmounts', type: 'uint256[]', internalType: 'uint256[]' }, { name: 'milestoneTitles', type: 'string[]', internalType: 'string[]' }, { name: 'deadline', type: 'uint256', internalType: 'uint256' }], outputs: [{ name: 'agreementId', type: 'uint256', internalType: 'uint256' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'disputeMilestone', inputs: [{ name: 'agreementId', type: 'uint256', internalType: 'uint256' }, { name: 'milestoneIndex', type: 'uint256', internalType: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'forceCloseDispute', inputs: [{ name: 'agreementId', type: 'uint256', internalType: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function', name: 'getAgreement',
    inputs: [{ name: 'agreementId', type: 'uint256', internalType: 'uint256' }],
    outputs: [{ name: '', type: 'tuple', internalType: 'struct FlowWork.Agreement', components: [
      { name: 'id', type: 'uint256', internalType: 'uint256' },
      { name: 'client', type: 'address', internalType: 'address' },
      { name: 'contributor', type: 'address', internalType: 'address' },
      { name: 'arbiter', type: 'address', internalType: 'address' },
      { name: 'totalAmount', type: 'uint256', internalType: 'uint256' },
      { name: 'releasedAmount', type: 'uint256', internalType: 'uint256' },
      { name: 'status', type: 'uint8', internalType: 'enum FlowWork.AgreementStatus' },
      { name: 'createdAt', type: 'uint256', internalType: 'uint256' },
      { name: 'updatedAt', type: 'uint256', internalType: 'uint256' },
      { name: 'title', type: 'string', internalType: 'string' },
      { name: 'milestoneCount', type: 'uint256', internalType: 'uint256' },
      { name: 'deadline', type: 'uint256', internalType: 'uint256' },
    ]}],
    stateMutability: 'view',
  },
  { type: 'function', name: 'getClientAgreements', inputs: [{ name: 'client', type: 'address', internalType: 'address' }], outputs: [{ name: '', type: 'uint256[]', internalType: 'uint256[]' }], stateMutability: 'view' },
  { type: 'function', name: 'getContributorAgreements', inputs: [{ name: 'contributor', type: 'address', internalType: 'address' }], outputs: [{ name: '', type: 'uint256[]', internalType: 'uint256[]' }], stateMutability: 'view' },
  {
    type: 'function', name: 'getMilestone',
    inputs: [{ name: 'agreementId', type: 'uint256', internalType: 'uint256' }, { name: 'milestoneIndex', type: 'uint256', internalType: 'uint256' }],
    outputs: [{ name: '', type: 'tuple', internalType: 'struct FlowWork.Milestone', components: [
      { name: 'id', type: 'uint256', internalType: 'uint256' },
      { name: 'agreementId', type: 'uint256', internalType: 'uint256' },
      { name: 'title', type: 'string', internalType: 'string' },
      { name: 'amount', type: 'uint256', internalType: 'uint256' },
      { name: 'status', type: 'uint8', internalType: 'enum FlowWork.MilestoneStatus' },
      { name: 'deliveryHash', type: 'bytes32', internalType: 'bytes32' },
      { name: 'submittedAt', type: 'uint256', internalType: 'uint256' },
      { name: 'approvedAt', type: 'uint256', internalType: 'uint256' },
    ]}],
    stateMutability: 'view',
  },
  {
    type: 'function', name: 'getMilestones',
    inputs: [{ name: 'agreementId', type: 'uint256', internalType: 'uint256' }],
    outputs: [{ name: '', type: 'tuple[]', internalType: 'struct FlowWork.Milestone[]', components: [
      { name: 'id', type: 'uint256', internalType: 'uint256' },
      { name: 'agreementId', type: 'uint256', internalType: 'uint256' },
      { name: 'title', type: 'string', internalType: 'string' },
      { name: 'amount', type: 'uint256', internalType: 'uint256' },
      { name: 'status', type: 'uint8', internalType: 'enum FlowWork.MilestoneStatus' },
      { name: 'deliveryHash', type: 'bytes32', internalType: 'bytes32' },
      { name: 'submittedAt', type: 'uint256', internalType: 'uint256' },
      { name: 'approvedAt', type: 'uint256', internalType: 'uint256' },
    ]}],
    stateMutability: 'view',
  },
  { type: 'function', name: 'pendingWithdrawals', inputs: [{ name: '', type: 'address', internalType: 'address' }], outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'submitDelivery', inputs: [{ name: 'agreementId', type: 'uint256', internalType: 'uint256' }, { name: 'milestoneIndex', type: 'uint256', internalType: 'uint256' }, { name: 'deliveryHash', type: 'bytes32', internalType: 'bytes32' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'usdc', inputs: [], outputs: [{ name: '', type: 'address', internalType: 'contract IERC20' }], stateMutability: 'view' },
  { type: 'function', name: 'withdraw', inputs: [], outputs: [], stateMutability: 'nonpayable' },
  { type: 'event', name: 'AgreementAccepted', inputs: [{ name: 'id', type: 'uint256', indexed: true, internalType: 'uint256' }], anonymous: false },
  { type: 'event', name: 'AgreementCancelled', inputs: [{ name: 'id', type: 'uint256', indexed: true, internalType: 'uint256' }], anonymous: false },
  { type: 'event', name: 'AgreementCompleted', inputs: [{ name: 'id', type: 'uint256', indexed: true, internalType: 'uint256' }], anonymous: false },
  { type: 'event', name: 'AgreementCreated', inputs: [{ name: 'id', type: 'uint256', indexed: true, internalType: 'uint256' }, { name: 'client', type: 'address', indexed: true, internalType: 'address' }, { name: 'contributor', type: 'address', indexed: true, internalType: 'address' }, { name: 'totalAmount', type: 'uint256', indexed: false, internalType: 'uint256' }], anonymous: false },
  { type: 'event', name: 'DeliverySubmitted', inputs: [{ name: 'agreementId', type: 'uint256', indexed: true, internalType: 'uint256' }, { name: 'milestoneIndex', type: 'uint256', indexed: false, internalType: 'uint256' }, { name: 'deliveryHash', type: 'bytes32', indexed: false, internalType: 'bytes32' }], anonymous: false },
  { type: 'event', name: 'MilestoneApproved', inputs: [{ name: 'agreementId', type: 'uint256', indexed: true, internalType: 'uint256' }, { name: 'milestoneIndex', type: 'uint256', indexed: false, internalType: 'uint256' }, { name: 'amount', type: 'uint256', indexed: false, internalType: 'uint256' }], anonymous: false },
  { type: 'event', name: 'MilestoneDisputed', inputs: [{ name: 'agreementId', type: 'uint256', indexed: true, internalType: 'uint256' }, { name: 'milestoneIndex', type: 'uint256', indexed: false, internalType: 'uint256' }], anonymous: false },
  { type: 'event', name: 'WithdrawalClaimed', inputs: [{ name: 'recipient', type: 'address', indexed: true, internalType: 'address' }, { name: 'amount', type: 'uint256', indexed: false, internalType: 'uint256' }], anonymous: false },
  { type: 'error', name: 'ReentrancyGuardReentrantCall', inputs: [] },
  { type: 'error', name: 'SafeERC20FailedOperation', inputs: [{ name: 'token', type: 'address', internalType: 'address' }] },
] as const
