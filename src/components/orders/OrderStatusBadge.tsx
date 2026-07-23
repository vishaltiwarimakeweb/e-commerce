const DELIVERY_STYLES: Record<string, string> = {
  "On the way": "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  Delivered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
};

const PAYMENT_STYLES: Record<string, string> = {
  Pending: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  Paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  Failed: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

function Badge({ label, className }: { label: string; className: string }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>{label}</span>;
}

export function DeliveryStatusBadge({ status }: { status: string }) {
  return <Badge label={status} className={DELIVERY_STYLES[status] ?? DELIVERY_STYLES["On the way"]} />;
}

export function PaymentStatusBadge({ status }: { status: string }) {
  return <Badge label={status} className={PAYMENT_STYLES[status] ?? PAYMENT_STYLES.Pending} />;
}
