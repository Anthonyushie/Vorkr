import { Card, CardContent, CardHeader, CardTitle } from "./card-brutal"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  className?: string
}

export function StatsCard({ title, value, description, icon, className }: StatsCardProps) {
  return (
    <Card className={cn("text-center", className)}>
      <CardHeader className="pb-2">
        {icon && (
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center bg-primary border-thick border-primary text-primary-foreground">
            {icon}
          </div>
        )}
        <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-display text-3xl md:text-4xl font-black text-primary mb-1">
          {value}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground font-medium">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}