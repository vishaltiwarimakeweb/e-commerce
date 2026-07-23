import Link from "next/link";
import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

export const metadata: Metadata = { title: "Create account — Woozi" };

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Create your account</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Join Woozi to start shopping.
        </p>
      </div>

      <OAuthButtons />

      <div className="flex items-center gap-3 text-xs font-medium text-zinc-400">
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        OR
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <RegisterForm />

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
          Sign in
        </Link>
      </p>
    </div>
  );
}
