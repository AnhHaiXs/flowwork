import { AgreementStatus, MilestoneStatus } from './types'
import { USDC_DECIMALS } from './contract'

// ── Address formatting ────────────────────────────────────────────
export function formatAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export function isValidAddress(addr: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(addr)
}

// ── USDC formatting ───────────────────────────────────────────────
export function formatUsdc(raw: bigint): string {
  const divisor = 10 ** USDC_DECIMALS
  const val = Number(raw) / divisor
  return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ── Progress ──────────────────────────────────────────────────────
export function progressPercent(released: bigint, total: bigint): number {
  if (total === 0n) return 0
  return Math.round(Number((released * 100n) / total))
}

// ── Date/time formatting ──────────────────────────────────────────
export function formatDate(ts: bigint): string {
  if (ts === 0n) return 'N/A'
  const d = new Date(Number(ts) * 1000)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatRelativeTime(ts: bigint): string {
  if (ts === 0n) return ''
  const now = Math.floor(Date.now() / 1000)
  const diff = now - Number(ts)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return formatDate(ts)
}

// ── Delivery hash encoding ────────────────────────────────────────
/**
 * Encodes an arbitrary string (URL, CID, text) into a bytes32 by
 * hashing it with a simple deterministic method. In a production
 * system you'd use keccak256; here we truncate-pad the UTF-8 bytes.
 */
export function encodeDeliveryHash(input: string): `0x${string}` {
  // Convert to UTF-8 bytes and take first 32 bytes, padding with zeros
  const encoder = new TextEncoder()
  const bytes = encoder.encode(input)
  const result = new Uint8Array(32)
  result.set(bytes.slice(0, 32))
  const hex = Array.from(result).map((b) => b.toString(16).padStart(2, '0')).join('')
  return `0x${hex}`
}

export function isValidDeliveryHash(input: string): boolean {
  return input.trim().length > 3
}

// ── Error parsing ─────────────────────────────────────────────────
export function parseOnchainError(error: unknown): string {
  if (!error) return 'Something went wrong.'
  const msg = (error as { message?: string })?.message?.toLowerCase() ?? ''
  if (msg.includes('user rejected') || msg.includes('denied')) return 'Transaction cancelled.'
  if (msg.includes('insufficient funds') || msg.includes('exceeds balance')) {
    return 'Insufficient balance — use the testnet faucet.'
  }
  if (msg.includes('reverted')) {
    const reasonMatch = msg.match(/reason="([^"]+)"/)
    if (reasonMatch) return `Transaction failed: ${reasonMatch[1]}`
    return 'Transaction reverted. Check your inputs and try again.'
  }
  if (msg.includes('network') || msg.includes('timeout')) {
    return 'Network error — please retry.'
  }
  return 'Something went wrong. Please try again.'
}

// ── CSS class helper ──────────────────────────────────────────────
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
