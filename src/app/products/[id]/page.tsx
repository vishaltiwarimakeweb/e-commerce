import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductById } from "@/lib/products";
import { getProductReviews } from "@/lib/reviews";
import { formatPrice } from "@/lib/format";
import { ImageGallery } from "@/components/products/ImageGallery";
import { StarRating } from "@/components/products/StarRating";
import { AddToCartButton } from "@/components/products/AddToCartButton";
import { ReviewForm } from "@/components/products/ReviewForm";
import { ReviewList } from "@/components/products/ReviewList";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  return { title: product ? `${product.title} — Woozi` : "Product not found — Woozi" };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const reviews = await getProductReviews(id);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8 sm:px-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ImageGallery images={product.images} title={product.title} />

        <div className="flex flex-col gap-4">
          <span className="text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            {product.category}
          </span>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{product.title}</h1>
          <StarRating rating={product.ratingAverage} count={product.ratingCount} size="md" />
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{formatPrice(product.price)}</p>
          <p className="leading-relaxed text-zinc-600 dark:text-zinc-300">{product.description}</p>

          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="pt-2">
            <AddToCartButton inStock={product.stock > 0} />
          </div>
        </div>
      </div>

      <section className="flex flex-col gap-5 border-t border-zinc-200 pt-8 dark:border-zinc-800">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          Reviews {product.ratingCount > 0 && `(${product.ratingCount})`}
        </h2>
        <ReviewForm productId={product._id} />
        <ReviewList reviews={reviews} />
      </section>
    </div>
  );
}
