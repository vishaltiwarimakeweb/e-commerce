import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/SignInForm";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { OAuthErrorToast } from "@/components/auth/OAuthErrorToast";

export const metadata: Metadata = { title: "Sign in — Woozi" };

export default function SignInPage() {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={null}>
        <OAuthErrorToast />
      </Suspense>

      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Welcome back</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Sign in to your Woozi account.</p>
      </div>

      <OAuthButtons />

      <div className="flex items-center gap-3 text-xs font-medium text-zinc-400">
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        OR
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <SignInForm />

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
          Register
        </Link>
      </p>
    </div>
  );
}
