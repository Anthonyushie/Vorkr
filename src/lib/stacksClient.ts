import { CONTRACT_ADDRESS, CONTRACT_NAME } from '@/config'
import { getStacksNetwork } from '@/lib/stacks'
import { stacksRequest } from '@stacks/connect'
import { cvToHex, someCV, stringAsciiCV, stringUtf8CV, uintCV } from '@stacks/transactions'
import type { NetworkType } from '@/types/stacks'

export type CreateBountyInput = {
  title: string
  description: string
  repo: string // owner/repo
  issue: number
  rewardStx: number
  deadlineHeight?: number
}

export async function createBounty(input: CreateBountyInput, networkType: NetworkType) {
  const fnArgs = [
    stringUtf8CV(input.title),
    stringUtf8CV(input.description),
    stringAsciiCV(input.repo),
    uintCV(BigInt(input.issue)),
    uintCV(BigInt(Math.floor(input.rewardStx * 1_000_000))),
    input.deadlineHeight !== undefined ? someCV(uintCV(BigInt(input.deadlineHeight))) : { type: 11 } as any // none
  ].map(cvToHex)

  return stacksRequest('stx_callContract', {
    contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
    functionName: 'create-bounty',
    functionArgs: fnArgs,
    network: networkType,
  })
}

export async function applyBounty(id: number, networkType: NetworkType) {
  const fnArgs = [uintCV(BigInt(id))].map(cvToHex)
  return stacksRequest('stx_callContract', {
    contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
    functionName: 'apply-bounty',
    functionArgs: fnArgs,
    network: networkType,
  })
}

export async function submitPr(id: number, prLink: string, networkType: NetworkType) {
  const fnArgs = [uintCV(BigInt(id)), stringUtf8CV(prLink)].map(cvToHex)
  return stacksRequest('stx_callContract', {
    contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
    functionName: 'submit-pr',
    functionArgs: fnArgs,
    network: networkType,
  })
}
