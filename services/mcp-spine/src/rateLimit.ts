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
  private lastSweepAt = 0;
  private sweepIntervalMs: number;

  constructor(private limit: number, private windowMs: number) {
    this.sweepIntervalMs = windowMs;
  }

  check(key: string): RateLimitResult {
    const now = Date.now();
    this.sweepExpiredEntries(now);
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

  private sweepExpiredEntries(now: number) {
    if (now - this.lastSweepAt < this.sweepIntervalMs) {
      return;
    }

    for (const [entryKey, entry] of this.entries.entries()) {
      if (now > entry.resetAt) {
        this.entries.delete(entryKey);
      }
    }

    this.lastSweepAt = now;
  }
}
