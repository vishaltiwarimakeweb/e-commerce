"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import { uploadImageToCloudinary } from "@/lib/uploadImage";
import type { AdminProductDetail } from "@/lib/adminProducts";
import type { AdminProductInput } from "@/lib/validation/adminProduct";

const inputClass =
  "rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100";

export function AdminProductForm({
  initialValue,
  onSubmit,
  onCancel,
}: {
  initialValue?: AdminProductDetail;
  onSubmit: (data: AdminProductInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initialValue?.title ?? "");
  const [shortDescription, setShortDescription] = useState(initialValue?.shortDescription ?? "");
  const [description, setDescription] = useState(initialValue?.description ?? "");
  const [category, setCategory] = useState(initialValue?.category ?? "");
  const [tags, setTags] = useState(initialValue?.tags.join(", ") ?? "");
  const [price, setPrice] = useState(initialValue ? String(initialValue.price / 100) : "");
  const [stock, setStock] = useState(initialValue ? String(initialValue.stock) : "0");
  const [images, setImages] = useState<string[]>(initialValue?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleFilesSelected(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploaded = await Promise.all(files.map((file) => uploadImageToCloudinary(file, "product")));
      setImages((prev) => [...prev, ...uploaded]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (images.length === 0) {
      toast.error("Add at least one image.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        title,
        shortDescription,
        description,
        category,
        images,
        price: Math.round(Number(price) * 100),
        stock: Number(stock),
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-2xl border border-dashed border-zinc-300 p-4 dark:border-zinc-700">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input required placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
        <input required placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass} />
        <input
          required
          placeholder="Short description (shown on catalog cards)"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          className={`sm:col-span-2 ${inputClass}`}
        />
        <textarea
          required
          placeholder="Full description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={`sm:col-span-2 resize-none ${inputClass}`}
        />
        <input
          required
          type="number"
          min={0}
          step="0.01"
          placeholder="Price (USD)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className={inputClass}
        />
        <input required type="number" min={0} placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} className={inputClass} />
        <input
          placeholder="Tags (comma-separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className={`sm:col-span-2 ${inputClass}`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {images.map((src) => (
          <div key={src} className="relative size-16 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
            <Image src={src} alt="Product photo" fill sizes="64px" className="object-cover" />
            <button
              type="button"
              onClick={() => setImages((prev) => prev.filter((image) => image !== src))}
              aria-label="Remove photo"
              className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-black/60 text-white"
            >
              <X className="size-2.5" />
            </button>
          </div>
        ))}
        <label className="flex size-16 cursor-pointer items-center justify-center rounded-lg border border-dashed border-zinc-300 text-xs text-zinc-400 hover:border-zinc-400 dark:border-zinc-700">
          {uploading ? "…" : "+ Photo"}
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleFilesSelected} disabled={uploading} />
        </label>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting || uploading}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save product"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
          Cancel
        </button>
      </div>
    </form>
  );
}
