import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth";
import { getOrder } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { DeliveryStatusBadge, PaymentStatusBadge } from "@/components/orders/OrderStatusBadge";

export const metadata: Metadata = { title: "Order details — Woozi" };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");

  const { id } = await params;
  const order = await getOrder(user.id, id);
  if (!order) notFound();

  const address = order.shippingAddress;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Order #{order.id}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2">
          <PaymentStatusBadge status={order.paymentStatus} />
          <DeliveryStatusBadge status={order.deliveryStatus} />
        </div>
      </div>

      <section className="flex flex-col gap-3 rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Items</h2>
        <ul className="flex flex-col gap-3">
          {order.items.map((item) => (
            <li key={item.productId} className="flex items-center gap-3">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                <Image src={item.thumbnail} alt={item.title} fill sizes="56px" className="object-cover" />
              </div>
              <Link href={`/products/${item.productId}`} className="flex-1 text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-50">
                {item.title}
              </Link>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">× {item.quantity}</span>
              <span className="w-20 text-right text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {formatPrice(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-zinc-100 pt-3 text-sm font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">
          <span>Total ({order.paymentMode})</span>
          <span>{formatPrice(order.totalAmount)}</span>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1 rounded-2xl border border-zinc-200 p-5 text-sm dark:border-zinc-800">
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Shipping to
          </h2>
          <p className="font-medium text-zinc-900 dark:text-zinc-50">{address.fullName}</p>
          <p className="text-zinc-500 dark:text-zinc-400">
            {address.line1}
            {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} {address.postalCode},{" "}
            {address.country}
          </p>
          <p className="text-zinc-500 dark:text-zinc-400">{address.phone}</p>
        </div>
        <div className="flex flex-col gap-1 rounded-2xl border border-zinc-200 p-5 text-sm dark:border-zinc-800">
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Estimated delivery
          </h2>
          <p className="font-medium text-zinc-900 dark:text-zinc-50">
            {new Date(order.estimatedDeliveryDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </section>
    </div>
  );
}
