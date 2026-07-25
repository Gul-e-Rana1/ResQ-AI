let counter = 0;

/**
 * Supabase channel names must be unique per active subscription on a given client.
 * Multiple hook instances (e.g. a shell-level badge count and a screen's own data
 * fetch) can legitimately subscribe to the same table at the same time, so a static
 * name causes "cannot add postgres_changes callbacks after subscribe()" on the second
 * .channel(name).on(...).subscribe() call. Suffixing every channel name makes each
 * subscription independent regardless of how many callers are active concurrently.
 */
export function uniqueChannelName(base: string): string {
  counter += 1;
  return `${base}-${Date.now()}-${counter}`;
}
