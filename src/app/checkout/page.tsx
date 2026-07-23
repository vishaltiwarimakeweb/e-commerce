import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth";
import { getCart } from "@/lib/cart";
import { getProfile } from "@/lib/profile";
import { CheckoutView } from "@/components/checkout/CheckoutView";

export const metadata: Metadata = { title: "Checkout — Woozi" };

export default async function CheckoutPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in?redirect=/checkout");

  const [cart, profile] = await Promise.all([getCart(user.id), getProfile(user.id)]);
  if (cart.items.length === 0) redirect("/cart");

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Checkout</h1>
      <CheckoutView cart={cart} addresses={profile?.addresses ?? []} />
    </div>
  );
}
