import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/theme"
import { transitions } from "@/lib/theme"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          `bg-primary text-primary-foreground shadow hover:bg-primary/90 transition-all duration-300 ease-in-out`,
        destructive:
          `bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 transition-all duration-300 ease-in-out`,
        outline:
          `border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground transition-all duration-300 ease-in-out`,
        secondary:
          `bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 transition-all duration-300 ease-in-out`,
        ghost: 
          `hover:bg-accent hover:text-accent-foreground transition-all duration-300 ease-in-out`,
        link: 
          `text-primary underline-offset-4 hover:underline transition-all duration-300 ease-in-out`,
        subtle:
          `bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-300 ease-in-out`,
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
        pill: "h-9 rounded-full px-6",
      },
      animation: {
        none: "",
        pulse: "animate-pulse-subtle",
        slideUp: "hover:-translate-y-1",
        grow: "hover:scale-105",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, animation, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, animation, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
