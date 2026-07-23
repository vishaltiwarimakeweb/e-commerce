import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 py-6 dark:border-zinc-800">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 text-sm text-zinc-500 sm:flex-row sm:px-6 dark:text-zinc-400">
        <span>© {new Date().getFullYear()} Woozi</span>
        <Link href="/support" className="font-medium hover:text-zinc-900 dark:hover:text-zinc-100">
          Support
        </Link>
      </div>
    </footer>
  );
}
