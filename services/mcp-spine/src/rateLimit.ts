export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: string;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

export class RateLimiter {
  private entries = new Map<string, RateLimitEntry>();

  constructor(private limit: number, private windowMs: number) {}

  check(key: string): RateLimitResult {
    const now = Date.now();
    const entry = this.entries.get(key);
    if (!entry || now > entry.resetAt) {
      const resetAt = now + this.windowMs;
      this.entries.set(key, { count: 1, resetAt });
      return {
        allowed: true,
        remaining: Math.max(this.limit - 1, 0),
        resetAt: new Date(resetAt).toISOString(),
      };
    }

    if (entry.count >= this.limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(entry.resetAt).toISOString(),
      };
    }

    entry.count += 1;
    return {
      allowed: true,
      remaining: Math.max(this.limit - entry.count, 0),
      resetAt: new Date(entry.resetAt).toISOString(),
    };
  }
}
