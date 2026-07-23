"use client";

import { useState, type FormEvent } from "react";
import type { AddressInput } from "@/lib/validation/profile";

const LABELS: AddressInput["label"][] = ["Home", "Work", "Other"];

const EMPTY: AddressInput = {
  label: "Home",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  isDefault: false,
};

export function AddressForm({
  initialValue,
  submitting,
  onSubmit,
  onCancel,
}: {
  initialValue?: AddressInput;
  submitting: boolean;
  onSubmit: (data: AddressInput) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<AddressInput>(initialValue ?? EMPTY);

  function update<K extends keyof AddressInput>(key: K, value: AddressInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit(form);
  }

  const inputClass =
    "rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-dashed border-zinc-300 p-4 dark:border-zinc-700">
      <div className="flex gap-2">
        {LABELS.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => update("label", label)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              form.label === label
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-zinc-200 text-zinc-600 dark:border-zinc-800 dark:text-zinc-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input required placeholder="Full name" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} className={inputClass} />
        <input required placeholder="Phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} />
        <input required placeholder="Address line 1" value={form.line1} onChange={(e) => update("line1", e.target.value)} className={`sm:col-span-2 ${inputClass}`} />
        <input placeholder="Address line 2 (optional)" value={form.line2 ?? ""} onChange={(e) => update("line2", e.target.value)} className={`sm:col-span-2 ${inputClass}`} />
        <input required placeholder="City" value={form.city} onChange={(e) => update("city", e.target.value)} className={inputClass} />
        <input required placeholder="State" value={form.state} onChange={(e) => update("state", e.target.value)} className={inputClass} />
        <input required placeholder="Postal code" value={form.postalCode} onChange={(e) => update("postalCode", e.target.value)} className={inputClass} />
        <input required placeholder="Country" value={form.country} onChange={(e) => update("country", e.target.value)} className={inputClass} />
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
        <input type="checkbox" checked={form.isDefault ?? false} onChange={(e) => update("isDefault", e.target.checked)} className="size-4 rounded border-zinc-300" />
        Set as default address
      </label>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save address"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 dark:border-zinc-800 dark:text-zinc-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
