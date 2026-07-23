import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildQueryString } from "@/lib/searchParams";

export function Pagination({
  page,
  totalPages,
  currentParams,
}: {
  page: number;
  totalPages: number;
  currentParams: Record<string, string>;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (targetPage: number) => {
    const query = buildQueryString(new URLSearchParams(currentParams), { page: String(targetPage) });
    return `/?${query}`;
  };

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      <Link
        href={hrefFor(page - 1)}
        aria-disabled={page <= 1}
        className={`flex size-9 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 ${
          page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
        }`}
      >
        <ChevronLeft className="size-4" />
      </Link>
      <span className="px-3 text-sm text-zinc-600 dark:text-zinc-300">
        Page {page} of {totalPages}
      </span>
      <Link
        href={hrefFor(page + 1)}
        aria-disabled={page >= totalPages}
        className={`flex size-9 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 ${
          page >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
        }`}
      >
        <ChevronRight className="size-4" />
      </Link>
    </nav>
  );
}
