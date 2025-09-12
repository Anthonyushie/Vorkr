import { Header } from '@/components/layout/Header'
import { BountyCard } from '@/components/bounty/BountyCard'
import { Button } from '@/components/ui/button-brutal'
import { Input } from '@/components/ui/input'
import { useEffect, useMemo, useState } from 'react'
import { useStacks } from '@/contexts/StacksContext'
import { CONTRACT_ADDRESS, CONTRACT_NAME } from '@/config'
import { callReadOnlyFunction, cvToJSON, uintCV } from '@stacks/transactions'
import { getStacksNetwork } from '@/lib/stacks'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { applyBounty, submitPr } from '@/lib/stacksClient'
import { toast } from '@/hooks/use-toast'

interface ChainBounty {
  id: number
  title: string
  description: string
  repo: string
  issue: number
  rewardUstx: string
  deadlineHeight?: number
  assignee?: string
  status: 'open' | 'assigned' | 'submitted' | 'completed' | 'refunded'
  applicants: string[]
}

async function fetchIds(networkType: 'mainnet' | 'testnet') {
  const res = await callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'get-all-bounty-ids',
    functionArgs: [],
    network: getStacksNetwork(networkType),
    senderAddress: CONTRACT_ADDRESS,
  })
  const json = cvToJSON(res)
  const ids = (json.value as any[]).map(x => Number(x.value))
  return ids
}

async function fetchBounty(networkType: 'mainnet' | 'testnet', id: number): Promise<ChainBounty | null> {
  const res = await callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'get-bounty',
    functionArgs: [uintCV(BigInt(id))],
    network: getStacksNetwork(networkType),
    senderAddress: CONTRACT_ADDRESS,
  })
  const json = cvToJSON(res)
  if (json.type !== 'response' || json.value.type !== 'optional' || !json.value.value) return null
  const t = json.value.value as any
  const applicants: string[] = (t.value.applicants.value as any[]).map((a: any) => a.value)
  return {
    id,
    title: t.value.title.value,
    description: t.value.description.value,
    repo: t.value.repo.value,
    issue: Number(t.value.issue.value),
    rewardUstx: String(t.value['reward-ustx'].value),
    deadlineHeight: t.value['deadline-height'].value ? Number(t.value['deadline-height'].value.value) : undefined,
    assignee: t.value.assignee.value ? (t.value.assignee.value as any).value : undefined,
    status: t.value.status.value,
    applicants,
  }
}

const prSchema = z.object({ pr: z.string().url() })

export default function Browse() {
  const { networkType } = useStacks()
  const [bounties, setBounties] = useState<ChainBounty[]>([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState<ChainBounty | null>(null)
  const form = useForm({ resolver: zodResolver(prSchema) })

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const ids = await fetchIds(networkType)
        const rows = await Promise.all(ids.map(id => fetchBounty(networkType, id)))
        setBounties(rows.filter(Boolean) as ChainBounty[])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [networkType])

  const filtered = useMemo(() => bounties.filter(b => {
    const hay = `${b.title} ${b.description} ${b.repo} ${b.status}`.toLowerCase()
    return hay.includes(q.toLowerCase())
  }), [bounties, q])

  const onApply = async (b: ChainBounty) => {
    try {
      await applyBounty(b.id, networkType)
      toast({ title: 'Applied', description: 'Your GitHub username has been recorded on this bounty.' })
    } catch (e: any) {
      toast({ title: 'Failed to apply', description: e?.message || 'Unknown error', variant: 'destructive' })
    }
  }

  const onSubmitPr = async (values: z.infer<typeof prSchema>) => {
    if (!active) return
    try {
      await submitPr(active.id, values.pr, networkType)
      toast({ title: 'PR submitted', description: 'Submission recorded on-chain.' })
      setActive(null)
    } catch (e: any) {
      toast({ title: 'Failed to submit PR', description: e?.message || 'Unknown error', variant: 'destructive' })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-heading">Browse <span className="text-primary">Bounties</span></h1>
          <div className="w-full max-w-sm">
            <Input className="input-brutal" placeholder="Search bounties..." value={q} onChange={e => setQ(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-body">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {filtered.map(b => (
              <div key={b.id} className="space-y-3">
                <BountyCard
                  id={String(b.id)}
                  title={b.title}
                  description={b.description}
                  reward={Math.floor(Number(b.rewardUstx) / 1_000_0) / 100}
                  currency="STX"
                  tags={[b.repo]}
                  deadline={b.deadlineHeight ? `h#${b.deadlineHeight}` : '—'}
                  applicants={b.applicants.length}
                  creator={{ name: b.repo.split('/')[0] }}
                  status={b.status === 'open' || b.status === 'in-progress' ? 'open' : (b.status === 'completed' ? 'completed' : 'in-progress')}
                />
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => onApply(b)}>Apply</Button>
                  <Dialog open={active?.id === b.id} onOpenChange={open => setActive(open ? b : null)}>
                    <DialogTrigger asChild>
                      <Button className="flex-1">Submit PR</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Submit PR for “{b.title}”</DialogTitle>
                      </DialogHeader>
                      <Form {...form}>
                        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmitPr)}>
                          <FormField name="pr" control={form.control} render={({ field }) => (
                            <FormItem>
                              <FormLabel>PR Link</FormLabel>
                              <FormControl>
                                <Input className="input-brutal" placeholder="https://github.com/owner/repo/pull/123" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <div className="flex justify-end">
                            <Button type="submit">Submit</Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
