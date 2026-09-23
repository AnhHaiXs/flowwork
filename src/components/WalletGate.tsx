import { useAccount } from 'wagmi'
import { ConnectKitButton } from 'connectkit'
import { Shield } from 'lucide-react'

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
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div
          className="size-14 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: 'var(--surface-muted)' }}
        >
          <Shield className="size-7" style={{ color: 'var(--accent)' }} />
        </div>
        <h2 className="display text-xl font-700 mb-2" style={{ color: 'var(--ink)' }}>
          Connect your wallet
        </h2>
        <p className="text-sm max-w-xs mb-6" style={{ color: 'var(--muted)', lineHeight: '1.7' }}>
          FlowWork uses your wallet address as your identity. Connect to view and manage your agreements.
        </p>
        <ConnectKitButton />
      </div>
    )
  }

  return <>{children}</>
}
