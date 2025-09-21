import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button-brutal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-brutal'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStacks } from '@/contexts/StacksContext'
import { CONTRACT_ADDRESS, CONTRACT_NAME } from '@/config'
import { callReadOnlyFunction, cvToJSON, uintCV } from '@stacks/transactions'
import { getStacksNetwork } from '@/lib/stacks'
import { applyBounty, releaseBounty, refundBounty, submitProof } from '@/lib/stacksClient'
import { toast } from '@/hooks/use-toast'

const proofSchema = z.object({ proof: z.string().url().max(256) })

export default function BountyPage() {
  const { id } = useParams()
  const bid = Number(id)
  const { networkType, stxAddress } = useStacks()
  const [bounty, setBounty] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const form = useForm({ resolver: zodResolver(proofSchema) }) as any
  const navigate = useNavigate()

  const load = async () => {
    setLoading(true)
    try {
      const res = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-bounty',
        functionArgs: [uintCV(BigInt(bid))],
        network: getStacksNetwork(networkType),
        senderAddress: CONTRACT_ADDRESS,
      })
      const json = cvToJSON(res)
      if (json.type === 'response' && json.value.type === 'optional' && json.value.value) {
        const t = json.value.value as any
        setBounty({
          id: bid,
          creator: t.value.creator.value as string,
          amountUstx: String(t.value.amount.value),
          issueLink: t.value['issue-link'].value,
          details: t.value.details.value,
          developer: t.value.developer.value ? (t.value.developer.value as any).value : undefined,
          deadline: Number(t.value.deadline.value),
          status: t.value.status.value,
          proof: t.value.proof.value ? (t.value.proof.value as any).value : undefined,
        })
      } else {
        setBounty(null)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!Number.isFinite(bid)) return
    load()
  }, [bid, networkType])

  const onApply = async () => {
    try {
      await applyBounty(bid, networkType)
      toast({ title: 'Applied', description: 'You are now the developer for this bounty.' })
      load()
    } catch (e: any) {
      toast({ title: 'Failed to apply', description: e?.message || 'Unknown error', variant: 'destructive' })
    }
  }

  const onSubmitProof = async (values: any) => {
    try {
      await submitProof(bid, values.proof, networkType)
      toast({ title: 'Proof submitted', description: 'Submission recorded on-chain.' })
      load()
    } catch (e: any) {
      toast({ title: 'Failed to submit proof', description: e?.message || 'Unknown error', variant: 'destructive' })
    }
  }

  const onRelease = async () => {
    try {
      await releaseBounty(bid, networkType)
      toast({ title: 'Released', description: 'Bounty released to developer.' })
      navigate('/browse')
    } catch (e: any) {
      toast({ title: 'Failed to release', description: e?.message || 'Unknown error', variant: 'destructive' })
    }
  }

  const onRefund = async () => {
    try {
      await refundBounty(bid, networkType)
      toast({ title: 'Refunded', description: 'Bounty refunded to creator.' })
      navigate('/browse')
    } catch (e: any) {
      toast({ title: 'Failed to refund', description: e?.message || 'Unknown error', variant: 'destructive' })
    }
  }

  if (!Number.isFinite(bid)) return null

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-10">
        {loading ? (
          <div className="text-center py-20 text-body">Loading...</div>
        ) : !bounty ? (
          <div className="text-center py-20 text-body">Bounty not found</div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-subheading break-all">{bounty.issueLink}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-body break-words">{bounty.details}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-sm"><span className="font-bold">Creator:</span> {bounty.creator}</div>
                  <div className="text-sm"><span className="font-bold">Developer:</span> {bounty.developer || '—'}</div>
                  <div className="text-sm"><span className="font-bold">Amount:</span> {Math.floor(Number(bounty.amountUstx)/1_000_0)/100} STX</div>
                  <div className="text-sm"><span className="font-bold">Deadline:</span> h#{bounty.deadline}</div>
                  <div className="text-sm"><span className="font-bold">Status:</span> {bounty.status}</div>
                  <div className="text-sm"><span className="font-bold">Proof:</span> {bounty.proof || '—'}</div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-3">
              {!bounty.developer && (
                <Button onClick={onApply}>Apply</Button>
              )}
              {stxAddress && bounty.developer === stxAddress && (
                <Form {...form}>
                  <form className="flex items-end gap-2" onSubmit={form.handleSubmit(onSubmitProof)}>
                    <FormField name="proof" control={form.control} render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Submit Proof</FormLabel>
                        <FormControl>
                          <Input className="input-brutal" placeholder="https://github.com/owner/repo/pull/123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit">Submit</Button>
                  </form>
                </Form>
              )}
              {stxAddress && bounty.creator === stxAddress && (
                <>
                  <Button variant="default" onClick={onRelease}>Release</Button>
                  <Button variant="outline" onClick={onRefund}>Refund</Button>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}