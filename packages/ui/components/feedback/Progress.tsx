import * as React from "react"
import { cn } from "../../utils/cn"

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    // Ensure value is bounded between 0 and max
    const boundedValue = Math.min(Math.max(value, 0), max)
    const percentage = max > 0 ? (boundedValue / max) * 100 : 0

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={boundedValue}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-surface-container-highest",
          className
        )}
        {...props}
      >
        <div
          className="h-full w-full flex-1 bg-secondary transition-all"
          style={{ transform: `translateX(-${100 - (percentage || 0)}%)` }}
        />
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }
