import { useState } from 'react'
import { BookOpen, ChevronRight, ExternalLink, FileText, Code2, Palette, Terminal, GitCommit, Layers, ArrowLeft } from 'lucide-react'

// ── Inline document content ───────────────────────────────────────────────
// Each doc section is self-contained so the viewer works without a backend.

interface DocSection {
  id: string
  title: string
  icon: typeof BookOpen
  content: React.ReactNode
}

// ── Helper components ─────────────────────────────────────────────────────

function H1({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="display text-2xl font-700 mb-6 pb-3 border-b" style={{ color: 'var(--ink)', letterSpacing: '-0.02em', borderColor: 'var(--border)' }}>
      {children}
    </h1>
  )
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="display text-lg font-700 mt-8 mb-3" style={{ color: 'var(--ink)', letterSpacing: '-0.01em' }}>
      {children}
    </h2>
  )
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base font-semibold mt-5 mb-2" style={{ color: 'var(--ink)' }}>
      {children}
    </h3>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--muted)' }}>{children}</p>
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code
      className="mono text-xs px-1.5 py-0.5 rounded-md"
      style={{ background: 'var(--surface-muted)', color: 'var(--ink)', border: '1px solid var(--border)' }}
    >
      {children}
    </code>
  )
}

function Pre({ children }: { children: React.ReactNode }) {
  return (
    <pre
      className="mono text-xs rounded-xl p-4 overflow-x-auto mb-4 leading-relaxed"
      style={{ background: 'var(--surface-muted)', color: 'var(--ink)', border: '1px solid var(--border)' }}
    >
      {children}
    </pre>
  )
}

function Table({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto mb-4">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border)' }}>
            {headers.map((h) => (
              <th key={h} className="text-left py-2 pr-4 font-semibold text-xs uppercase tracking-wide" style={{ color: 'var(--subtle)' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
              {row.map((cell, j) => (
                <td key={j} className="py-2 pr-4 text-sm align-top" style={{ color: 'var(--muted)' }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Callout({ type, children }: { type: 'info' | 'warning' | 'success'; children: React.ReactNode }) {
  const styles = {
    info: { bg: 'rgba(74,158,255,0.08)', border: 'rgba(74,158,255,0.25)', color: 'var(--ink)' },
    warning: { bg: 'rgba(245,158,66,0.08)', border: 'rgba(245,158,66,0.3)', color: 'var(--ink)' },
    success: { bg: 'rgba(52,196,114,0.08)', border: 'rgba(52,196,114,0.25)', color: 'var(--ink)' },
  }[type]
  return (
    <div className="rounded-xl px-4 py-3 mb-4 text-sm leading-relaxed" style={{ background: styles.bg, border: `1px solid ${styles.border}`, color: styles.color }}>
      {children}
    </div>
  )
}

// ── Document sections ─────────────────────────────────────────────────────

const DOCS: DocSection[] = [
  {
    id: 'overview',
    title: 'Project Overview',
    icon: BookOpen,
    content: (
      <div>
        <H1>Project Overview</H1>
        <P>
          FlowWork là ứng dụng escrow phi tập trung (dApp) trên <strong>Arc Testnet</strong>,
          cho phép client và contributor ký kết và thực thi hợp đồng công việc hoàn toàn onchain qua USDC.
        </P>

        <H2>Vấn đề cốt lõi</H2>
        <Table
          headers={['Vấn đề', 'Hiện tại', 'FlowWork giải quyết']}
          rows={[
            ['Freelancer bị quỵt tiền', 'Không có cơ chế đảm bảo', 'USDC lock trước, chỉ release khi approve'],
            ['Client mất tiền cọc', 'Contributor biến mất', 'Cancellation refund khi Open/sau deadline'],
            ['Không có bằng chứng', 'Thoả thuận miệng, off-chain', 'Delivery hash onchain, bất biến'],
            ['Tranh chấp không minh bạch', 'Không có trọng tài', 'Arbiter onchain, phán quyết onchain'],
          ]}
        />

        <H2>Đối tượng người dùng</H2>
        <Table
          headers={['Vai trò', 'Mô tả']}
          rows={[
            ['Client', 'Người thuê công việc, lock USDC trả trước, approve khi hài lòng'],
            ['Contributor', 'Freelancer/contractor, submit delivery hash, nhận USDC sau approval'],
            ['Arbiter', 'Bên thứ ba trung lập (tuỳ chọn), phán quyết tranh chấp'],
          ]}
        />

        <H2>Contract đã deploy</H2>
        <Callout type="success">
          <strong>Arc Testnet:</strong>{' '}
          <a href="https://explorer.testnet.arc.io/address/0x7bde6df4d2f103b69d1f4ae10f8f0f743a424ce7" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--status-active)' }}>
            0x7bde6df4d2f103b69d1f4ae10f8f0f743a424ce7
          </a>
        </Callout>

        <H2>Luồng hoạt động</H2>
        <Pre>{`Client               Contract             Contributor
  ├─ approve(USDC) ──>│                          │
  ├─ createAgreement()─>│ lock USDC               │
  │                    │<── acceptAgreement() ───┤
  │                    │<── submitDelivery() ────┤
  ├─ approveMilestone()─>│ credit pendingWithdrawals
  │                    │<── withdraw() ──────────┤ pull USDC`}</Pre>

        <H2>Non-goals</H2>
        <ul className="text-sm space-y-1 mb-4" style={{ color: 'var(--muted)' }}>
          {['Reputation / rating system', 'Chat hay nhắn tin', 'Multi-sig / DAO governance', 'Mainnet (chỉ Arc Testnet)', 'File storage thực sự', 'Real-time notifications'].map((g) => (
            <li key={g} className="flex items-start gap-2">
              <span style={{ color: 'var(--subtle)' }}>—</span>
              {g}
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: 'features',
    title: 'Tính năng',
    icon: Layers,
    content: (
      <div>
        <H1>Tính năng chi tiết</H1>

        <H2>F1 — Dashboard</H2>
        <P>Màn hình chính sau khi kết nối ví. Stat cards: USDC balance, Active agreements, Completed, in-escrow USDC. Recent 3 agreements, How FlowWork works khi chưa có agreement.</P>

        <H2>F2 — Agreement List</H2>
        <P>Danh sách tất cả agreements. Filter: All / As Client / As Contributor. AgreementCard với title, status badge, progress bar, total amount.</P>

        <H2>F3 — Create Agreement</H2>
        <P>Form 2 bước: (1) Approve USDC nếu allowance chưa đủ, (2) createAgreement lock USDC. Fields: title, contributor address, arbiter (tuỳ chọn), deadline (tuỳ chọn), 1–5 milestones với title và USDC amount.</P>
        <Callout type="warning">
          Nếu không đặt arbiter, client không thể dispute milestones. Khuyên dùng để bảo vệ cả hai bên.
        </Callout>

        <H2>F4 — Agreement Detail</H2>
        <P>Màn hình trung tâm. Value card, parties, status callout, milestone list. Actions theo role:</P>
        <Table
          headers={['Trạng thái', 'Role', 'Action']}
          rows={[
            ['Open', 'Contributor', 'Accept Agreement'],
            ['Open', 'Client', 'Cancel Agreement (full refund)'],
            ['Active', 'Contributor', 'Submit Delivery (từng milestone)'],
            ['Active', 'Client', 'Approve Milestone / Dispute Milestone'],
            ['Disputed', 'Arbiter', 'Approve Milestone'],
            ['Disputed (>30 ngày)', 'Client', 'Force Close Dispute (refund unreleased)'],
            ['Active + deadline qua', 'Client', 'Cancel Agreement (refund unreleased)'],
          ]}
        />

        <H2>F5 — MilestoneRow</H2>
        <P>Row expandable trong AgreementDetail. Hiển thị delivery hash, ngày submit/approve, spinner feedback trong lúc tx pending, explorer link sau confirm.</P>

        <H2>F6 — Profile</H2>
        <P>Hiển thị địa chỉ ví, USDC balance, pending withdrawals (USDC chờ rút). Nút Withdraw gọi <Code>FlowWork.withdraw()</Code>. Onchain reputation: completed count, total earned, total paid.</P>

        <H2>F7 — Dark Mode</H2>
        <P>Toggle Sun/Moon trong header và mobile nav. Lưu vào localStorage. Auto-detect <Code>prefers-color-scheme</Code>. Smooth 0.22s transition.</P>

        <H2>F8 — Docs (trang này)</H2>
        <P>Tài liệu dự án nhúng trong app tại <Code>/docs</Code>. Sidebar navigation, content đầy đủ về tất cả khía cạnh của dự án.</P>
      </div>
    ),
  },
  {
    id: 'contract',
    title: 'Smart Contract',
    icon: Code2,
    content: (
      <div>
        <H1>Smart Contract — FlowWork.sol</H1>
        <Table
          headers={['Property', 'Value']}
          rows={[
            ['File', 'contracts/FlowWork.sol'],
            ['Language', 'Solidity ^0.8.20'],
            ['Chain', 'Arc Testnet (Chain ID: 5042002)'],
            ['Address', '0x7bde6df4d2f103b69d1f4ae10f8f0f743a424ce7'],
            ['USDC', '0x3600000000000000000000000000000000000000 (6 decimals)'],
            ['Inherits', 'ReentrancyGuard (OpenZeppelin 5.1.0)'],
            ['Pattern', 'Pull-payment (pendingWithdrawals)'],
          ]}
        />

        <H2>State Machine</H2>
        <Pre>{`Agreement: Open → Active → Completed
                    ↓        ↓
                 Cancelled  Disputed → Cancelled (forceClose)
                              ↓
                        (arbiter approve) → Active/Completed

Milestone: Pending → Submitted → Approved
                        ↓
                     Disputed → (arbiter approve) → Approved`}</Pre>

        <H2>Write Functions</H2>
        <Table
          headers={['Function', 'Caller', 'Điều kiện']}
          rows={[
            ['createAgreement()', 'Client', 'nonReentrant, USDC approved trước'],
            ['acceptAgreement()', 'Contributor', 'status == Open'],
            ['submitDelivery()', 'Contributor', 'status == Active, milestone Pending'],
            ['approveMilestone()', 'Client / Arbiter', 'Client khi Active, Arbiter khi Disputed'],
            ['disputeMilestone()', 'Client', 'status Active, milestone Submitted, arbiter != 0'],
            ['forceCloseDispute()', 'Client', 'status Disputed, > 30 ngày sau updatedAt'],
            ['cancelAgreement()', 'Client', 'Open (bất kỳ lúc) hoặc Active (sau deadline)'],
            ['withdraw()', 'Bất kỳ', 'pendingWithdrawals[msg.sender] > 0'],
          ]}
        />

        <H2>Security</H2>
        <Table
          headers={['Vấn đề', 'Giải pháp']}
          rows={[
            ['Reentrancy', 'ReentrancyGuard trên tất cả write functions có transfer'],
            ['Push payment bị block', 'Pull-payment: pendingWithdrawals + withdraw()'],
            ['Dispute không có lối thoát', 'disputeMilestone chỉ cho phép khi arbiter != address(0)'],
            ['Arbiter offline/biến mất', 'forceCloseDispute() sau 30 ngày'],
            ['Fee-on-transfer token', 'Balance check trước/sau safeTransferFrom'],
          ]}
        />

        <H2>Known Issues (được chấp nhận)</H2>
        <Callout type="warning">
          <strong>Client inaction khi Active không deadline:</strong> Contributor không có timeout để escalate nếu client im lặng và không có deadline. Giải pháp: luôn đặt deadline khi tạo agreement.
        </Callout>
        <Callout type="warning">
          <strong>Cancel sau deadline với milestones đã submitted:</strong> Client có thể cancel và lấy lại tiền dù contributor đã deliver. Giải pháp: contributor nên dispute kịp thời.
        </Callout>

        <H2>Tests</H2>
        <P>57 Foundry tests: happy paths, revert paths, fuzz tests (256 runs), invariant test, fee-on-transfer mock.</P>
        <Pre>{`forge test
# [PASS] testFuzz_CreateAgreement_ValidMilestoneAmounts (256 runs)
# [PASS] testFuzz_FullFlow_TwoMilestones (256 runs)
# [PASS] test_Invariant_EscrowCoversAllPendingWithdrawals
# ... 54 more passing tests`}</Pre>
      </div>
    ),
  },
  {
    id: 'tech-stack',
    title: 'Tech Stack',
    icon: Terminal,
    content: (
      <div>
        <H1>Tech Stack</H1>

        <H2>Frontend</H2>
        <Table
          headers={['Thư viện', 'Version', 'Mục đích']}
          rows={[
            ['React', '18.3', 'UI framework'],
            ['TypeScript', '~7.0', 'Type safety (strict mode)'],
            ['Vite', '^6.0', 'Build tool + HMR'],
            ['Tailwind CSS', '^3.4', 'Utility-first CSS'],
            ['wagmi', '^2.19', 'React hooks cho EVM'],
            ['viem', '^2.56', 'Low-level EVM client'],
            ['ConnectKit', '^1.9', 'Wallet connection modal'],
            ['@tanstack/react-query', '^5.62', 'Data fetching, cache'],
            ['sonner', 'latest', 'Toast notifications'],
            ['lucide-react', 'latest', 'Icon set'],
            ['@vercel/analytics', '^2.0', 'Page view analytics'],
          ]}
        />

        <H2>Smart Contract</H2>
        <Table
          headers={['Tool', 'Version', 'Mục đích']}
          rows={[
            ['Solidity', '^0.8.20', 'Contract language'],
            ['Foundry', 'latest', 'Compile + test'],
            ['OpenZeppelin', '5.1.0', 'ReentrancyGuard, SafeERC20'],
          ]}
        />
        <Callout type="info">
          OpenZeppelin pin ở 5.1.0 — từ 5.2.0 có <Code>mcopy</Code> opcode (Cancun EVM) không tương thích với Arc Testnet (Paris EVM).
        </Callout>

        <H2>Dev Tools</H2>
        <Table
          headers={['Tool', 'Mục đích']}
          rows={[
            ['bun', 'Package manager + runtime'],
            ['oxlint', 'Linter (fast, không cần eslint)'],
            ['bun run check', 'Lint + typecheck cùng lúc'],
          ]}
        />

        <H2>Chain</H2>
        <Table
          headers={['Property', 'Value']}
          rows={[
            ['Network', 'Arc Testnet'],
            ['Chain ID', '5042002'],
            ['Native gas', 'USDC (Arc: gas token = USDC)'],
            ['USDC ERC-20', '0x3600000000000000000000000000000000000000'],
            ['USDC Decimals', '6'],
            ['Explorer', 'https://explorer.testnet.arc.io'],
          ]}
        />
      </div>
    ),
  },
  {
    id: 'design',
    title: 'Design System',
    icon: Palette,
    content: (
      <div>
        <H1>Design System & UI/UX</H1>
        <P>Arc Light / Arc Dark — tối giản, professional, định nghĩa hoàn toàn qua CSS custom properties và Tailwind. Không dùng MUI, Chakra, shadcn.</P>

        <H2>Design Tokens chính</H2>
        <Table
          headers={['Token', 'Light', 'Dark', 'Sử dụng']}
          rows={[
            ['--bg', '#ffffff', '#0d1117', 'Background trang'],
            ['--surface', 'rgba(255,255,255,0.72)', 'rgba(22,27,34,0.80)', 'Cards, panels'],
            ['--ink', '#122d45', '#e6edf3', 'Primary text'],
            ['--muted', '#6b6580', '#8b949e', 'Body text'],
            ['--accent', '#122d45', '#4a9eff', 'CTA buttons, links'],
            ['--success', '#1a8047', '#34c472', 'Approved, completed'],
            ['--danger', '#ba2b4c', '#f4607a', 'Error, disputed'],
          ]}
        />

        <H2>Typography</H2>
        <Pre>{`body       → 'DM Sans', sans-serif         /* body */
.display   → 'Space Grotesk', sans-serif   /* headings, numbers */
.mono      → 'JetBrains Mono', Menlo       /* addresses, hashes */`}</Pre>

        <H2>Dark Mode</H2>
        <Pre>{`/* CSS */
[data-theme="dark"] { --bg: #0d1117; --ink: #e6edf3; ... }

/* Hook */
const { theme, toggle } = useTheme()
// localStorage → prefers-color-scheme → 'light'`}</Pre>
        <P>Smooth transition 0.22s trên tất cả color properties. Toggle Sun/Moon trong header và mobile nav.</P>

        <H2>Nguyên tắc UX</H2>
        <ul className="text-sm space-y-2 mb-4" style={{ color: 'var(--muted)' }}>
          {[
            'Context-aware actions: chỉ hiện action phù hợp với role + status',
            'Onchain feedback: toast + explorer link sau mỗi giao dịch',
            'Progressive disclosure: milestone rows collapse mặc định',
            'Empty states có CTA rõ ràng',
            'Error messages human-friendly qua parseOnchainError()',
            'Tiền luôn rõ ràng: 2 chữ số thập phân + USDC icon',
            'Tx feedback: "Waiting for wallet..." → "Submitting onchain..." → success',
          ].map((p) => (
            <li key={p} className="flex items-start gap-2">
              <ChevronRight className="size-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
              {p}
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: 'standards',
    title: 'Coding Standards',
    icon: FileText,
    content: (
      <div>
        <H1>Coding Standards</H1>

        <H2>Naming Conventions</H2>
        <H3>TypeScript / React</H3>
        <Table
          headers={['Loại', 'Convention', 'Ví dụ']}
          rows={[
            ['Component', 'PascalCase', 'AgreementCard, MilestoneRow'],
            ['Hook', 'camelCase, prefix use', 'useFlowWork, useTheme'],
            ['Utility function', 'camelCase', 'formatUsdc, parseOnchainError'],
            ['Constant', 'SCREAMING_SNAKE_CASE', 'FLOWWORK_ADDRESS'],
            ['CSS variable', 'kebab-case, -- prefix', '--accent, --surface-muted'],
            ['File: component', 'PascalCase.tsx', 'AgreementCard.tsx'],
            ['File: hook', 'camelCase.ts', 'useFlowWork.ts'],
          ]}
        />
        <H3>Solidity</H3>
        <Table
          headers={['Loại', 'Convention', 'Ví dụ']}
          rows={[
            ['Contract', 'PascalCase', 'FlowWork'],
            ['Function public', 'camelCase', 'createAgreement, withdraw'],
            ['State var private', 'camelCase, _ prefix', '_agreements'],
            ['Constant', 'SCREAMING_SNAKE_CASE', 'DISPUTE_TIMEOUT'],
            ['Event', 'PascalCase', 'AgreementCreated'],
            ['Error message', '"ContractName: description"', '"FlowWork: only client"'],
          ]}
        />

        <H2>React Rules</H2>
        <Callout type="info">
          Dùng <Code>useEffect</Code> cho tất cả side effects (toast, refetch) — không gọi trực tiếp trong render body để tránh infinite loops.
        </Callout>
        <Pre>{`// Đúng
useEffect(() => {
  if (isSuccess) toast.success('Done!')
}, [isSuccess])

// Sai — chạy mỗi render
if (isSuccess) toast.success('Done!')`}</Pre>

        <H2>Commit Convention</H2>
        <Pre>{`<type>(<scope>): <short description>

Types: feat | fix | refactor | style | contract | docs | chore | test

Ví dụ:
feat(create): add deadline validation
fix(milestone): prevent submit button flash
contract(flowwork): add forceCloseDispute
docs: update tech stack and changelog`}</Pre>

        <H2>Review Checklist</H2>
        <H3>Frontend</H3>
        <ul className="text-sm space-y-1.5 mb-4" style={{ color: 'var(--muted)' }}>
          {['Lint pass, typecheck pass (bun run check)', 'Không có any mới', 'Design tokens được dùng, không hardcode màu', 'Responsive mobile + desktop', 'Loading states và error states handled', 'Toast + explorer link sau action onchain'].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <div className="size-4 rounded border flex-shrink-0" style={{ borderColor: 'var(--border)' }} />
              {item}
            </li>
          ))}
        </ul>
        <H3>Smart Contract</H3>
        <ul className="text-sm space-y-1.5 mb-4" style={{ color: 'var(--muted)' }}>
          {['forge build pass', 'forge test pass (57 tests)', 'Checks-Effects-Interactions tuân thủ', 'nonReentrant trên mọi function có transfer', 'Events emit đầy đủ sau state changes'].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <div className="size-4 rounded border flex-shrink-0" style={{ borderColor: 'var(--border)' }} />
              {item}
            </li>
          ))}
        </ul>

        <H2>Tiêu chuẩn chất lượng</H2>
        <Table
          headers={['Tiêu chuẩn', 'Yêu cầu']}
          rows={[
            ['TypeScript errors', 'Zero (bắt buộc)'],
            ['Lint errors', 'Zero (bắt buộc)'],
            ['Lint warnings', 'Acceptable, giải thích trong PR'],
            ['Contract test coverage', 'Happy path + revert path cho mọi function'],
            ['Wallet chưa kết nối', 'WalletGate, không crash'],
            ['Tx pending', 'Loading state rõ ràng'],
            ['Tx fail', 'Toast human-friendly'],
            ['Tx success', 'Toast + explorer link'],
          ]}
        />
      </div>
    ),
  },
  {
    id: 'changelog',
    title: 'Changelog',
    icon: GitCommit,
    content: (
      <div>
        <H1>Changelog</H1>

        <H2>v1.3.0 — 2026-09-28</H2>
        <ul className="text-sm space-y-1.5 mb-6" style={{ color: 'var(--muted)' }}>
          {[
            'Dark Mode / Light Mode với system preference detection',
            'Footer 4 columns: Brand, Product, Resources, Onchain',
            'Vercel Analytics (@vercel/analytics)',
            'Docs viewer (/docs route trong app)',
            'Fix: Toast spam bug — useEffect pattern',
            'Fix: Blank screen khi submit delivery — spinner + feedback',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <ChevronRight className="size-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--status-active)' }} />
              {item}
            </li>
          ))}
        </ul>

        <H2>v1.2.0 — 2026-09-23</H2>
        <ul className="text-sm space-y-1.5 mb-6" style={{ color: 'var(--muted)' }}>
          {[
            'Security round 2: cancelAgreement Active, forceCloseDispute, fee-on-transfer guard',
            '57 Foundry unit tests + fuzz + invariant',
            'Pending Withdrawals UI trong Profile',
            'ABI inline (Vercel build fix)',
            'Fix: event order MilestoneApproved → AgreementCompleted',
            'Fix: withdraw() revert khi balance = 0',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <ChevronRight className="size-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--status-active)' }} />
              {item}
            </li>
          ))}
        </ul>

        <H2>v1.1.0 — 2026-09-23</H2>
        <ul className="text-sm space-y-1.5 mb-6" style={{ color: 'var(--muted)' }}>
          {[
            'Security round 1: pull-payment pattern, arbiter guard cho dispute',
            'GitHub repository: github.com/AnhHaiXs/flowwork',
            'Project documentation (docs/ folder)',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <ChevronRight className="size-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--status-active)' }} />
              {item}
            </li>
          ))}
        </ul>

        <H2>v1.0.0 — 2026-09-23</H2>
        <ul className="text-sm space-y-1.5 mb-6" style={{ color: 'var(--muted)' }}>
          {[
            'FlowWork smart contract (escrow + milestones + ReentrancyGuard)',
            'Full React frontend: Dashboard, List, Create, Detail, Profile',
            'Wallet integration: wagmi v2 + ConnectKit + Arc Testnet',
            'USDC flows: approve + createAgreement + approveMilestone + withdraw',
            'Contract deployed: 0x7bde6df4d2f103b69d1f4ae10f8f0f743a424ce7',
            'Design system: Arc Light tokens, 3 font families',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <ChevronRight className="size-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--status-active)' }} />
              {item}
            </li>
          ))}
        </ul>
      </div>
    ),
  },
]

// ── DocsViewer component ─────────────────────────────────────────────────

export function DocsViewer() {
  const [activeId, setActiveId] = useState('overview')
  const [mobileOpen, setMobileOpen] = useState(false)

  const active = DOCS.find((d) => d.id === activeId) ?? DOCS[0]

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-6 py-6 pb-24 lg:pb-12">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="size-5" style={{ color: 'var(--accent)' }} />
          <h1 className="display text-2xl font-700" style={{ color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            Documentation
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Tài liệu đầy đủ về thiết kế, kỹ thuật và vận hành của FlowWork
        </p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar — desktop */}
        <aside className="hidden md:block w-52 flex-shrink-0">
          <div
            className="rounded-2xl border p-2 sticky top-20"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <nav className="space-y-0.5">
              {DOCS.map(({ id, title, icon: Icon }) => {
                const isActive = id === activeId
                return (
                  <button
                    key={id}
                    onClick={() => setActiveId(id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-left transition-colors"
                    style={{
                      background: isActive ? 'var(--surface-muted)' : 'transparent',
                      color: isActive ? 'var(--ink)' : 'var(--muted)',
                    }}
                  >
                    <Icon className="size-4 flex-shrink-0" />
                    {title}
                  </button>
                )
              })}
            </nav>

            {/* GitHub link */}
            <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
              <a
                href="https://github.com/AnhHaiXs/flowwork/tree/main/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:opacity-80 transition-opacity"
                style={{ color: 'var(--subtle)' }}
              >
                <ExternalLink className="size-3.5" />
                View on GitHub
              </a>
            </div>
          </div>
        </aside>

        {/* Mobile nav toggle */}
        <div className="md:hidden w-full mb-4">
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--ink)' }}
          >
            <div className="flex items-center gap-2">
              {(() => { const Icon = active.icon; return <Icon className="size-4" /> })()}
              {active.title}
            </div>
            <ChevronRight className={`size-4 transition-transform ${mobileOpen ? 'rotate-90' : ''}`} style={{ color: 'var(--subtle)' }} />
          </button>
          {mobileOpen && (
            <div
              className="mt-1 rounded-xl border p-1.5"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              {DOCS.map(({ id, title, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => { setActiveId(id); setMobileOpen(false) }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-left"
                  style={{
                    background: id === activeId ? 'var(--surface-muted)' : 'transparent',
                    color: id === activeId ? 'var(--ink)' : 'var(--muted)',
                  }}
                >
                  <Icon className="size-4" />
                  {title}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div
            className="rounded-2xl border p-6"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            {active.content}

            {/* Pagination */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t" style={{ borderColor: 'var(--border)' }}>
              {(() => {
                const idx = DOCS.findIndex((d) => d.id === activeId)
                const prev = idx > 0 ? DOCS[idx - 1] : null
                const next = idx < DOCS.length - 1 ? DOCS[idx + 1] : null
                return (
                  <>
                    {prev ? (
                      <button
                        onClick={() => setActiveId(prev.id)}
                        className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
                        style={{ color: 'var(--accent)' }}
                      >
                        <ArrowLeft className="size-4" />
                        {prev.title}
                      </button>
                    ) : <div />}
                    {next ? (
                      <button
                        onClick={() => setActiveId(next.id)}
                        className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
                        style={{ color: 'var(--accent)' }}
                      >
                        {next.title}
                        <ChevronRight className="size-4" />
                      </button>
                    ) : <div />}
                  </>
                )
              })()}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
