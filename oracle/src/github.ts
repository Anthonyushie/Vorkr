import { GITHUB_TOKEN } from './config.js'

export type PullRequest = {
  number: number
  state: string
  merged_at: string | null
  user: { login: string }
  base: { repo: { full_name: string } }
}

export async function getPullRequest(owner: string, repo: string, number: number): Promise<PullRequest> {
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${number}`
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github+json',
      ...(GITHUB_TOKEN ? { 'Authorization': `Bearer ${GITHUB_TOKEN}` } : {}),
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`)
  return res.json() as any
}

export function parsePrLink(pr: string): { owner: string, repo: string, number: number } | null {
  const m = pr.match(/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/i)
  if (!m) return null
  return { owner: m[1], repo: m[2], number: Number(m[3]) }
}
