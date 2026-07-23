import React from 'react';
import { cn } from '../../utils/cn';

export interface Step {
  id: string;
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentStepIndex: number; // 0-indexed
  className?: string;
}

export function Stepper({ steps, currentStepIndex, className }: StepperProps) {
  return (
    <div className={cn("bg-surface-container-lowest border border-outline-variant rounded-xl p-lg overflow-x-auto", className)}>
      <div className="flex items-center justify-between min-w-[700px] px-md">
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;
          const isPending = index > currentStepIndex;

          return (
            <React.Fragment key={step.id}>
              {/* Step Marker */}
              <div
                className={cn(
                  "flex flex-col items-center gap-sm relative transition-all duration-300",
                  isActive ? "wizard-step-active" : "",
                  isPending ? "opacity-50" : ""
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold border transition-colors",
                    isActive || isCompleted
                      ? "bg-secondary text-on-secondary border-secondary"
                      : "bg-surface-variant text-on-surface-variant border-outline-variant"
                  )}
                >
                  {isCompleted ? (
                    <span className="material-symbols-outlined text-[20px]">check</span>
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    "text-label-md font-label-md",
                    isActive || isCompleted ? "text-secondary" : "text-on-surface-variant"
                  )}
                >
                  {step.label}
                </span>

                {/* Active Indicator Underline (custom class from stitch code) */}
                {isActive && (
                  <div className="absolute -bottom-4 left-0 w-full h-[3px] bg-secondary rounded-t" />
                )}
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-[2px] mx-4 mb-6 transition-colors",
                    isCompleted ? "bg-secondary" : "bg-outline-variant"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
