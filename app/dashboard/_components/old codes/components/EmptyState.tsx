// components/EmptyState.tsx
import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  messages: string[]
  iconClassName?: string
}

export function EmptyState({
  icon: Icon,
  title,
  messages,
  iconClassName = "w-12 h-12 text-yellow-500"
}: EmptyStateProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto my-8">
      <CardContent className="flex flex-col items-center space-y-4 text-center p-6">
        {Icon && <Icon className={iconClassName} />}
        <h2 className="text-2xl font-semibold text-primary">{title}</h2>
        {messages.map((message, index) => (
          <p key={index} className="text-muted-foreground">
            {message}
          </p>
        ))}
      </CardContent>
    </Card>
  )
}