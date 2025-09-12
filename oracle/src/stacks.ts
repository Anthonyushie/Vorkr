import { STACKS_NETWORK, CONTRACT_ADDRESS, CONTRACT_NAME, ORACLE_SECRET_KEY } from './config.js'
import { StacksMainnet, StacksTestnet } from '@stacks/network'
import {
  AnchorMode,
  callReadOnlyFunction,
  ClarityType,
  cvToJSON,
  makeContractCall,
  PostConditionMode,
  someCV,
  stringAsciiCV,
  stringUtf8CV,
  tupleCV,
  uintCV,
  broadcastTransaction,
  standardPrincipalCV,
} from '@stacks/transactions'

const network = STACKS_NETWORK === 'mainnet' ? new StacksMainnet() : new StacksTestnet()

export type Bounty = {
  id: bigint
  creator: string
  title: string
  description: string
  repo: string
  issue: bigint
  rewardUstx: bigint
  deadlineHeight?: bigint
  assignee?: string
  prLink?: string
  status: string
  applicants: string[]
}

export async function getAllBountyIds(sender: string): Promise<bigint[]> {
  const res = await callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'get-all-bounty-ids',
    functionArgs: [],
    network,
    senderAddress: sender,
  })
  const json = cvToJSON(res)
  const list = (json.value as any[])
  return list.map((x) => BigInt(x.value))
}

export async function getBounty(sender: string, id: bigint): Promise<Bounty | null> {
  const res = await callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'get-bounty',
    functionArgs: [uintCV(id)],
    network,
    senderAddress: sender,
  })
  const json = cvToJSON(res)
  if (json.type !== 'response' || json.value.type !== 'optional') return null
  if (!json.value.value) return null
  const t = json.value.value as any
  const applicants: string[] = (t.value.applicants.value as any[]).map((a: any) => a.value)
  return {
    id,
    creator: t.value.creator.value,
    title: t.value.title.value,
    description: t.value.description.value,
    repo: t.value.repo.value,
    issue: BigInt(t.value.issue.value),
    rewardUstx: BigInt(t.value['reward-ustx'].value),
    deadlineHeight: t.value['deadline-height'].value ? BigInt(t.value['deadline-height'].value.value) : undefined,
    assignee: t.value.assignee.value ? (t.value.assignee.value as any).value : undefined,
    prLink: t.value['pr-link'].value ? (t.value['pr-link'].value as any).value : undefined,
    status: t.value.status.value,
    applicants,
  }
}

export async function releaseBounty(id: bigint) {
  const tx = await makeContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'release-bounty',
    functionArgs: [uintCV(id)],
    network,
    senderKey: ORACLE_SECRET_KEY,
    postConditionMode: PostConditionMode.Deny,
    anchorMode: AnchorMode.Any,
  })
  const resp = await broadcastTransaction(tx, network)
  return resp
}
