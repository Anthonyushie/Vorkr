import { CONTRACT_ADDRESS, CONTRACT_NAME } from '@/config'
import { stacksRequest } from '@stacks/connect'
import { cvToHex, someCV, noneCV, stringAsciiCV, uintCV, standardPrincipalCV } from '@stacks/transactions'
import type { NetworkType } from '@/types/stacks'

export type CreateBountyInput = {
  id: number
  issueLink: string
  details: string
  developer?: string
  deadline: number
  amountStx: number
}

export async function createBounty(input: CreateBountyInput, networkType: NetworkType) {
  const fnArgs = [
    uintCV(BigInt(input.id)),
    stringAsciiCV(input.issueLink),
    stringAsciiCV(input.details),
    input.developer ? someCV(standardPrincipalCV(input.developer)) : noneCV(),
    uintCV(BigInt(input.deadline)),
    uintCV(BigInt(Math.floor(input.amountStx * 1_000_000)))
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

export async function submitProof(id: number, proof: string, networkType: NetworkType) {
  const fnArgs = [uintCV(BigInt(id)), stringAsciiCV(proof)].map(cvToHex)
  return stacksRequest('stx_callContract', {
    contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
    functionName: 'submit-proof',
    functionArgs: fnArgs,
    network: networkType,
  })
}

export async function releaseBounty(id: number, networkType: NetworkType) {
  const fnArgs = [uintCV(BigInt(id))].map(cvToHex)
  return stacksRequest('stx_callContract', {
    contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
    functionName: 'release-bounty',
    functionArgs: fnArgs,
    network: networkType,
  })
}

export async function refundBounty(id: number, networkType: NetworkType) {
  const fnArgs = [uintCV(BigInt(id))].map(cvToHex)
  return stacksRequest('stx_callContract', {
    contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
    functionName: 'refund-bounty',
    functionArgs: fnArgs,
    network: networkType,
  })
}