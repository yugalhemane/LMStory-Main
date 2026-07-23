import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { Check, ChevronDown, X } from 'lucide-react';

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  className
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(item => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const removeOption = (e: React.MouseEvent, value: string) => {
    e.stopPropagation();
    onChange(selected.filter(item => item !== value));
  };

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <div 
        className="flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {selected.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            selected.map(val => {
              const option = options.find(o => o.value === val);
              return (
                <span 
                  key={val} 
                  className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded text-xs flex items-center gap-1"
                >
                  {option ? option.label : val}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-error" 
                    onClick={(e) => removeOption(e, val)}
                  />
                </span>
              );
            })
          )}
        </div>
        <ChevronDown className="h-4 w-4 opacity-50 ml-2 shrink-0" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1 z-50 max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
          {options.length === 0 ? (
            <div className="p-2 text-sm text-center text-muted-foreground">No options available</div>
          ) : (
            <div className="p-1">
              {options.map(option => {
                const isSelected = selected.includes(option.value);
                return (
                  <div
                    key={option.value}
                    className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                    onClick={() => toggleOption(option.value)}
                  >
                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                      {isSelected && <Check className="h-4 w-4" />}
                    </span>
                    {option.label}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
