// Merges `updates` into the current query string. undefined/"" removes the key.
// Any change other than to `page` itself resets pagination back to page 1.
export function buildQueryString(
  current: URLSearchParams,
  updates: Record<string, string | undefined>,
): string {
  const next = new URLSearchParams(current);

  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || value === "") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
  }

  if (!("page" in updates)) {
    next.delete("page");
  }

  return next.toString();
}
