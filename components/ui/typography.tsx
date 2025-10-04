import React from "react";
import { cn } from "@/lib/theme";

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export function H1({ children, className, as, ...props }: TypographyProps) {
  const Component = as || "h1";
  return (
    <Component 
      className={cn(
        "scroll-m-20 text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground", 
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export function H2({ children, className, as, ...props }: TypographyProps) {
  const Component = as || "h2";
  return (
    <Component 
      className={cn(
        "scroll-m-20 text-3xl font-semibold tracking-tight text-foreground mt-10 first:mt-0", 
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export function H3({ children, className, as, ...props }: TypographyProps) {
  const Component = as || "h3";
  return (
    <Component 
      className={cn(
        "scroll-m-20 text-2xl font-semibold tracking-tight text-foreground mt-8 first:mt-0", 
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export function H4({ children, className, as, ...props }: TypographyProps) {
  const Component = as || "h4";
  return (
    <Component 
      className={cn(
        "scroll-m-20 text-xl font-semibold tracking-tight text-foreground mt-6 first:mt-0", 
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export function P({ children, className, as, ...props }: TypographyProps) {
  const Component = as || "p";
  return (
    <Component 
      className={cn(
        "leading-7 text-foreground", 
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export function Large({ children, className, as, ...props }: TypographyProps) {
  const Component = as || "p";
  return (
    <Component 
      className={cn(
        "text-lg font-semibold text-foreground", 
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export function Small({ children, className, as, ...props }: TypographyProps) {
  const Component = as || "small";
  return (
    <Component 
      className={cn(
        "text-sm font-medium leading-none", 
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export function Muted({ children, className, as, ...props }: TypographyProps) {
  const Component = as || "p";
  return (
    <Component 
      className={cn(
        "text-sm text-muted-foreground", 
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export function Lead({ children, className, as, ...props }: TypographyProps) {
  const Component = as || "p";
  return (
    <Component 
      className={cn(
        "text-xl text-muted-foreground", 
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export function Subtle({ children, className, as, ...props }: TypographyProps) {
  const Component = as || "p";
  return (
    <Component 
      className={cn(
        "text-sm text-muted-foreground/80", 
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
} 