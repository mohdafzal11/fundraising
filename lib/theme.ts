import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Helper function to merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Animation durations
export const durations = {
  fast: "150ms",
  medium: "300ms",
  slow: "500ms",
};

// Animation curves
export const easings = {
  default: "cubic-bezier(0.4, 0, 0.2, 1)",
  in: "cubic-bezier(0.4, 0, 1, 1)",
  out: "cubic-bezier(0, 0, 0.2, 1)",
  inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
};

// Space/sizing system
export const spacing = {
  0: "0",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
};

// Font sizes
export const fontSizes = {
  xs: "0.75rem",
  sm: "0.875rem",
  base: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  "3xl": "1.875rem",
  "4xl": "2.25rem",
  "5xl": "3rem",
};

// Font weights
export const fontWeights = {
  thin: "100",
  extralight: "200",
  light: "300",
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
  black: "900",
};

// Shadow styles
export const shadows = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
};

// Z-index values
export const zIndices = {
  0: "0",
  10: "10",
  20: "20",
  30: "30",
  40: "40",
  50: "50",
  auto: "auto",
};

// Custom animation keyframes
export const keyframes = {
  fadeIn: "fadeIn",
  fadeOut: "fadeOut",
  slideInFromTop: "slideInFromTop",
  slideOutToTop: "slideOutToTop",
  slideInFromBottom: "slideInFromBottom",
  slideOutToBottom: "slideOutToBottom",
  pulse: "pulse",
};

// Animation definitions to add to globals.css
export const animationDefinitions = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  
  @keyframes slideInFromTop {
    from { transform: translateY(-10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes slideOutToTop {
    from { transform: translateY(0); opacity: 1; }
    to { transform: translateY(-10px); opacity: 0; }
  }
  
  @keyframes slideInFromBottom {
    from { transform: translateY(10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes slideOutToBottom {
    from { transform: translateY(0); opacity: 1; }
    to { transform: translateY(10px); opacity: 0; }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`;

// Theme color mappings
export const themeColors = {
  primary: "hsl(var(--primary))",
  primaryForeground: "hsl(var(--primary-foreground))",
  secondary: "hsl(var(--secondary))",
  secondaryForeground: "hsl(var(--secondary-foreground))",
  accent: "hsl(var(--accent))",
  accentForeground: "hsl(var(--accent-foreground))",
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  muted: "hsl(var(--muted))",
  mutedForeground: "hsl(var(--muted-foreground))",
  card: "hsl(var(--card))",
  cardForeground: "hsl(var(--card-foreground))",
  border: "hsl(var(--border))",
  input: "hsl(var(--input))",
  ring: "hsl(var(--ring))",
};

// Common transition presets
export const transitions = {
  fast: `${durations.fast} ${easings.default}`,
  medium: `${durations.medium} ${easings.default}`,
  slow: `${durations.slow} ${easings.default}`,
};

// Common animation presets
export const animations = {
  fadeIn: `${keyframes.fadeIn} ${durations.medium} ${easings.out} forwards`,
  fadeOut: `${keyframes.fadeOut} ${durations.medium} ${easings.in} forwards`,
  slideInFromTop: `${keyframes.slideInFromTop} ${durations.medium} ${easings.out} forwards`,
  slideOutToTop: `${keyframes.slideOutToTop} ${durations.medium} ${easings.in} forwards`,
  slideInFromBottom: `${keyframes.slideInFromBottom} ${durations.medium} ${easings.out} forwards`,
  slideOutToBottom: `${keyframes.slideOutToBottom} ${durations.medium} ${easings.in} forwards`,
  pulse: `${keyframes.pulse} ${durations.slow} ${easings.inOut} infinite`,
};

// Border radius system
export const borderRadius = {
  none: "0",
  sm: "calc(var(--radius) - 4px)",
  md: "calc(var(--radius) - 2px)",
  lg: "var(--radius)",
  xl: "calc(var(--radius) + 2px)",
  "2xl": "calc(var(--radius) + 4px)",
  full: "9999px",
}; 