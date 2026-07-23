"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Banknote, MapPin } from "lucide-react";
import { useCart } from "@/components/layout/CartProvider";
import { formatPrice } from "@/lib/format";
import type { CartData } from "@/lib/cart";
import type { AddressData } from "@/lib/profile";

export function CheckoutView({ cart, addresses }: { cart: CartData; addresses: AddressData[] }) {
  const router = useRouter();
  const { setItemCount } = useCart();
  const [addressId, setAddressId] = useState(addresses.find((a) => a.isDefault)?._id ?? addresses[0]?._id ?? "");
  const [placing, setPlacing] = useState(false);

  async function handlePlaceOrder() {
    if (!addressId) {
      toast.error("Select a delivery address.");
      return;
    }

    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressId }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Couldn't place your order.");
        return;
      }

      setItemCount(0);
      toast.success("Order placed!");
      router.push(`/orders/${data.order.id}`);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  if (addresses.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        You need a saved address before checking out.{" "}
        <Link href="/profile" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
          Add one on your profile
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-3 rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            <MapPin className="size-4.5" /> Delivery address
          </h2>
          <div className="flex flex-col gap-2">
            {addresses.map((address) => (
              <label
                key={address._id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition-colors ${
                  addressId === address._id
                    ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-500/5"
                    : "border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <input
                  type="radio"
                  name="address"
                  checked={addressId === address._id}
                  onChange={() => setAddressId(address._id)}
                  className="mt-1"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {address.label}
                    </span>
                    {address.isDefault && (
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Default</span>
                    )}
                  </div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{address.fullName}</p>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    {address.line1}
                    {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state}{" "}
                    {address.postalCode}, {address.country}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3 rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            <Banknote className="size-4.5" /> Payment method
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Cash on Delivery — pay when your order arrives. Online payment isn&apos;t available yet.
          </p>
        </section>
      </div>

      <div className="flex h-fit flex-col gap-4 rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Order summary</h2>
        <ul className="flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-300">
          {cart.items.map((item) => (
            <li key={item.productId} className="flex justify-between gap-2">
              <span className="line-clamp-1">
                {item.title} × {item.quantity}
              </span>
              <span className="shrink-0 tabular-nums">{formatPrice(item.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-zinc-100 pt-3 text-sm font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">
          <span>Total</span>
          <span className="tabular-nums">{formatPrice(cart.subtotal)}</span>
        </div>
        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={placing}
          className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {placing ? "Placing order…" : "Place order"}
        </button>
      </div>
    </div>
  );
}
