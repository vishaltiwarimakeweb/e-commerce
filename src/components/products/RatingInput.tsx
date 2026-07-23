"use client";

import { useState } from "react";
import { Star } from "lucide-react";

export function RatingInput({ value, onChange }: { value: number; onChange: (rating: number) => void }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value;

  return (
    <div className="flex gap-1" onMouseLeave={() => setHovered(null)}>
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;
        const filled = starValue <= display;
        return (
          <button
            key={starValue}
            type="button"
            onClick={() => onChange(starValue)}
            onMouseEnter={() => setHovered(starValue)}
            aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
            className="p-0.5"
          >
            <Star
              className={`size-6 transition-colors ${
                filled ? "fill-amber-400 text-amber-400" : "fill-transparent text-zinc-300 dark:text-zinc-700"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
