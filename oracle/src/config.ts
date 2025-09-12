import 'dotenv/config'

export const STACKS_NETWORK = process.env.STACKS_NETWORK === 'mainnet' ? 'mainnet' : 'testnet'
export const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || ''
export const CONTRACT_NAME = process.env.CONTRACT_NAME || 'bounty-escrow'
export const ORACLE_SECRET_KEY = process.env.ORACLE_SECRET_KEY || ''
export const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ''
export const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS || 30000)
