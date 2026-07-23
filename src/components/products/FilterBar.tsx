"use client";

import { useState, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { buildQueryString } from "@/lib/searchParams";

export function FilterBar({ categories }: { categories: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Prices live in the URL/API as integer cents; the inputs show whole dollars.
  const centsParamToDollars = (param: string | null) =>
    param ? String(Number(param) / 100) : "";

  const activeCategory = searchParams.get("category") ?? "";
  const [minPrice, setMinPrice] = useState(centsParamToDollars(searchParams.get("minPrice")));
  const [maxPrice, setMaxPrice] = useState(centsParamToDollars(searchParams.get("maxPrice")));

  function applyPriceRange(event: FormEvent) {
    event.preventDefault();
    const query = buildQueryString(searchParams, {
      minPrice: minPrice ? String(Math.round(Number(minPrice) * 100)) : undefined,
      maxPrice: maxPrice ? String(Math.round(Number(maxPrice) * 100)) : undefined,
    });
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function setCategory(category: string) {
    const query = buildQueryString(searchParams, {
      category: category === activeCategory ? undefined : category,
    });
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  const hasFilters = activeCategory || searchParams.get("minPrice") || searchParams.get("maxPrice");

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          <SlidersHorizontal className="size-4" />
          Filters
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={() => router.push(pathname)}
            className="flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <X className="size-3.5" />
            Clear
          </button>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">Category</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setCategory(category)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                activeCategory === category
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-800 dark:text-zinc-300"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={applyPriceRange} className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Price ($)</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950"
          />
          <span className="text-zinc-400">–</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          Apply
        </button>
      </form>
    </div>
  );
}
