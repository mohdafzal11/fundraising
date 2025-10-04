"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/theme";

type AnimationType = 
  | "fade-in"
  | "fade-out"
  | "slide-in-from-top"
  | "slide-out-to-top"
  | "slide-in-from-bottom"
  | "slide-out-to-bottom"
  | "pulse";

interface AnimationProps {
  children: React.ReactNode;
  type: AnimationType;
  duration?: "fast" | "medium" | "slow";
  delay?: number; // in milliseconds
  className?: string;
  once?: boolean;
}

export function Animation({
  children,
  type,
  duration = "medium",
  delay = 0,
  className,
  once = true,
}: AnimationProps) {
  const [isVisible, setIsVisible] = useState(!once);
  
  useEffect(() => {
    if (once) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [delay, once]);
  
  if (once && !isVisible) {
    return null;
  }
  
  const animationClass = {
    "fade-in": "animate-fade-in",
    "fade-out": "animate-fade-out",
    "slide-in-from-top": "animate-slide-in-from-top",
    "slide-out-to-top": "animate-slide-out-to-top",
    "slide-in-from-bottom": "animate-slide-in-from-bottom",
    "slide-out-to-bottom": "animate-slide-out-to-bottom",
    "pulse": "animate-pulse-subtle",
  }[type];
  
  const durationClass = {
    "fast": "duration-150",
    "medium": "duration-300",
    "slow": "duration-500",
  }[duration];
  
  const delayStyle = delay > 0 ? { animationDelay: `${delay}ms` } : {};
  
  return (
    <div 
      className={cn(animationClass, durationClass, className)}
      style={delayStyle}
    >
      {children}
    </div>
  );
}

export function FadeIn({
  children,
  ...props
}: Omit<AnimationProps, "type">) {
  return (
    <Animation type="fade-in" {...props}>
      {children}
    </Animation>
  );
}

export function FadeOut({
  children,
  ...props
}: Omit<AnimationProps, "type">) {
  return (
    <Animation type="fade-out" {...props}>
      {children}
    </Animation>
  );
}

export function SlideInFromTop({
  children,
  ...props
}: Omit<AnimationProps, "type">) {
  return (
    <Animation type="slide-in-from-top" {...props}>
      {children}
    </Animation>
  );
}

export function SlideOutToTop({
  children,
  ...props
}: Omit<AnimationProps, "type">) {
  return (
    <Animation type="slide-out-to-top" {...props}>
      {children}
    </Animation>
  );
}

export function SlideInFromBottom({
  children,
  ...props
}: Omit<AnimationProps, "type">) {
  return (
    <Animation type="slide-in-from-bottom" {...props}>
      {children}
    </Animation>
  );
}

export function SlideOutToBottom({
  children,
  ...props
}: Omit<AnimationProps, "type">) {
  return (
    <Animation type="slide-out-to-bottom" {...props}>
      {children}
    </Animation>
  );
}

export function Pulse({
  children,
  ...props
}: Omit<AnimationProps, "type">) {
  return (
    <Animation type="pulse" {...props}>
      {children}
    </Animation>
  );
} 