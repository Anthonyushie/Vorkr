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
import { applyBounty, submitProof } from '@/lib/stacksClient'
import { toast } from '@/hooks/use-toast'
import { Link } from 'react-router-dom'

interface ChainBounty {
  id: number
  creator: string
  amountUstx: string
  issueLink: string
  details: string
  developer?: string
  deadline: number
  status: 'open' | 'released' | 'refunded'
  proof?: string
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
  return {
    id,
    creator: (t.value.creator.value as string),
    amountUstx: String(t.value.amount.value),
    issueLink: t.value['issue-link'].value,
    details: t.value.details.value,
    developer: t.value.developer.value ? (t.value.developer.value as any).value : undefined,
    deadline: Number(t.value.deadline.value),
    status: t.value.status.value,
    proof: t.value.proof.value ? (t.value.proof.value as any).value : undefined,
  }
}

const proofSchema = z.object({ proof: z.string().url().max(256) })

export default function Browse() {
  const { networkType, stxAddress } = useStacks()
  const [bounties, setBounties] = useState<ChainBounty[]>([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState<ChainBounty | null>(null)
  const form = useForm({ resolver: zodResolver(proofSchema) }) as any

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const ids = await fetchIds(networkType)
        const rows = await Promise.all(ids.map(id => fetchBounty(networkType, id)))
        const list = (rows.filter(Boolean) as ChainBounty[]).filter(b => b.status === 'open')
        setBounties(list)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [networkType])

  const filtered = useMemo(() => bounties.filter(b => {
    const hay = `${b.details} ${b.issueLink} ${b.status}`.toLowerCase()
    return hay.includes(q.toLowerCase())
  }), [bounties, q])

  const onApply = async (b: ChainBounty) => {
    try {
      await applyBounty(b.id, networkType)
      toast({ title: 'Applied', description: 'You have been set as developer for this bounty.' })
    } catch (e: any) {
      toast({ title: 'Failed to apply', description: e?.message || 'Unknown error', variant: 'destructive' })
    }
  }

  const onSubmitProof = async (values: z.infer<typeof proofSchema>) => {
    if (!active) return
    try {
      await submitProof(active.id, values.proof, networkType)
      toast({ title: 'Proof submitted', description: 'Submission recorded on-chain.' })
      setActive(null)
    } catch (e: any) {
      toast({ title: 'Failed to submit proof', description: e?.message || 'Unknown error', variant: 'destructive' })
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
                  title={b.issueLink}
                  description={b.details}
                  reward={Math.floor(Number(b.amountUstx) / 1_000_0) / 100}
                  currency="STX"
                  tags={[new URL(b.issueLink).host]}
                  deadline={`h#${b.deadline}`}
                  applicants={0}
                  creator={{ name: `${b.creator.slice(0, 6)}...${b.creator.slice(-4)}` }}
                  status={'open'}
                />
                <div className="flex gap-2">
                  {!b.developer && (
                    <Button variant="outline" className="flex-1" onClick={() => onApply(b)}>Apply</Button>
                  )}
                  {b.developer && stxAddress && b.developer === stxAddress && (
                    <Dialog open={active?.id === b.id} onOpenChange={open => setActive(open ? b : null)}>
                      <DialogTrigger asChild>
                        <Button className="flex-1">Submit Proof</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Submit Proof</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmitProof)}>
                            <FormField name="proof" control={form.control} render={({ field }) => (
                              <FormItem>
                                <FormLabel>Proof Link</FormLabel>
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
                  )}
                  <Link to={`/bounty/${b.id}`} className="flex-1">
                    <Button variant="secondary" className="w-full">View</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}