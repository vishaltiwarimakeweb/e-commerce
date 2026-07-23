"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/components/layout/AuthProvider";
import { useCart } from "@/components/layout/CartProvider";

export function AddToCartButton({ productId, inStock }: { productId: string; inStock: boolean }) {
  const { user } = useAuth();
  const { refresh } = useCart();
  const router = useRouter();
  const [adding, setAdding] = useState(false);

  async function handleClick() {
    if (!user) {
      router.push(`/sign-in?redirect=/products/${productId}`);
      return;
    }

    setAdding(true);
    try {
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Couldn't add that to your cart.");
        return;
      }
      await refresh();
      toast.success("Added to cart.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setAdding(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!inStock || adding}
      className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500"
    >
      <ShoppingCart className="size-4" />
      {inStock ? (adding ? "Adding…" : "Add to cart") : "Out of stock"}
    </button>
  );
}
