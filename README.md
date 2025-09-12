# Vorkr — GitHub Bounty Escrow on Stacks

A neo‑brutalist bounty platform where sponsors escrow STX into a Clarity smart contract and pay developers automatically once their GitHub pull request is merged. Auth is GitHub‑only (via Supabase). Wallets use @stacks/connect (Leather). The UI is Vite + React 18 + TypeScript + Tailwind + shadcn‑ui.

- Smart contract: principal↔GitHub username registry, escrowed bounties, apply/assign/submit, oracle‑gated release, deadline refunds.
- Oracle service: watches chain for PR submissions, validates with GitHub API, triggers payout.
- Frontend: Post Bounty (/create), Browse Bounties (/browse), Dashboard (/dashboard), with wallet connect and dark mode toggle.

For step‑by‑step setup and deployment instructions, see SETUP.md.

## Architecture

- Clarity contract (contracts/bounty-escrow.clar)
  - Stores bounties: title, description, repo, issue, reward, deadline, status, applicants, assignee, PR link
  - Funds are escrowed at creation; payout is contract‑driven only
  - Only contract owner/oracle can release funds; creators can refund after deadline
  - Emits print events for indexing
- Oracle (oracle/)
  - Polls Stacks chain for bounties with submitted PRs
  - Validates “merged” state and author matches on-chain assignee via GitHub API
  - Calls release-bounty on success using oracle wallet key
- Frontend (src/)
  - Supabase GitHub OAuth for sign‑in, Stacks wallet for transactions
  - /create creates on‑chain bounty with escrow
  - /browse reads bounties from chain; apply and submit PR
  - /dashboard shows profile/wallet summaries and histories

## Repo structure (high‑level)

```
contracts/
  bounty-escrow.clar         # Clarity smart contract
oracle/
  package.json
  tsconfig.json
  .env.sample
  src/
    config.ts                # env
    stacks.ts                # chain reads/calls
    github.ts                # GitHub API
    index.ts                 # web server + poller (/health)
src/
  App.tsx                    # routes
  config.ts                  # frontend contract config
  lib/
    stacks.ts                # wallet + network helpers
    stacksClient.ts          # contract call helpers (create, apply, submit PR)
  pages/
    Create.tsx               # /create Post Bounty
    Browse.tsx               # /browse Bounty Feed
    Dashboard.tsx            # /dashboard
    SignIn.tsx, Index.tsx, ...
  components/
    layout/Header.tsx        # header + wallet + theme toggle
    bounty/BountyCard.tsx
README.md
SETUP.md
Clarinet.toml                 # local/testnet config
```

## Smart Contract: bounty-escrow.clar

Storage
- p2u: principal → github username
- u2p: github username → principal
- bounties: id → {
  creator, title, description, repo, issue, reward-ustx, deadline-height?, assignee?, pr-link?, status, applicants[]
}
- next-id: next bounty id
- bounty-ids: list of all ids
- owner: set at deployment to tx-sender (the contract deployer/oracle)

Statuses
- "open" → "assigned" → "submitted" → "completed" | "refunded"

Public functions
- (register-github (username (string-ascii 39)))
- (create-bounty (title (string-utf8 120)) (description (string-utf8 500)) (repo (string-ascii 100)) (issue uint) (reward-ustx uint) (deadline (optional uint)))
  - Transfers STX from tx-sender to contract for escrow
- (apply-bounty (id uint))
- (assign-bounty (id uint) (username (string-ascii 39))) ; creator only
- (submit-pr (id uint) (pr (string-utf8 200))) ; assignee only
- (release-bounty (id uint)) ; owner/oracle only, pays assignee principal
- (refund-bounty (id uint)) ; creator only, after deadline

Read‑only functions
- (get-owner) → principal
- (get-username who) → (optional username)
- (get-principal username) → (optional principal)
- (get-bounty id) → (optional bounty)
- (get-all-bounty-ids) → (list uint)

Events (print)
- { event: "register", principal, username }
- { event: "create", id, creator, reward }
- { event: "apply", id, username }
- { event: "assign", id, username }
- { event: "submit", id, username, pr }
- { event: "release", id, to, username }
- { event: "refund", id, to }

Security/Correctness
- Escrow: create‑bounty transfers from caller to contract principal
- Payouts: only owner/oracle can release; transfers from contract to assignee
- Refunds: only creator after deadline, transfers from contract to creator
- Prevents double‑spend by zeroing reward after release/refund
- Permission checks for all state transitions

## Oracle Service

Responsibilities
- Poll chain for bounties with status=submitted
- Parse PR link, load GitHub PR, verify:
  - PR is merged and closed
  - PR author’s GitHub login matches on‑chain assignee username
  - PR repo matches bounty repo
- On valid: call release-bounty(id)

Config (oracle/.env)
- STACKS_NETWORK=testnet|mainnet
- CONTRACT_ADDRESS=SP...
- CONTRACT_NAME=bounty-escrow
- ORACLE_SECRET_KEY=hex private key of oracle wallet
- GITHUB_TOKEN=GitHub PAT (read public repo)
- POLL_INTERVAL_MS=30000

Run
- cd oracle && npm i
- cp .env.sample .env (fill values)
- npm run dev
- Health: GET http://localhost:8787/health → { ok: true }

## Frontend

Routes
- /create: Post Bounty — escrows STX and writes on chain
- /browse: Bounty Feed — reads chain; apply; submit PR
- /dashboard: Profile + wallet + history (mock history data for now)
- /signin, /auth/callback: Supabase GitHub OAuth

Contract calls
- src/lib/stacksClient.ts
  - createBounty, applyBounty, submitPr — all via @stacks/connect

Auth & Wallet
- Supabase GitHub OAuth (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- Stacks Leather wallet via @stacks/connect with network switch

Dark mode
- next-themes + Tailwind dark class, toggle in header

## Environment Variables

Frontend (.env)
- VITE_SUPABASE_URL=https://<project>.supabase.co
- VITE_SUPABASE_ANON_KEY=...
- VITE_STACKS_NETWORK=testnet|mainnet (default testnet)
- VITE_CONTRACT_ADDRESS=SP...
- VITE_CONTRACT_NAME=bounty-escrow

Oracle (.env)
- See Oracle Service section

## Development

Install & run web
- npm i
- npm run dev

Clarinet (optional local dev)
- clarinet check
- clarinet console
- clarinet integrate
- clarinet deploy --network testnet bounty-escrow

## Typical workflow
1) Sign in with GitHub (/signin) and connect Stacks wallet
2) Register on‑chain GitHub username (see SETUP.md for quick call snippet)
3) Post a bounty (/create) — funds escrowed to contract
4) Developers apply (/browse)
5) Creator assigns one GitHub username
6) Assignee submits PR link
7) Oracle verifies PR and releases payout to assignee principal
8) If deadline passes without completion, creator calls refund

## Limitations / Notes
- A simple on‑chain registry maps principal↔GitHub username; ensure developers register before applying or submitting
- The oracle must run continuously for automatic payouts
- Browse data is read live from chain; for scale, add an indexer/cacher later

For installation and deployment with all prerequisites, see SETUP.md.
