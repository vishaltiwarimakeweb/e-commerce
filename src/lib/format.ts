const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

// Prices are stored as integer cents throughout the app.
export function formatPrice(cents: number): string {
  return currencyFormatter.format(cents / 100);
}
