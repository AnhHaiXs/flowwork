import { useTheme } from '@/hooks/useTheme'

interface LogoMarkProps {
  size?: number
  /** Override fill color — defaults to var(--accent) */
  fill?: string
  /** Override stroke color — defaults to white */
  stroke?: string
  className?: string
}

/**
 * FlowWork logo mark (symbol only).
 *
 * Concept: Two parallel horizontal flow lines converge into a diamond-shaped
 * checkpoint gate at the centre, then continue right. The centre node (circle)
 * represents the escrow milestone — the single point of trust and verification
 * where client and contributor meet before value is released.
 *
 * Works at any size down to 16px. Uses CSS tokens so it automatically adapts
 * to Light / Dark mode without extra logic in the parent.
 */
export function LogoMark({ size = 28, fill, stroke = 'white', className }: LogoMarkProps) {
  const { theme } = useTheme()
  // In dark mode use the blue accent; in light mode use the navy
  const bgFill = fill ?? (theme === 'dark' ? '#4a9eff' : '#122d45')
  // Geometry constants (designed on a 40×40 grid)
  const W = 40, H = 40
  const gateX = 16   // x where the two arms split/rejoin
  const cy = H / 2   // vertical centre
  const top = 13.5   // upper rail y
  const bot = 26.5   // lower rail y
  const nodeR = 3.2  // centre dot radius
  const sw = 2.4     // stroke width

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${W} ${H}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="FlowWork logo mark"
      role="img"
    >
      {/* Background pill */}
      <rect width={W} height={H} rx={10} fill={bgFill} />

      {/* Left "tail" — ghost arm showing history / client side */}
      <path
        d={`M6 ${top} L${gateX} ${top} L${W/2} ${cy} L${gateX} ${bot} L6 ${bot}`}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.50}
      />

      {/* Right upper rail — active flow to contributor */}
      <path
        d={`M${gateX} ${top} L34 ${top}`}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
      />

      {/* Right lower rail */}
      <path
        d={`M${gateX} ${bot} L34 ${bot}`}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
      />

      {/* Checkpoint node — the escrow milestone */}
      <circle cx={W / 2} cy={cy} r={nodeR} fill={stroke} />
    </svg>
  )
}

interface LogoFullProps {
  /** sm = 28px mark + text-base, lg = 36px mark + text-xl */
  size?: 'sm' | 'md' | 'lg'
  className?: string
  /** Hide wordmark — render mark only */
  markOnly?: boolean
}

/**
 * Full FlowWork logo: mark + wordmark.
 * Use `markOnly` to render only the icon.
 */
export function FlowWorkLogo({ size = 'md', className = '', markOnly = false }: LogoFullProps) {
  const markSize = size === 'sm' ? 24 : size === 'lg' ? 36 : 28
  const textClass =
    size === 'sm'
      ? 'text-sm font-bold'
      : size === 'lg'
      ? 'text-xl font-bold'
      : 'text-base font-bold'

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={markSize} />
      {!markOnly && (
        <span
          className={`display ${textClass} select-none`}
          style={{ color: 'var(--ink)', letterSpacing: '-0.025em', lineHeight: 1 }}
        >
          FlowWork
        </span>
      )}
    </span>
  )
}

/**
 * Monochrome version — single colour, no background rect.
 * Use on coloured backgrounds or for print/emboss contexts.
 */
export function LogoMono({ size = 28, color = 'currentColor', className }: { size?: number; color?: string; className?: string }) {
  const W = 40, H = 40
  const gateX = 16, cy = H / 2, top = 13.5, bot = 26.5, sw = 2.4, nodeR = 3.2

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${W} ${H}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="FlowWork logo monochrome"
      role="img"
    >
      <path
        d={`M6 ${top} L${gateX} ${top} L${W/2} ${cy} L${gateX} ${bot} L6 ${bot}`}
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.50}
      />
      <path d={`M${gateX} ${top} L34 ${top}`} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <path d={`M${gateX} ${bot} L34 ${bot}`} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <circle cx={W / 2} cy={cy} r={nodeR} fill={color} />
    </svg>
  )
}
