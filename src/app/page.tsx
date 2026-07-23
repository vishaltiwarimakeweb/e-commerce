import { getProducts } from "@/lib/products";
import { productQuerySchema } from "@/lib/validation/product";
import { SearchBar } from "@/components/products/SearchBar";
import { SortDropdown } from "@/components/products/SortDropdown";
import { FilterBar } from "@/components/products/FilterBar";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Pagination } from "@/components/products/Pagination";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await searchParams;
  const currentParams = Object.fromEntries(
    Object.entries(resolvedParams).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );

  const query = productQuerySchema.parse(currentParams);
  const { products, categories, page, totalPages } = await getProducts(query);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Discover the catalog</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Search, filter, and sort through everything Woozi has in stock.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar />
        <SortDropdown />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        <FilterBar categories={categories} />
        <div className="flex flex-col gap-6">
          <ProductGrid products={products} />
          <Pagination page={page} totalPages={totalPages} currentParams={currentParams} />
        </div>
      </div>
    </div>
  );
}
