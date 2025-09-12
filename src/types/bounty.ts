export type BountyStatus = 'open' | 'assigned' | 'submitted' | 'completed' | 'refunded'

export interface Bounty {
  id: number
  title: string
  description: string
  repo: string
  issue: number
  rewardUstx: string
  deadlineHeight?: number
  assignee?: string
  status: BountyStatus
  applicants: string[]
}
