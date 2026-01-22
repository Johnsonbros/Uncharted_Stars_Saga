import assert from "node:assert/strict";
import { test } from "node:test";
import { RateLimiter } from "../src/rateLimit.js";

test("rate limiter enforces limits and returns reset timestamp", () => {
  const limiter = new RateLimiter(2, 60_000);

  const first = limiter.check("proposal:create:creator:opus");
  const second = limiter.check("proposal:create:creator:opus");
  const third = limiter.check("proposal:create:creator:opus");

  assert.equal(first.allowed, true);
  assert.equal(second.allowed, true);
  assert.equal(third.allowed, false);
  assert.equal(third.remaining, 0);
  assert.ok(third.resetAt);
});

test("rate limiter resets after window", (t) => {
  const originalNow = Date.now;
  let now = 1_000_000;
  Date.now = () => now;
  t.after(() => {
    Date.now = originalNow;
  });

  const limiter = new RateLimiter(1, 1_000);
  const first = limiter.check("resource:resolve:creator:opus");
  assert.equal(first.allowed, true);

  now += 1_001;
  const second = limiter.check("resource:resolve:creator:opus");
  assert.equal(second.allowed, true);
  assert.equal(second.remaining, 0);
});
