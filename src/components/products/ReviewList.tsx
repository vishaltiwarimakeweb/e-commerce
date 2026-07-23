import Image from "next/image";
import type { ReviewListItem } from "@/lib/reviews";
import { StarRating } from "@/components/products/StarRating";

export function ReviewList({ reviews }: { reviews: ReviewListItem[] }) {
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        No reviews yet — be the first to share your thoughts.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-5">
      {reviews.map((review) => (
        <li key={review._id} className="flex flex-col gap-2 border-b border-zinc-100 pb-5 last:border-0 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{review.user.name}</span>
            <span className="text-xs text-zinc-400">
              {new Date(review.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
            </span>
          </div>
          <StarRating rating={review.rating} />
          {review.description && (
            <p className="text-sm text-zinc-600 dark:text-zinc-300">{review.description}</p>
          )}
          {review.images.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {review.images.map((src) => (
                <div key={src} className="relative size-16 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <Image src={src} alt="Review photo" fill sizes="64px" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
