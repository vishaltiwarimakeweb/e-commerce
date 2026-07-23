import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { PackageSearch } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { listOrders } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { DeliveryStatusBadge, PaymentStatusBadge } from "@/components/orders/OrderStatusBadge";

export const metadata: Metadata = { title: "My orders — Woozi" };

export default async function OrdersPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in?redirect=/orders");

  const orders = await listOrders(user.id);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">My orders</h1>

      {orders.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
          <PackageSearch className="size-10 text-zinc-300 dark:text-zinc-700" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">You haven&apos;t placed any orders yet.</p>
          <Link href="/" className="text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400">
            Browse the catalog
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/orders/${order.id}`}
                className="flex flex-col gap-3 rounded-2xl border border-zinc-200 p-4 transition-shadow hover:shadow-md dark:border-zinc-800"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Order #{order.id}</p>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <PaymentStatusBadge status={order.paymentStatus} />
                    <DeliveryStatusBadge status={order.deliveryStatus} />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {order.items.slice(0, 4).map((item) => (
                    <div key={item.productId} className="relative size-12 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                      <Image src={item.thumbnail} alt={item.title} fill sizes="48px" className="object-cover" />
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">+{order.items.length - 4} more</span>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {order.items.length} item{order.items.length === 1 ? "" : "s"}
                  </span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-50">{formatPrice(order.totalAmount)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
