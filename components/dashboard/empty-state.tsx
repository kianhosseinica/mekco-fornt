'use client';

import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  title: string
  description: string
  actionLabel: string
  onAction?: () => void
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h2 className="text-xl font-semibold mb-2 text-center">{title}</h2>
      <p className="text-muted-foreground text-sm mb-6 text-center max-w-md">{description}</p>
      <Button 
        className="bg-teal-600 hover:bg-teal-700 text-white px-8"
        onClick={onAction}
      >
        {actionLabel}
      </Button>
    </div>
  )
}
