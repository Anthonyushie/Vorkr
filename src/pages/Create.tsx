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

const schema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(500),
  repo: z.string().regex(/^[^\/\s]+\/[^\/\s]+$/, 'Use owner/repo'),
  issue: z.coerce.number().int().nonnegative(),
  rewardStx: z.coerce.number().positive(),
  deadlineHeight: z.coerce.number().int().positive().optional(),
})

export default function Create() {
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { rewardStx: 10 } })
  const { networkType } = useStacks()
  const navigate = useNavigate()

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      await createBounty(values, networkType)
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
            <p className="text-body text-muted-foreground">Escrow STX directly in the contract. Assigned developer gets released automatically after the PR is merged.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField name="title" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input className="input-brutal" placeholder="Short, clear title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="repo" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repository (owner/repo)</FormLabel>
                    <FormControl>
                      <Input className="input-brutal" placeholder="owner/repo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField name="description" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea className="input-brutal min-h-[140px]" placeholder="What should be built? Acceptance criteria?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField name="issue" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue #</FormLabel>
                    <FormControl>
                      <Input type="number" className="input-brutal" placeholder="123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="rewardStx" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reward (STX)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.000001" className="input-brutal" placeholder="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="deadlineHeight" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deadline Height (optional)</FormLabel>
                    <FormControl>
                      <Input type="number" className="input-brutal" placeholder="e.g. 123456" {...field} />
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
