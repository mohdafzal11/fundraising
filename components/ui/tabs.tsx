import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn("inline-flex items-center justify-center", className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Tabs.displayName = "Tabs"

interface TabListProps extends React.HTMLAttributes<HTMLDivElement> {}

const TabList = React.forwardRef<HTMLDivElement, TabListProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
          className
        )}
        {...props}
      />
    )
  }
)
TabList.displayName = "TabList"

interface TabTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

const TabTrigger = React.forwardRef<HTMLButtonElement, TabTriggerProps>(
  ({ className, active, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          active
            ? "bg-background text-foreground shadow-sm"
            : "hover:bg-background/50 hover:text-foreground",
          className
        )}
        {...props}
      />
    )
  }
)
TabTrigger.displayName = "TabTrigger"

interface TabContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const TabContent = React.forwardRef<HTMLDivElement, TabContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        {...props}
      />
    )
  }
)
TabContent.displayName = "TabContent"

export { Tabs, TabList, TabTrigger, TabContent } 