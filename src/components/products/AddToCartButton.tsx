"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/components/layout/AuthProvider";

// Cart itself lands in Phase 4 — for now this only handles the auth gate
// (redirect signed-out shoppers to sign-in) so the button isn't dead weight.
export function AddToCartButton({ inStock }: { inStock: boolean }) {
  const { user } = useAuth();
  const router = useRouter();

  function handleClick() {
    if (!user) {
      router.push("/sign-in");
      return;
    }
    toast.info("Cart is launching soon — hang tight!");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!inStock}
      className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500"
    >
      <ShoppingCart className="size-4" />
      {inStock ? "Add to cart" : "Out of stock"}
    </button>
  );
}
