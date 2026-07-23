import type { Metadata } from "next";
import { Faq } from "@/components/support/Faq";
import { ContactForm } from "@/components/support/ContactForm";

export const metadata: Metadata = { title: "Support — Woozi" };

export default function SupportPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Support</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Answers to common questions, or send us a message directly.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Frequently asked questions
        </h2>
        <Faq />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Contact us
        </h2>
        <ContactForm />
      </section>
    </div>
  );
}
