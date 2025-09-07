import { Header } from "@/components/layout/Header"
import { Button } from "@/components/ui/button-brutal"
import { StatsCard } from "@/components/ui/stats-card"
import { BountyCard } from "@/components/bounty/BountyCard"
import { ArrowRight, Code, DollarSign, Users, Zap, Search, TrendingUp } from "lucide-react"
import heroImage from "@/assets/hero-image.jpg"

// Mock data for featured bounties
const featuredBounties = [
  {
    id: "1",
    title: "Build a Stacks NFT Marketplace Frontend",
    description: "Create a modern, responsive frontend for an NFT marketplace using React and Stacks.js. Should include wallet integration, NFT display, and trading functionality.",
    reward: 2500,
    currency: "STX",
    tags: ["React", "Stacks.js", "NFT", "Frontend"],
    deadline: "7 days left",
    applicants: 12,
    creator: { name: "StacksDAO" },
    status: "open" as const
  },
  {
    id: "2", 
    title: "Smart Contract Audit for DeFi Protocol",
    description: "Comprehensive security audit needed for a new DeFi lending protocol built on Stacks. Experience with Clarity language required.",
    reward: 5000,
    currency: "STX",
    tags: ["Clarity", "Security", "DeFi", "Audit"],
    deadline: "14 days left",
    applicants: 8,
    creator: { name: "DeFiLabs" },
    status: "open" as const
  },
  {
    id: "3",
    title: "Mobile Wallet Integration",
    description: "Integrate Stacks wallet functionality into existing mobile app. Need native iOS/Android development skills.",
    reward: 1800,
    currency: "STX", 
    tags: ["Mobile", "iOS", "Android", "Wallet"],
    deadline: "5 days left",
    applicants: 15,
    creator: { name: "CryptoMobile" },
    status: "in-progress" as const
  }
]

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <main>
        <section className="relative overflow-hidden border-b-chunky border-border">
          <div className="absolute inset-0 z-0">
            <img 
              src={heroImage}
              alt="Vorkr - Blockchain Development Platform"
              className="h-full w-full object-cover opacity-10"
            />
          </div>
          
          <div className="container relative z-10 mx-auto px-6 py-20 md:py-32">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-display mb-6">
                Build. Earn. Get Paid in{" "}
                <span className="text-primary">STX</span>.
              </h1>
              
              <p className="text-body text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                The neo-brutalist bounty platform for the Stacks blockchain ecosystem. 
                Connect developers with projects that matter.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Button size="xl" className="font-black">
                  Browse Bounties
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
                
                <Button variant="outline" size="xl" className="font-black">
                  Post a Bounty
                </Button>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <StatsCard
                  title="Active Bounties"
                  value="247"
                  description="Ready to work on"
                  icon={<Code className="h-6 w-6" />}
                />
                <StatsCard
                  title="STX in Escrow"
                  value="50K+"
                  description="Total value locked"
                  icon={<DollarSign className="h-6 w-6" />}
                />
                <StatsCard
                  title="Developers"
                  value="1.2K"
                  description="Active builders"
                  icon={<Users className="h-6 w-6" />}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Featured Bounties */}
        <section className="py-20 border-b-chunky border-border">
          <div className="container mx-auto px-6">
            <div className="mb-12 text-center">
              <h2 className="text-heading mb-4">
                Featured <span className="text-primary">Bounties</span>
              </h2>
              <p className="text-body text-muted-foreground max-w-2xl mx-auto">
                Hand-picked opportunities from top projects in the Stacks ecosystem.
                Start building and earning today.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
              {featuredBounties.map((bounty) => (
                <BountyCard key={bounty.id} {...bounty} />
              ))}
            </div>
            
            <div className="text-center">
              <Button variant="outline" size="lg">
                <Search className="mr-2 h-5 w-5" />
                View All Bounties
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-heading mb-6">
                  Why Choose <span className="text-primary">Vorkr</span>?
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center bg-primary border-thick border-primary text-primary-foreground">
                      <Zap className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-subheading mb-2">Instant Payments</h3>
                      <p className="text-body text-muted-foreground">
                        Get paid instantly in STX when you complete bounties. No waiting, no hassle.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center bg-accent border-thick border-accent text-accent-foreground">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-subheading mb-2">Quality Projects</h3>
                      <p className="text-body text-muted-foreground">
                        Work on cutting-edge Stacks projects with top-tier developers and companies.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center bg-secondary border-thick border-secondary text-secondary-foreground">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-subheading mb-2">Thriving Community</h3>
                      <p className="text-body text-muted-foreground">
                        Join a community of builders, creators, and innovators in the Stacks ecosystem.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="card-brutal p-8 bg-gradient-primary text-white">
                  <h3 className="text-subheading mb-4 text-white">Ready to Start Building?</h3>
                  <p className="text-body mb-6 text-white/90">
                    Join thousands of developers earning STX by building the future of decentralized applications.
                  </p>
                  <Button variant="secondary" size="lg" className="w-full">
                    Get Started Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t-chunky border-border bg-muted py-12">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="flex h-12 w-12 items-center justify-center bg-primary border-thick border-primary">
                <span className="text-2xl font-black text-primary-foreground">V</span>
              </div>
              <span className="text-heading font-black">VORKR</span>
            </div>
            <p className="text-body text-muted-foreground">
              Building the future of work in the Stacks ecosystem.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Index