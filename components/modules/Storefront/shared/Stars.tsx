import React from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

/** Read-only star row, e.g. 4.5 → ★★★★½ */
export default function Stars({ rating, className = "h-3.5 w-3.5" }: { rating: number; className?: string }) {
  return (
    <span role="img" className="inline-flex items-center gap-0.5 text-amber-400" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const Icon = rating >= star ? FaStar : rating >= star - 0.5 ? FaStarHalfAlt : FaRegStar;
        return <Icon key={star} aria-hidden className={className} />;
      })}
    </span>
  );
}
