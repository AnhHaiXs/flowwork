// FlowWork domain types

export enum AgreementStatus {
  Open = 0,
  Active = 1,
  Completed = 2,
  Cancelled = 3,
  Disputed = 4,
}

export enum MilestoneStatus {
  Pending = 0,
  Submitted = 1,
  Approved = 2,
  Disputed = 3,
}

export interface Agreement {
  id: bigint
  client: string
  contributor: string
  arbiter: string
  totalAmount: bigint
  releasedAmount: bigint
  status: AgreementStatus
  createdAt: bigint
  updatedAt: bigint
  title: string
  milestoneCount: bigint
  deadline: bigint
}

export interface Milestone {
  id: bigint
  agreementId: bigint
  title: string
  amount: bigint
  status: MilestoneStatus
  deliveryHash: string
  submittedAt: bigint
  approvedAt: bigint
}

export type AppView = 'dashboard' | 'agreements' | 'create' | 'detail' | 'profile' | 'docs'

export interface CreateAgreementForm {
  contributor: string
  arbiter: string
  title: string
  deadline: string
  milestones: { title: string; amount: string }[]
}
