import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card-brutal"
import { Button } from "@/components/ui/button-brutal"
import { Badge } from "@/components/ui/badge"
import { Clock, DollarSign, User } from "lucide-react"

export interface BountyCardProps {
  id: string
  title: string
  description: string
  reward: number
  currency: string
  tags: string[]
  deadline: string
  applicants: number
  creator: {
    name: string
    avatar?: string
  }
  status: "open" | "in-progress" | "completed"
}

export function BountyCard({
  id,
  title,
  description,
  reward,
  currency,
  tags,
  deadline,
  applicants,
  creator,
  status
}: BountyCardProps) {
  const statusColors = {
    open: "bg-accent text-accent-foreground",
    "in-progress": "bg-warning text-pure-white",
    completed: "bg-success text-pure-white"
  }

  return (
    <Card className="group cursor-pointer">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
              {title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={`${statusColors[status]} border-thick font-bold`}>
                {status.toUpperCase()}
              </Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" />
                {applicants} applicants
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-1 text-heading font-black text-primary">
              <DollarSign className="h-5 w-5" />
              {reward} {currency}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-body text-muted-foreground line-clamp-3 mb-4">
          {description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.slice(0, 3).map((tag) => (
            <Badge 
              key={tag} 
              variant="outline" 
              className="border-thick font-bold"
            >
              {tag}
            </Badge>
          ))}
          {tags.length > 3 && (
            <Badge variant="outline" className="border-thick font-bold">
              +{tags.length - 3} more
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-secondary border-thick border-border flex items-center justify-center">
            <span className="text-xs font-bold text-secondary-foreground">
              {creator.name[0]}
            </span>
          </div>
          <span className="text-sm font-bold">{creator.name}</span>
        </div>
        
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-3 w-3" />
          {deadline}
        </div>
      </CardFooter>
    </Card>
  )
}