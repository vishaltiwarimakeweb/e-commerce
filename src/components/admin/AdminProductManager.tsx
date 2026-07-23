"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/format";
import type { AdminProductListItem, AdminProductDetail } from "@/lib/adminProducts";
import type { AdminProductInput } from "@/lib/validation/adminProduct";
import { AdminProductForm } from "@/components/admin/AdminProductForm";

export function AdminProductManager({ initialProducts }: { initialProducts: AdminProductListItem[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<AdminProductDetail | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function refreshList() {
    const res = await fetch("/api/admin/products");
    if (res.ok) {
      const data = await res.json();
      setProducts(data.products);
    }
  }

  async function handleCreate(data: AdminProductInput) {
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const body = await res.json();
    if (!res.ok) {
      toast.error(body.error ?? "Couldn't create that product.");
      return;
    }
    toast.success("Product created.");
    setAdding(false);
    await refreshList();
  }

  async function handleUpdate(id: string, data: AdminProductInput) {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const body = await res.json();
    if (!res.ok) {
      toast.error(body.error ?? "Couldn't update that product.");
      return;
    }
    toast.success("Product updated.");
    setEditing(null);
    await refreshList();
  }

  async function startEditing(id: string) {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`);
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error ?? "Couldn't load that product.");
        return;
      }
      setEditing(body.product);
    } finally {
      setLoadingId(null);
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error ?? "Couldn't update that product.");
        return;
      }
      toast.success(isActive ? "Product restored." : "Product removed from the catalog.");
      await refreshList();
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Products ({products.length})
        </h2>
        {!adding && !editing && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            <Plus className="size-4" /> Add product
          </button>
        )}
      </div>

      {adding && <AdminProductForm onSubmit={handleCreate} onCancel={() => setAdding(false)} />}
      {editing && (
        <AdminProductForm
          initialValue={editing}
          onSubmit={(data) => handleUpdate(editing._id, data)}
          onCancel={() => setEditing(null)}
        />
      )}

      {!adding && !editing && (
        <ul className="flex flex-col gap-2">
          {products.map((product) => (
            <li
              key={product._id}
              className="flex items-center gap-3 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
            >
              <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                <Image src={product.thumbnail} alt={product.title} fill sizes="48px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">{product.title}</p>
                  {!product.isActive && (
                    <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {product.category} · Stock: {product.stock}
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {formatPrice(product.price)}
              </span>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => startEditing(product._id)}
                  disabled={loadingId === product._id}
                  aria-label="Edit product"
                  className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleActive(product._id, !product.isActive)}
                  disabled={loadingId === product._id}
                  aria-label={product.isActive ? "Remove product" : "Restore product"}
                  className={
                    product.isActive
                      ? "rounded-lg p-2 text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-950"
                      : "rounded-lg p-2 text-zinc-500 hover:bg-emerald-50 hover:text-emerald-600 dark:text-zinc-400 dark:hover:bg-emerald-950"
                  }
                >
                  {product.isActive ? <Trash2 className="size-4" /> : <RotateCcw className="size-4" />}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
