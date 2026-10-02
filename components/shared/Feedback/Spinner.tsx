import React from "react";

const SIZES = { sm: 20, md: 32, lg: 48 } as const;

interface SpinnerProps {
  size?: keyof typeof SIZES;
  className?: string;
  label?: string;
}

// Brand-gradient ring spinner. The label is for screen readers only.
export default function Spinner({ size = "md", className = "", label = "Loading" }: SpinnerProps) {
  const px = SIZES[size];
  return (
    <span role="status" aria-label={label} className={`inline-flex ${className}`}>
      <span
        className="animate-spin rounded-full"
        style={{
          width: px,
          height: px,
          background: "conic-gradient(from 0deg, transparent 0deg, #1D6FE0 140deg, #7C5CFC 300deg, transparent 360deg)",
          WebkitMask: `radial-gradient(farthest-side, transparent calc(100% - ${Math.max(3, px / 9)}px), #000 0)`,
          mask: `radial-gradient(farthest-side, transparent calc(100% - ${Math.max(3, px / 9)}px), #000 0)`,
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
