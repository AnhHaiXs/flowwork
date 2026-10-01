import { useAccount } from 'wagmi'
import { ConnectKitButton } from 'connectkit'
import { Shield, Zap, Lock } from 'lucide-react'
import { FlowWorkLogo } from '@/components/FlowWorkLogo'

interface WalletGateProps {
  children: React.ReactNode
}

export function WalletGate({ children }: WalletGateProps) {
  const { isConnected, isConnecting } = useAccount()

  if (isConnecting) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="size-9 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: 'var(--accent)' }} />
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center min-h-[60vh]">
        {/* Logo */}
        <div className="mb-8">
          <FlowWorkLogo size="lg" markOnly />
        </div>

        <h2 className="display text-2xl xl:text-3xl font-700 mb-3" style={{ color: 'var(--ink)', letterSpacing: '-0.03em' }}>
          Connect your wallet
        </h2>
        <p className="text-base max-w-sm mb-8 leading-relaxed" style={{ color: 'var(--muted)' }}>
          FlowWork uses your wallet as your identity. No account or email needed.
        </p>

        <ConnectKitButton />

        {/* Feature pills */}
        <div className="flex items-center gap-3 mt-10 flex-wrap justify-center">
          {[
            { icon: <Shield className="size-3.5" />, text: 'Non-custodial' },
            { icon: <Zap className="size-3.5" />, text: 'Arc Testnet' },
            { icon: <Lock className="size-3.5" />, text: 'USDC escrow' },
          ].map(({ icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: 'var(--surface-muted)', color: 'var(--muted)' }}
            >
              {icon}
              {text}
            </div>
          ))}
        </div>

        <p className="text-xs mt-6 max-w-xs" style={{ color: 'var(--subtle)', lineHeight: '1.6' }}>
          Your wallet address is your identity. No account needed.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
