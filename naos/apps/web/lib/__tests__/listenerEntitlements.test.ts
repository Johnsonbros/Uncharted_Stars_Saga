import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGrantEntitlement = vi.fn();
const mockListActiveEntitlementsByEmail = vi.fn();
const mockListActiveEntitlementsByListenerId = vi.fn();

vi.mock("@/lib/env", () => ({
  env: {
    ENTITLEMENTS_INTERNAL_TOKEN: "test-token"
  }
}));

vi.mock("@/lib/listenerEntitlements", () => ({
  grantEntitlement: mockGrantEntitlement,
  listActiveEntitlementsByEmail: mockListActiveEntitlementsByEmail,
  listActiveEntitlementsByListenerId: mockListActiveEntitlementsByListenerId
}));

describe("entitlement grant and retrieval", () => {
  beforeEach(() => {
    vi.resetModules();
    mockGrantEntitlement.mockReset();
    mockListActiveEntitlementsByEmail.mockReset();
    mockListActiveEntitlementsByListenerId.mockReset();
  });

  it("grants entitlements via the internal endpoint", async () => {
    const grantedEntitlement = {
      id: "ent_123",
      listenerId: "listener-123",
      productId: "founders"
    };
    mockGrantEntitlement.mockResolvedValue(grantedEntitlement);

    const { POST } = await import("@/app/api/entitlements/grant/route");
    const response = await POST(
      new Request("http://localhost/api/entitlements/grant", {
        method: "POST",
        headers: {
          authorization: "Bearer test-token"
        },
        body: JSON.stringify({
          listenerId: "listener-123",
          productId: "founders"
        })
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      entitlement: grantedEntitlement
    });
    expect(mockGrantEntitlement).toHaveBeenCalledWith({
      listenerId: "listener-123",
      email: undefined,
      productId: "founders",
      accessStart: undefined,
      accessEnd: null,
      stripePaymentIntentId: undefined,
      stripeEventId: undefined
    });
  });

  it("lists active entitlements for a listener", async () => {
    const entitlements = [{ id: "ent_456", listenerId: "listener-123" }];
    mockListActiveEntitlementsByListenerId.mockResolvedValue(entitlements);

    const { GET } = await import("@/app/api/entitlements/route");
    const response = await GET(
      new Request("http://localhost/api/entitlements?listenerId=listener-123")
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ entitlements });
    expect(mockListActiveEntitlementsByListenerId).toHaveBeenCalledWith(
      "listener-123"
    );
    expect(mockListActiveEntitlementsByEmail).not.toHaveBeenCalled();
  });
});
