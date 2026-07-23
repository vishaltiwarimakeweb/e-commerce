import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth";
import { getCart } from "@/lib/cart";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = { title: "Your cart — Woozi" };

export default async function CartPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in?redirect=/cart");

  const cart = await getCart(user.id);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Your cart</h1>
      <CartView initialCart={cart} />
    </div>
  );
}
