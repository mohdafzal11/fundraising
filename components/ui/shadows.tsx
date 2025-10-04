import React from "react";
import { cn } from "@/lib/theme";

type ShadowSize = "sm" | "md" | "lg" | "xl" | "2xl" | "inner" | "none";

interface ShadowProps {
  children: React.ReactNode;
  size?: ShadowSize;
  className?: string;
  hover?: boolean;
}

const getShadowClass = (size: ShadowSize): string => {
  switch (size) {
    case "sm":
      return "shadow-sm";
    case "md":
      return "shadow";
    case "lg":
      return "shadow-md";
    case "xl":
      return "shadow-lg";
    case "2xl":
      return "shadow-xl";
    case "inner":
      return "shadow-inner";
    case "none":
      return "shadow-none";
    default:
      return "shadow";
  }
};

const getHoverShadowClass = (size: ShadowSize): string => {
  switch (size) {
    case "sm":
      return "hover:shadow";
    case "md":
      return "hover:shadow-md";
    case "lg":
      return "hover:shadow-lg";
    case "xl":
      return "hover:shadow-xl";
    case "2xl":
      return "hover:shadow-2xl";
    case "inner":
      return "hover:shadow-inner";
    case "none":
      return "";
    default:
      return "hover:shadow-md";
  }
};

export function Shadow({
  children,
  size = "md",
  className,
  hover = false,
}: ShadowProps) {
  return (
    <div
      className={cn(
        getShadowClass(size),
        hover && getHoverShadowClass(size),
        "transition-shadow duration-300",
        className
      )}
    >
      {children}
    </div>
  );
}

interface ElevateProps {
  children: React.ReactNode;
  className?: string;
  amount?: "sm" | "md" | "lg";
  active?: boolean;
}

export function Elevate({
  children,
  className,
  amount = "md",
  active = true,
}: ElevateProps) {
  const hoverClasses = {
    sm: "hover:-translate-y-1 hover:shadow-md",
    md: "hover:-translate-y-2 hover:shadow-lg",
    lg: "hover:-translate-y-3 hover:shadow-xl",
  };
  const elevateClass = active ? hoverClasses[amount] : "";

  return (
    <div
      className={cn(
        "transition-all duration-300",
        elevateClass,
        className
      )}
    >
      {children}
    </div>
  );
} 