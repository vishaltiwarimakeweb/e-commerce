import { Star } from "lucide-react";

export function StarRating({
  rating,
  count,
  size = "sm",
}: {
  rating: number;
  count?: number;
  size?: "sm" | "md";
}) {
  const starSize = size === "sm" ? "size-3.5" : "size-5";

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: 5 }, (_, index) => {
          const filled = index + 1 <= Math.round(rating);
          return (
            <Star
              key={index}
              className={`${starSize} ${
                filled ? "fill-amber-400 text-amber-400" : "fill-transparent text-zinc-300 dark:text-zinc-700"
              }`}
            />
          );
        })}
      </div>
      {count !== undefined && (
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {rating > 0 ? rating.toFixed(1) : "New"} {count > 0 && `(${count})`}
        </span>
      )}
    </div>
  );
}
