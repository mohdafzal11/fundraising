import * as React from "react"
import Link, { LinkProps } from "next/link"
import { cn } from "@/lib/utils"

interface BreadcrumbProps extends React.HTMLAttributes<HTMLDivElement> {}

const Breadcrumb = React.forwardRef<HTMLDivElement, BreadcrumbProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center space-x-2 text-sm", className)}
        {...props}
      />
    )
  }
)
Breadcrumb.displayName = "Breadcrumb"

interface BreadcrumbItemProps extends React.HTMLAttributes<HTMLLIElement> {}

const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ className, ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={cn("inline-flex items-center", className)}
        {...props}
      />
    )
  }
)
BreadcrumbItem.displayName = "BreadcrumbItem"

interface BreadcrumbLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string
}

const BreadcrumbLink = ({ className, href, children, ...props }: BreadcrumbLinkProps) => {
  if (href) {
    return (
      <Link 
        href={href}
        className={cn("text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300", className)}
        {...props}
      >
        {children}
      </Link>
    )
  }
  
  return (
    <a
      className={cn("text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300", className)}
      {...props}
    >
      {children}
    </a>
  )
}
BreadcrumbLink.displayName = "BreadcrumbLink"

interface BreadcrumbSeparatorProps
  extends React.HTMLAttributes<HTMLSpanElement> {}

const BreadcrumbSeparator = React.forwardRef<
  HTMLSpanElement,
  BreadcrumbSeparatorProps
>(({ className, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn("mx-2 text-gray-500 dark:text-gray-400", className)}
      {...props}
    >
      &gt;
    </span>
  )
})
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"

export {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator
} 