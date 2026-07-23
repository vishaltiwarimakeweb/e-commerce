"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { buildQueryString } from "@/lib/searchParams";
import { productSortOptions, type ProductSort } from "@/lib/validation/product";

const LABELS: Record<ProductSort, string> = {
  newest: "Newest",
  price_asc: "Price: Low to High",
  price_desc: "Price: High to Low",
  name_asc: "Name: A-Z",
  name_desc: "Name: Z-A",
};

export function SortDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = (searchParams.get("sort") as ProductSort) || "newest";

  return (
    <select
      value={current}
      onChange={(event) => {
        const query = buildQueryString(searchParams, { sort: event.target.value });
        router.push(query ? `${pathname}?${query}` : pathname);
      }}
      aria-label="Sort products"
      className="rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-700 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
    >
      {productSortOptions.map((option) => (
        <option key={option} value={option}>
          {LABELS[option]}
        </option>
      ))}
    </select>
  );
}
