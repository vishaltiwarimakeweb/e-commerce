"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/components/layout/AuthProvider";

// The only sign-out control in the app — intentionally not in the Navbar.
export function SignOutButton() {
  const { setUser } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    const res = await fetch("/api/auth/logout", { method: "POST" });
    if (res.ok) {
      setUser(null);
      toast.success("Signed out.");
      router.push("/");
      router.refresh();
    } else {
      toast.error("Couldn't sign out. Try again.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="flex items-center gap-1.5 self-start rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      <LogOut className="size-4" />
      Sign out
    </button>
  );
}
