import { useAccount } from 'wagmi'
import { ConnectKitButton } from 'connectkit'
import { FlowWorkLogo } from '@/components/FlowWorkLogo'

interface WalletGateProps {
  children: React.ReactNode
}

export function WalletGate({ children }: WalletGateProps) {
  const { isConnected, isConnecting } = useAccount()

  if (isConnecting) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="size-8 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: 'var(--accent)' }} />
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-28 px-6 text-center gap-0">
        {/* Hero logo */}
        <FlowWorkLogo size="lg" markOnly />
        <div className="mt-6 mb-2">
          <span
            className="display text-3xl font-bold block"
            style={{ color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1.1 }}
          >
            FlowWork
          </span>
          <span
            className="text-sm mt-1 block"
            style={{ color: 'var(--muted)' }}
          >
            Onchain work agreements, powered by USDC
          </span>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-5 mb-8">
          {['Milestone escrow', 'Onchain proof', 'USDC payments', 'Non-custodial'].map((f) => (
            <span
              key={f}
              className="text-xs px-3 py-1 rounded-full border font-medium"
              style={{ borderColor: 'var(--border)', color: 'var(--subtle)', background: 'var(--surface-muted)' }}
            >
              {f}
            </span>
          ))}
        </div>

        <ConnectKitButton />

        <p className="text-xs mt-4 max-w-xs" style={{ color: 'var(--subtle)', lineHeight: '1.6' }}>
          Your wallet address is your identity. No account needed.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
