import { beforeEach, describe, expect, it, vi } from "vitest";

const mockConstructEvent = vi.fn();
const mockRecordStripeEventIfNew = vi.fn();

vi.mock("@/lib/env", () => ({
  env: {
    STRIPE_WEBHOOK_SECRET: "whsec_test"
  }
}));

vi.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: {
      constructEvent: mockConstructEvent
    }
  }
}));

vi.mock("@/lib/listenerEntitlements", () => ({
  grantEntitlement: vi.fn(),
  recordStripeEventIfNew: mockRecordStripeEventIfNew,
  revokeEntitlementsByPaymentIntent: vi.fn()
}));

describe("stripe webhook signature validation", () => {
  beforeEach(() => {
    vi.resetModules();
    mockConstructEvent.mockReset();
    mockRecordStripeEventIfNew.mockReset();
  });

  it("returns 400 when signature header is missing", async () => {
    const { POST } = await import("@/app/api/webhooks/stripe/route");
    const response = await POST(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        body: "{}"
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Missing Stripe signature."
    });
  });

  it("returns 400 when signature is invalid", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    const { POST } = await import("@/app/api/webhooks/stripe/route");
    const response = await POST(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        headers: {
          "stripe-signature": "bad-signature"
        },
        body: "{}"
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid Stripe signature."
    });
    expect(mockConstructEvent).toHaveBeenCalled();
  });
});
