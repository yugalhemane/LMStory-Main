import * as React from "react"
import { cn } from "../../utils/cn"

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement> {}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-surface-container-highest", className)}
      {...props}
    />
  )
}

export { Skeleton }
