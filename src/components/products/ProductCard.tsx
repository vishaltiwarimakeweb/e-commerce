import Link from "next/link";
import Image from "next/image";
import type { ProductListItem } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { StarRating } from "@/components/products/StarRating";

export function ProductCard({ product }: { product: ProductListItem }) {
  return (
    <Link
      href={`/products/${product._id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <Image
          src={product.images[0]}
          alt={product.title}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {product.stock === 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-zinc-900/80 px-2.5 py-1 text-xs font-medium text-white">
            Out of stock
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
          {product.category}
        </span>
        <h3 className="line-clamp-1 font-semibold text-zinc-900 dark:text-zinc-50">{product.title}</h3>
        <p className="line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">{product.shortDescription}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{formatPrice(product.price)}</span>
          <StarRating rating={product.ratingAverage} count={product.ratingCount} />
        </div>
      </div>
    </Link>
  );
}
