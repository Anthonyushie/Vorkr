export type BountyStatus = 'open' | 'released' | 'refunded'

export interface Bounty {
  id: number
  creator: string
  amountUstx: string
  issueLink: string
  details: string
  developer?: string
  deadline: number
  proof?: string
  status: BountyStatus
}