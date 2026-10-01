# Changelog

## [v1.3.0] — 2026-09-28

### Added
- **Dark Mode / Light Mode** — toggle button trong header và mobile nav, lưu vào localStorage, detect system preference (`prefers-color-scheme`), smooth 0.22s color transitions
- **Footer 4 columns** — Brand + tagline + social links, Product nav links, Resources (docs, GitHub), Onchain (contract address, ArcScan, network badge)
- **Vercel Analytics** — `@vercel/analytics/react` mounted trong `main.tsx`
- **Tài liệu trong app** — `/docs` route với DocsViewer, có thể truy cập từ nav và footer

### Fixed
- **Toast spam bug** — chuyển tất cả `toast()` / `refetch()` từ render body sang `useEffect` — toast chỉ fire một lần thay vì mỗi re-render
- **Blank screen khi submit delivery** — thêm spinner với text "Waiting for wallet..." / "Submitting onchain...", optimistic preview của giá trị đã submit, explorer link sau khi confirm

---

## [v1.2.0] — 2026-09-23

### Added
- **Security fixes round 2** — cancelAgreement cho Active status sau deadline, forceCloseDispute() sau 30 ngày, balance check fee-on-transfer trong createAgreement
- **57 unit tests** (Foundry) — happy paths, revert paths, fuzz tests, invariant test, fee-on-transfer mock
- **Pending Withdrawals UI** — card + Withdraw button trong Profile view
- **Production polish** — wire deployed address, ABI inline (không phụ thuộc contracts/out/)

### Fixed
- **Vercel build** — ABI inline vào `src/contract.ts` để build không cần `contracts/out/`
- **Event order** — `MilestoneApproved` emit trước `AgreementCompleted` (đúng semantic order)
- **withdraw() guard** — revert nếu `pendingWithdrawals == 0` thay vì emit event với amount = 0

---

## [v1.1.0] — 2026-09-23

### Added
- **Security fixes round 1** — pull-payment pattern (pendingWithdrawals + withdraw()), require arbiter cho disputeMilestone
- **GitHub repository** — `https://github.com/AnhHaiXs/flowwork`
- **Project documentation** — `docs/` folder với 6 file markdown

### Security
- Pull-payment thay push — tránh blocklist address bricking payouts
- disputeMilestone require arbiter != address(0) — tránh dispute deadlock

---

## [v1.0.0] — 2026-09-23

### Added
- **FlowWork smart contract** — escrow + milestones + ReentrancyGuard
- **Full React frontend** — Dashboard, AgreementList, CreateAgreement, AgreementDetail, Profile
- **Wallet integration** — wagmi v2 + ConnectKit + Arc Testnet config
- **USDC flows** — approve + createAgreement (2-step), approveMilestone → pendingWithdrawals
- **Contract deployed** — Arc Testnet `0x7bde6df4d2f103b69d1f4ae10f8f0f743a424ce7`
- **Design system** — Arc Light tokens, DM Sans / Space Grotesk / JetBrains Mono
- **Status badges** — AgreementBadge + MilestoneBadge với màu semantic
- **TxButton** — loading state tự động từ wagmi isPending/isConfirming
- **WalletGate** — bảo vệ views yêu cầu kết nối ví
