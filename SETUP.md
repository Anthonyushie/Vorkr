# Vorkr Setup Guide (End‑to‑End)

This guide walks you through configuring authentication, deploying the Clarity contract, wiring the frontend to the live contract, and running the oracle so payouts are automatic.

## Prerequisites
- Node.js 20+, npm 10+
- A Stacks testnet wallet (Leather)
- Supabase account (for GitHub OAuth)
- GitHub account + personal access token (PAT) for the oracle
- Clarinet (optional for local contract dev): https://github.com/hirosystems/clarinet

## 1. Clone and install
```
git clone <your-repo-url>
cd Vorkr
npm i
```

## 2. Supabase GitHub OAuth
1) Create a Supabase project
2) In Settings → API, copy Project URL and anon/public key
3) In Authentication → Providers → GitHub, click Enable
4) Create a GitHub OAuth app:
   - Homepage URL: http://localhost:5173 (or your dev URL)
   - Authorization callback URL: https://<your-project-ref>.supabase.co/auth/v1/callback
   - Put the Client ID/Secret into Supabase GitHub provider

Frontend .env (create at project root)
```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
# Optional; defaults to testnet
VITE_STACKS_NETWORK=testnet
# Will set these after deploying the contract
VITE_CONTRACT_ADDRESS=SPXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_CONTRACT_NAME=bounty-escrow
```

## 3. Run the web app (dev)
```
npm run dev
```
- Visit http://localhost:5173
- Sign in with GitHub (Supabase) and connect Leather wallet
- Dark mode toggle is in the header

## 4. Deploy the Clarity contract (testnet)
You can deploy with Clarinet or with a UI deployer. The repo includes Clarinet.toml for easy local/testnet config.

Quick sanity check
```
clarinet check
```

Deploy (choose one):
- Using Clarinet (requires configured accounts):
  - Put your deployer mnemonic in Clarinet.toml under [accounts.deployer]
  - `clarinet deploy --network testnet bounty-escrow`
- Using Hiro’s testnet deployer UI:
  - Copy contracts/bounty-escrow.clar
  - Deploy from your testnet wallet

Record the deployed values:
- CONTRACT_ADDRESS: SP...
- CONTRACT_NAME: bounty-escrow

Update frontend .env and restart dev server
```
VITE_CONTRACT_ADDRESS=SP...
VITE_CONTRACT_NAME=bounty-escrow
```

## 5. Register your GitHub username on‑chain
Developers must map their principal to their GitHub username before applying/submitting.

Temporary quick call (from browser console) using @stacks/connect:
```
import { stacksRequest } from '@stacks/connect'
import { cvToHex, stringAsciiCV } from '@stacks/transactions'
import { CONTRACT_ADDRESS, CONTRACT_NAME } from '/src/config.ts'

await stacksRequest('stx_callContract', {
  contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
  functionName: 'register-github',
  functionArgs: [cvToHex(stringAsciiCV('<your-github-username>'))],
  network: 'testnet'
})
```
A small settings UI can be added later to make this one‑click.

## 6. Post and work a bounty
- Go to /create and submit the form (Title, Description, owner/repo, Issue #, Reward STX, optional deadline height)
- This sends an @stacks/connect transaction to create-bounty and escrow funds in the contract
- Browse bounties on /browse — apply (records your GitHub username), and if assigned, submit your PR link

## 7. Start the Oracle (automatic payouts)
The oracle validates merged PRs and releases funds.

Prepare env
```
cd oracle
npm i
cp .env.sample .env
```
Fill .env
```
STACKS_NETWORK=testnet
CONTRACT_ADDRESS=SP...
CONTRACT_NAME=bounty-escrow
ORACLE_SECRET_KEY=<hex private key of the oracle/deployer/account that is contract owner>
GITHUB_TOKEN=<GitHub PAT with public_repo scope>
POLL_INTERVAL_MS=30000
```
Run
```
npm run dev
# Health check:
curl http://localhost:8787/health
```
The oracle will:
- Read bounties with status=submitted
- Parse PR link, fetch GitHub PR, verify merged, author matches assignee, repo matches
- Submit release-bounty(id) on success

## 8. Refund path (if deadline passes)
Creators can call refund-bounty(id) after block-height ≥ deadline. You can wire a small UI or use a quick call snippet similar to step 5.

## 9. Verifications
- Explorer: check the contract account balance and transactions
- Frontend: /browse should reflect updated statuses after oracle release
- Wallet: assignee should see STX balance increase post‑release

## Troubleshooting
- “Supabase environment variables not found” → set VITE_SUPABASE_URL/ANON_KEY
- “Wallet not connected / no wallets detected” → install Leather, reload, connect
- “Apply failed: not registered” → run register-github (step 5)
- “No payout after PR merge” → confirm oracle running, correct CONTRACT_ADDRESS/NAME, oracle is contract owner, PR author/login matches assignee, repo matches bounty repo, PR is merged & closed
- “Contract address mismatch” → ensure frontend .env matches deployed address/name; restart dev server

## Notes
- Funds never touch the oracle; all transfers are contract‑controlled
- Reward is zeroed on release/refund to prevent double‑spends
- For scale, add an indexer to cache bounties instead of reading live from chain on /browse
