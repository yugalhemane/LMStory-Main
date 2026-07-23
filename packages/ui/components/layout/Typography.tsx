import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

const headingVariants = cva("font-bold tracking-tight text-foreground", {
  variants: {
    size: {
      h1: "text-4xl lg:text-5xl",
      h2: "text-3xl lg:text-4xl",
      h3: "text-2xl lg:text-3xl",
      h4: "text-xl lg:text-2xl",
    },
  },
  defaultVariants: {
    size: "h1",
  },
});

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, size, as, ...props }, ref) => {
    const Comp = as || (size as any) || "h1";
    return (
      <Comp
        ref={ref}
        className={cn(headingVariants({ size, className }))}
        {...props}
      />
    );
  }
);
Heading.displayName = "Heading";

const textVariants = cva("text-foreground", {
  variants: {
    size: {
      default: "text-base",
      sm: "text-sm",
      lg: "text-lg",
      xs: "text-xs",
    },
    variant: {
      default: "",
      muted: "text-muted-foreground",
      destructive: "text-destructive",
    },
    weight: {
      default: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
  },
  defaultVariants: {
    size: "default",
    variant: "default",
    weight: "default",
  },
});

export interface TextProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof textVariants> {}

const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, size, variant, weight, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn(textVariants({ size, variant, weight, className }))}
        {...props}
      />
    );
  }
);
Text.displayName = "Text";

export { Heading, Text };
