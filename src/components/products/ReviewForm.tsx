"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import { useAuth } from "@/components/layout/AuthProvider";
import { RatingInput } from "@/components/products/RatingInput";
import { uploadImageToCloudinary } from "@/lib/uploadImage";

const MAX_IMAGES = 5;

export function ReviewForm({ productId }: { productId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        <Link href="/sign-in" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
          Sign in
        </Link>{" "}
        to leave a review.
      </p>
    );
  }

  async function handleFilesSelected(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, MAX_IMAGES - images.length);
    event.target.value = "";
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploaded = await Promise.all(files.map(uploadImageToCloudinary));
      setImages((prev) => [...prev, ...uploaded]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (rating === 0) {
      toast.error("Pick a star rating first.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, description: description.trim() || undefined, images }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Couldn't submit your review.");
        return;
      }

      toast.success("Thanks for your review!");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
      <div>
        <p className="mb-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">Your rating</p>
        <RatingInput value={rating} onChange={setRating} />
      </div>

      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Share your thoughts about this product (optional)"
        rows={3}
        maxLength={2000}
        className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
      />

      <div className="flex flex-wrap items-center gap-2">
        {images.map((src) => (
          <div key={src} className="relative size-16 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
            <Image src={src} alt="Review photo" fill sizes="64px" className="object-cover" />
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
        {images.length < MAX_IMAGES && (
          <label className="flex size-16 cursor-pointer items-center justify-center rounded-lg border border-dashed border-zinc-300 text-xs text-zinc-400 hover:border-zinc-400 dark:border-zinc-700">
            {uploading ? "…" : "+ Photo"}
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleFilesSelected} disabled={uploading} />
          </label>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting || uploading}
        className="self-start rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
