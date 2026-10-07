import React from "react";

const SIZES = { xs: 16, sm: 20, md: 32, lg: 48 } as const;

const TONES = {
  // Brand gradient — for page/section loading on light or dark surfaces
  brand: "conic-gradient(from 0deg, transparent 0deg, #1D6FE0 140deg, #7C5CFC 300deg, transparent 360deg)",
  // White — for use inside primary (gradient/coloured) buttons
  light: "conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.55) 140deg, #fff 300deg, transparent 360deg)",
} as const;

interface SpinnerProps {
  size?: keyof typeof SIZES;
  tone?: keyof typeof TONES;
  className?: string;
  label?: string;
}

// The single spinner used across the whole site. The label is for screen readers only.
export default function Spinner({ size = "md", tone = "brand", className = "", label = "Loading" }: SpinnerProps) {
  const px = SIZES[size];
  const ring = Math.max(2, Math.round(px / 9));
  return (
    <span role="status" aria-label={label} className={`inline-flex shrink-0 ${className}`}>
      <span
        className="animate-spin rounded-full"
        style={{
          width: px,
          height: px,
          background: TONES[tone],
          WebkitMask: `radial-gradient(farthest-side, transparent calc(100% - ${ring}px), #000 0)`,
          mask: `radial-gradient(farthest-side, transparent calc(100% - ${ring}px), #000 0)`,
        }}
      />
    </span>
  );
}

// Centered spinner block for whole sections or pages
export function LoadingState({ className = "min-h-[40vh]", size = "lg" }: { className?: string; size?: SpinnerProps["size"] }) {
  return (
    <div className={`flex w-full items-center justify-center ${className}`}>
      <Spinner size={size} />
    </div>
  );
}
