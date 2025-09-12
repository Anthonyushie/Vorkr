import express from 'express'
import pino from 'pino'
import { CONTRACT_ADDRESS, CONTRACT_NAME, POLL_INTERVAL_MS, STACKS_NETWORK } from './config.js'
import { getAllBountyIds, getBounty, releaseBounty } from './stacks.js'
import { getPullRequest, parsePrLink } from './github.js'

const log = pino({ level: 'info' })

const app = express()
app.get('/health', (_req, res) => res.json({ ok: true }))

const processed = new Set<string>()

async function tick() {
  try {
    if (!CONTRACT_ADDRESS || !CONTRACT_NAME) {
      log.warn('Missing CONTRACT_ADDRESS/CONTRACT_NAME')
      return
    }
    const ids = await getAllBountyIds(CONTRACT_ADDRESS)
    for (const id of ids) {
      const bounty = await getBounty(CONTRACT_ADDRESS, id)
      if (!bounty) continue
      if (bounty.status !== 'submitted' || !bounty.prLink || !bounty.assignee) continue

      const key = `${id}:${bounty.prLink}`
      if (processed.has(key)) continue

      const parsed = parsePrLink(bounty.prLink)
      if (!parsed) {
        log.warn({ id, pr: bounty.prLink }, 'Cannot parse PR link')
        processed.add(key)
        continue
      }

      try {
        const pr = await getPullRequest(parsed.owner, parsed.repo, parsed.number)
        const expectedRepo = bounty.repo.toLowerCase()
        const prRepo = pr.base.repo.full_name.toLowerCase()
        const isMerged = !!pr.merged_at && pr.state === 'closed'
        const authorMatches = pr.user.login.toLowerCase() === bounty.assignee.toLowerCase()

        if (isMerged && authorMatches && prRepo === expectedRepo) {
          log.info({ id, pr: bounty.prLink }, 'PR verified, releasing bounty')
          const tx = await releaseBounty(id)
          log.info({ id, tx }, 'Release submitted')
        } else {
          log.info({ id, isMerged, authorMatches, prRepo, expectedRepo }, 'PR not eligible yet')
        }
      } catch (e: any) {
        log.error({ err: e?.message, id }, 'Validation failed')
      }

      processed.add(key)
    }
  } catch (e: any) {
    log.error({ err: e?.message }, 'Tick error')
  }
}

setInterval(tick, POLL_INTERVAL_MS)

const port = process.env.PORT ? Number(process.env.PORT) : 8787
app.listen(port, () => {
  log.info({ port, network: STACKS_NETWORK }, 'Oracle started')
})
