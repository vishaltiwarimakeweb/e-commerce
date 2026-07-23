"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShieldCheck,
  ShoppingCart,
  User,
  FileQuestionMark,
} from "lucide-react";
import { useAuth } from "@/components/layout/AuthProvider";
import { useCart } from "@/components/layout/CartProvider";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const navLinks = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/orders", label: "My Orders", icon: Package },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
  { href: "/support", label: "Support", icon: FileQuestionMark },
];

export function Navbar() {
  const { user } = useAuth();
  const { itemCount } = useCart();
  const pathname = usePathname();
  const links = user?.isAdmin
    ? [...navLinks, { href: "/admin", label: "Admin", icon: ShieldCheck }]
    : navLinks;

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-emerald-600 dark:text-emerald-400"
        >
          Woozi
        </Link>

        {user ? (
          <nav className="flex items-center gap-1 sm:gap-2">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span className="relative">
                    <Icon className="size-4" />
                    {href === "/cart" && itemCount > 0 && (
                      <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-semibold text-white">
                        {itemCount > 9 ? "9+" : itemCount}
                      </span>
                    )}
                  </span>
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
            <ThemeToggle />
          </nav>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/sign-in"
              className="rounded-full px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              Register
            </Link>
            <ThemeToggle />
          </div>
        )}
      </div>
    </header>
  );
}
