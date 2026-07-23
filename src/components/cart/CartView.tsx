"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/layout/CartProvider";
import { formatPrice } from "@/lib/format";
import type { CartData } from "@/lib/cart";

export function CartView({ initialCart }: { initialCart: CartData }) {
  const [cart, setCart] = useState(initialCart);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const { setItemCount } = useCart();

  async function updateQuantity(productId: string, quantity: number) {
    setPendingId(productId);
    try {
      const res = await fetch(`/api/cart/items/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Couldn't update that item.");
        return;
      }
      setCart(data.cart);
      setItemCount(data.cart.itemCount);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPendingId(null);
    }
  }

  async function removeItem(productId: string) {
    setPendingId(productId);
    try {
      const res = await fetch(`/api/cart/items/${productId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Couldn't remove that item.");
        return;
      }
      setCart(data.cart);
      setItemCount(data.cart.itemCount);
      toast.success("Removed from cart.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPendingId(null);
    }
  }

  if (cart.items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
        <ShoppingBag className="size-10 text-zinc-300 dark:text-zinc-700" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Your cart is empty.</p>
        <Link href="/" className="text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400">
          Browse the catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <ul className="flex flex-col gap-4">
        {cart.items.map((item) => (
          <li
            key={item.productId}
            className="flex gap-4 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <Image src={item.thumbnail} alt={item.title} fill sizes="80px" className="object-cover" />
            </div>

            <div className="flex flex-1 flex-col justify-between">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/products/${item.productId}`} className="font-medium text-zinc-900 hover:underline dark:text-zinc-50">
                  {item.title}
                </Link>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  disabled={pendingId === item.productId}
                  aria-label="Remove item"
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    disabled={pendingId === item.productId}
                    aria-label="Decrease quantity"
                    className="flex size-7 items-center justify-center rounded-full border border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm tabular-nums">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    disabled={pendingId === item.productId || item.quantity >= item.stock}
                    aria-label="Increase quantity"
                    className="flex size-7 items-center justify-center rounded-full border border-zinc-200 hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-800 dark:hover:bg-zinc-800"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">{formatPrice(item.lineTotal)}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex h-fit flex-col gap-4 rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Order summary</h2>
        <div className="flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-300">
          <span>Subtotal ({cart.itemCount} item{cart.itemCount === 1 ? "" : "s"})</span>
          <span className="font-medium tabular-nums">{formatPrice(cart.subtotal)}</span>
        </div>
        <Link
          href="/checkout"
          className="rounded-lg bg-emerald-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          Proceed to checkout
        </Link>
      </div>
    </div>
  );
}
