import React from "react";
import { cn } from "@/lib/theme";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  className?: string;
  centered?: boolean;
}

export function Container({
  children,
  size = "xl",
  className,
  centered = false,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "w-full px-4 mx-auto sm:px-6 md:px-8",
        {
          "max-w-screen-sm": size === "sm",
          "max-w-screen-md": size === "md",
          "max-w-screen-lg": size === "lg",
          "max-w-screen-xl": size === "xl",
          "max-w-screen-2xl": size === "2xl",
          "max-w-none": size === "full",
          "flex items-center justify-center": centered,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

type AllowedSectionTags = 'section' | 'div' | 'article' | 'aside';

interface SectionBaseProps<T extends AllowedSectionTags = 'section'> {
  children: React.ReactNode;
  className?: string;
  as?: T;
}

type SectionProps<T extends AllowedSectionTags = 'section'> =
  SectionBaseProps<T> & Omit<React.ComponentPropsWithoutRef<T>, keyof SectionBaseProps<T>>;

export function Section<T extends AllowedSectionTags = 'section'>({
  children,
  className,
  as,
  ...props
}: SectionProps<T>) {
  const Component = as || 'section'; // Determine the component type (default 'section')
  return (
    <Component
      className={cn("py-0 md:py-16", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: "none" | "sm" | "md" | "lg";
}

export function Grid({
  children,
  className,
  cols = 3,
  gap = "md",
  ...props
}: GridProps) {
  return (
    <div
      className={cn(
        "grid",
        {
          "grid-cols-1": cols === 1,
          "grid-cols-1 sm:grid-cols-2": cols === 2,
          "grid-cols-1 sm:grid-cols-2 md:grid-cols-3": cols === 3,
          "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4": cols === 4,
          "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5": cols === 5,
          "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6": cols === 6,
          "gap-0": gap === "none",
          "gap-2": gap === "sm",
          "gap-4": gap === "md",
          "gap-6": gap === "lg",
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  direction?: "row" | "col";
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  gap?: "none" | "sm" | "md" | "lg";
  wrap?: boolean;
}

export function Flex({
  children,
  className,
  direction = "row",
  align = "center",
  justify = "start",
  gap = "md",
  wrap = false,
  ...props
}: FlexProps) {
  return (
    <div
      className={cn(
        "flex",
        {
          "flex-row": direction === "row",
          "flex-col": direction === "col",
          "items-start": align === "start",
          "items-center": align === "center",
          "items-end": align === "end",
          "items-stretch": align === "stretch",
          "items-baseline": align === "baseline",
          "justify-start": justify === "start",
          "justify-center": justify === "center",
          "justify-end": justify === "end",
          "justify-between": justify === "between",
          "justify-around": justify === "around",
          "justify-evenly": justify === "evenly",
          "gap-0": gap === "none",
          "gap-2": gap === "sm",
          "gap-4": gap === "md",
          "gap-6": gap === "lg",
          "flex-wrap": wrap,
          "flex-nowrap": !wrap,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
} 