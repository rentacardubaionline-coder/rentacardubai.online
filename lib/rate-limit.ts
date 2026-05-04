// Lightweight rate limiter.
//
// In v1 we use an in-memory sliding-window counter. It's per-process — fine
// on a single Vercel function instance for single-digit-RPS endpoints like
// /api/leads/whatsapp and /api/newsletter/subscribe. It DOES NOT survive a
// cold start or fan out across instances. When that becomes an issue, set
// UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN and swap to Upstash.

interface Bucket {
  count: number;
  resetAt: number;
}

// Map<bucketName + ":" + key, Bucket>. Cleared on cold start.
const memory = new Map<string, Bucket>();

export interface RateLimitInput {
  /** Logical bucket name, e.g. "leads-whatsapp". */
  bucket: string;
  /** Per-bucket key — typically the client IP. */
  key: string;
  /** Max requests allowed in the window. */
  max: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  ok: boolean;
  /** Requests remaining in the current window. */
  remaining: number;
  /** Epoch ms when the window resets. */
  resetAt: number;
}

/**
 * Atomic increment-or-create. Returns whether the request is allowed.
 *
 * Does NOT block — caller must check `result.ok` and respond 429 itself.
 */
export async function rateLimit(input: RateLimitInput): Promise<RateLimitResult> {
  const id = `${input.bucket}:${input.key}`;
  const now = Date.now();

  const existing = memory.get(id);
  if (!existing || existing.resetAt <= now) {
    const fresh: Bucket = { count: 1, resetAt: now + input.windowMs };
    memory.set(id, fresh);
    cleanup();
    return { ok: true, remaining: input.max - 1, resetAt: fresh.resetAt };
  }

  if (existing.count >= input.max) {
    return { ok: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    ok: true,
    remaining: input.max - existing.count,
    resetAt: existing.resetAt,
  };
}

// Periodically prune expired buckets so memory doesn't grow unboundedly.
let lastCleanup = 0;
function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < 60_000) return;
  lastCleanup = now;
  for (const [id, bucket] of memory) {
    if (bucket.resetAt <= now) memory.delete(id);
  }
}
