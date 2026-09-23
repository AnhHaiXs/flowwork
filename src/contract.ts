/**
 * FlowWork contract configuration.
 *
 * FLOWWORK_ADDRESS is set to the zero address until the contract is deployed.
 * After deploying (via the Contracts panel in Arc Studio), replace the address
 * below with the deployed contract address and update AGENTS.md.
 */

import artifact from '../contracts/out/FlowWork.sol/FlowWork.json'

export const ARC_TESTNET_CHAIN_ID = 5042002 as const

// Replace this address after deployment.
export const FLOWWORK_ADDRESS = '0x0000000000000000000000000000000000000000' as `0x${string}`

// USDC on Arc Testnet (ERC-20 view, 6 decimals) — from onchain-facts
export const USDC_ADDRESS = '0x3600000000000000000000000000000000000000' as `0x${string}`
export const USDC_DECIMALS = 6

export const FLOWWORK_ABI = artifact.abi as typeof artifact.abi
