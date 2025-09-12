import { Header } from "@/components/layout/Header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-brutal"
import { Button } from "@/components/ui/button-brutal"
import { Badge } from "@/components/ui/badge"
import { StatsCard } from "@/components/ui/stats-card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import { useStacks } from "@/contexts/StacksContext"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ExternalLink, Wallet, DollarSign, Trophy, History, ArrowUpRight } from "lucide-react"

const mockBounties = [
  { id: "b1", title: "Implement Clarity Token Vesting", reward: 1200, currency: "STX", status: "completed", date: "2025-08-12" },
  { id: "b2", title: "Stacks Wallet Deep Link", reward: 800, currency: "STX", status: "in-review", date: "2025-08-03" },
  { id: "b3", title: "NFT Metadata Indexer", reward: 2100, currency: "STX", status: "completed", date: "2025-07-22" },
  { id: "b4", title: "UI Kit for Grants Dashboard", reward: 950, currency: "STX", status: "open", date: "2025-07-05" },
]

const mockPayments = [
  { id: "p1", date: "2025-08-13", amount: 1200, currency: "STX", status: "settled", tx: "0x84a1...9bd3" },
  { id: "p2", date: "2025-07-23", amount: 2100, currency: "STX", status: "settled", tx: "0x1f0c...77aa" },
  { id: "p3", date: "2025-07-10", amount: 450, currency: "STX", status: "pending", tx: "—" },
]

const Dashboard = () => {
  const { user } = useAuth()
  const { isSignedIn, stxAddress, balance, connectWallet, networkType } = useStacks()

  const avatar = (user?.user_metadata as any)?.avatar_url as string | undefined
  const ghUser = (user?.user_metadata as any)?.user_name || (user?.user_metadata as any)?.preferred_username
  const fullName = (user?.user_metadata as any)?.full_name || user?.email || ghUser || "User"
  const githubUrl = ghUser ? `https://github.com/${ghUser}` : "https://github.com"

  const formatStx = (micro: string | number | undefined) => {
    if (!micro) return "0.00"
    const n = typeof micro === "string" ? parseFloat(micro) : micro
    return (n / 1_000_000).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })
  }

  const completedCount = mockBounties.filter(b => b.status === "completed").length
  const totalEarned = mockPayments.filter(p => p.status === "settled").reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-center gap-4 pb-0">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-none border-thick border-border overflow-hidden bg-muted">
                  <Avatar className="h-full w-full rounded-none">
                    {avatar && <AvatarImage src={avatar} alt="GitHub Avatar" />}
                    <AvatarFallback className="rounded-none text-xl font-black">{fullName?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <CardTitle className="text-heading mb-1">{fullName}</CardTitle>
                  <div className="flex items-center gap-2">
                    {ghUser && (
                      <a href={githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
                        @{ghUser}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatsCard title="Wallet Balance" value={`${formatStx(balance?.stx?.available)} STX`} icon={<Wallet className="h-6 w-6" />} />
              <StatsCard title="Bounties Completed" value={completedCount} icon={<Trophy className="h-6 w-6" />} />
              <StatsCard title="Total Earned" value={`${totalEarned.toLocaleString()} STX`} icon={<DollarSign className="h-6 w-6" />} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-subheading">Wallet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isSignedIn && stxAddress ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Address</span>
                    <code className="text-xs bg-muted px-2 py-1">{`${stxAddress.slice(0, 6)}...${stxAddress.slice(-4)}`}</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Network</span>
                    <span className="text-sm font-bold">{networkType === "mainnet" ? "Mainnet" : "Testnet"}</span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(`https://explorer.stacks.co/address/${stxAddress}${networkType === 'testnet' ? '?chain=testnet' : ''}`, "_blank")}
                  >
                    View on Explorer
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Connect your Stacks wallet to see your balance and activity.</p>
                  <Button className="w-full font-black" onClick={() => connectWallet()}>
                    <Wallet className="mr-2 h-5 w-5" />
                    Connect Wallet
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center bg-primary border-thick border-primary text-primary-foreground">
                  <History className="h-5 w-5" />
                </div>
                <CardTitle>Bounty History</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Reward</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockBounties.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-bold">{b.title}</TableCell>
                      <TableCell className="font-mono">{b.reward} {b.currency}</TableCell>
                      <TableCell>
                        <Badge className={
                          b.status === "completed" ? "bg-success text-pure-white border-thick" :
                          b.status === "in-review" ? "bg-warning text-pure-white border-thick" :
                          "bg-accent text-accent-foreground border-thick"
                        }>
                          {b.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">{b.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center bg-secondary border-thick border-secondary text-secondary-foreground">
                  <DollarSign className="h-5 w-5" />
                </div>
                <CardTitle>Payment History</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Tx</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPayments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-bold">{p.date}</TableCell>
                      <TableCell className="font-mono">{p.amount} {p.currency}</TableCell>
                      <TableCell>
                        <Badge className={
                          p.status === "settled" ? "bg-success text-pure-white border-thick" :
                          p.status === "pending" ? "bg-warning text-pure-white border-thick" :
                          "bg-accent text-accent-foreground border-thick"
                        }>
                          {p.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">{p.tx}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
