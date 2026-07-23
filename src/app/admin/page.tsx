import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth";
import { listAllProducts } from "@/lib/adminProducts";
import { adminProductListQuerySchema } from "@/lib/validation/adminProduct";
import { AdminProductManager } from "@/components/admin/AdminProductManager";

export const metadata: Metadata = { title: "Admin — Woozi" };

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in?redirect=/admin");
  if (!user.isAdmin) redirect("/");

  const { products } = await listAllProducts(adminProductListQuerySchema.parse({}));

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Admin</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Create, edit, and remove catalog products.</p>
      </div>
      <AdminProductManager initialProducts={products} />
    </div>
  );
}
