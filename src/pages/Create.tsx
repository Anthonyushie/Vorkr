import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button-brutal'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useStacks } from '@/contexts/StacksContext'
import { createBounty } from '@/lib/stacksClient'
import { toast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'
import { CONTRACT_ADDRESS, CONTRACT_NAME } from '@/config'
import { callReadOnlyFunction, cvToJSON } from '@stacks/transactions'
import { getStacksNetwork } from '@/lib/stacks'

const schema = z.object({
  amountStx: z.coerce.number().positive(),
  issueLink: z.string().url().max(256),
  details: z.string().min(3).max(256),
  developer: z.string().min(1).optional(),
  deadline: z.string().min(1),
})

async function getNextBountyId(networkType: 'mainnet' | 'testnet') {
  try {
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
    return ids.length ? Math.max(...ids) + 1 : 1
  } catch {
    return Math.floor(Date.now() / 1000)
  }
}

async function getTipHeight(networkType: 'mainnet' | 'testnet') {
  const network = getStacksNetwork(networkType)
  const res = await fetch(`${network.coreApiUrl}/v2/info`)
  const data = await res.json()
  return Number(data.stacks_tip_height || data.stacks_tip || 0)
}

async function estimateDeadlineHeight(deadlineIso: string, networkType: 'mainnet' | 'testnet') {
  const tip = await getTipHeight(networkType)
  const target = new Date(deadlineIso).getTime()
  const now = Date.now()
  const seconds = Math.max(0, Math.floor((target - now) / 1000))
  const blocks = Math.ceil(seconds / 600)
  return tip + Math.max(1, blocks)
}

export default function Create() {
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { amountStx: 10 } })
  const { networkType } = useStacks()
  const navigate = useNavigate()

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      const id = await getNextBountyId(networkType)
      const deadlineHeight = await estimateDeadlineHeight(values.deadline, networkType)
      await createBounty({
        id,
        issueLink: values.issueLink,
        details: values.details,
        developer: values.developer,
        deadline: deadlineHeight,
        amountStx: values.amountStx,
      }, networkType)
      toast({ title: 'Bounty posted', description: 'Your bounty has been created and escrowed.' })
      navigate('/dashboard')
    } catch (e: any) {
      toast({ title: 'Failed to post bounty', description: e?.message || 'Unknown error', variant: 'destructive' })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <div className="card-brutal p-6 mb-6">
            <h1 className="text-heading mb-2">Post a <span className="text-primary">Bounty</span></h1>
            <p className="text-body text-muted-foreground">Escrow STX directly in the contract. No oracles. Creator releases or refunds.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField name="amountStx" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (STX)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.000001" className="input-brutal" placeholder="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="issueLink" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub Issue Link</FormLabel>
                    <FormControl>
                      <Input className="input-brutal" placeholder="https://github.com/owner/repo/issues/123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField name="details" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Bounty Details</FormLabel>
                  <FormControl>
                    <Textarea className="input-brutal min-h-[140px]" placeholder="What should be built? Acceptance criteria?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField name="developer" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Developer (optional STX address)</FormLabel>
                    <FormControl>
                      <Input className="input-brutal" placeholder="SP..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="deadline" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deadline</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" className="input-brutal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="flex justify-end">
                <Button type="submit" className="font-black">Create Bounty</Button>
              </div>
            </form>
          </Form>
        </div>
      </main>
    </div>
  )
}