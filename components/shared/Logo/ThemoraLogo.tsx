import React from "react";

interface ThemoraMarkProps {
  size?: number;
  className?: string;
  title?: string;
}

// Themora brand mark: a layered "T" (stacked theme panels) with a spark accent.
// The gradient tile is CSS so the mark never depends on shared SVG <defs>.
export function ThemoraMark({ size = 32, className = "", title = "Themora" }: ThemoraMarkProps) {
  return (
    <span
      role="img"
      aria-label={title}
      className={`inline-flex shrink-0 overflow-hidden rounded-[27%] shadow-md shadow-[#3F5BF0]/25 ${className}`}
      style={{
        width: size,
        height: size,
        background:
          "radial-gradient(120% 90% at 20% 5%, rgb(255 255 255 / 0.32), transparent 55%), linear-gradient(135deg, #1D6FE0 0%, #3F5BF0 55%, #7C5CFC 100%)",
      }}
    >
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className="h-full w-full">
        {/* Back layer */}
        <rect x="13.5" y="16" width="25" height="7" rx="3.5" fill="#fff" fillOpacity="0.3" />
        <rect x="23" y="16" width="7" height="22" rx="3.5" fill="#fff" fillOpacity="0.3" />
        {/* Front "T" */}
        <rect x="10.5" y="12.5" width="25" height="7" rx="3.5" fill="#fff" />
        <rect x="19.5" y="12.5" width="7" height="22.5" rx="3.5" fill="#fff" />
        {/* Spark */}
        <path
          d="M39 6.5c.35 1.9 1.1 2.65 3 3-1.9.35-2.65 1.1-3 3-.35-1.9-1.1-2.65-3-3 1.9-.35 2.65-1.1 3-3Z"
          fill="#FFE08A"
        />
      </svg>
    </span>
  );
}

interface ThemoraLogoProps extends ThemoraMarkProps {
  textClassName?: string;
  showText?: boolean;
}

// Mark + wordmark
export default function ThemoraLogo({
  size = 32,
  className = "",
  textClassName = "text-xl",
  showText = true,
}: ThemoraLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <ThemoraMark size={size} />
      {showText && (
        <span className={`font-bold tracking-tight text-slate-900 dark:text-white ${textClassName}`}>
          Them<span className="bg-gradient-to-r from-[#1D6FE0] to-[#7C5CFC] bg-clip-text text-transparent">ora</span>
        </span>
      )}
    </span>
  );
}
