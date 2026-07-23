"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import type { AddressData } from "@/lib/profile";
import type { AddressInput } from "@/lib/validation/profile";
import { AddressForm } from "@/components/profile/AddressForm";

export function AddressManager({ initialAddresses }: { initialAddresses: AddressData[] }) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleAdd(data: AddressInput) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/profile/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error ?? "Couldn't add that address.");
        return;
      }
      setAddresses(body.profile.addresses);
      setAdding(false);
      toast.success("Address added.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(addressId: string, data: AddressInput) {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/profile/addresses/${addressId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error ?? "Couldn't update that address.");
        return;
      }
      setAddresses(body.profile.addresses);
      setEditingId(null);
      toast.success("Address updated.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(addressId: string) {
    try {
      const res = await fetch(`/api/profile/addresses/${addressId}`, { method: "DELETE" });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error ?? "Couldn't remove that address.");
        return;
      }
      setAddresses(body.profile.addresses);
      toast.success("Address removed.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Saved addresses</h2>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
          >
            <Plus className="size-4" />
            Add address
          </button>
        )}
      </div>

      {addresses.length === 0 && !adding && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No saved addresses yet.</p>
      )}

      <div className="flex flex-col gap-3">
        {addresses.map((address) =>
          editingId === address._id ? (
            <AddressForm
              key={address._id}
              initialValue={address}
              submitting={submitting}
              onSubmit={(data) => handleUpdate(address._id, data)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div key={address._id} className="flex items-start justify-between gap-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <div className="flex flex-col gap-0.5 text-sm">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {address.label}
                  </span>
                  {address.isDefault && (
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <Star className="size-3 fill-current" /> Default
                    </span>
                  )}
                </div>
                <p className="font-medium text-zinc-900 dark:text-zinc-50">{address.fullName}</p>
                <p className="text-zinc-500 dark:text-zinc-400">
                  {address.line1}
                  {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state}{" "}
                  {address.postalCode}, {address.country}
                </p>
                <p className="text-zinc-500 dark:text-zinc-400">{address.phone}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => setEditingId(address._id)}
                  aria-label="Edit address"
                  className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(address._id)}
                  aria-label="Delete address"
                  className="rounded-lg p-2 text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-950"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ),
        )}

        {adding && <AddressForm submitting={submitting} onSubmit={handleAdd} onCancel={() => setAdding(false)} />}
      </div>
    </div>
  );
}
