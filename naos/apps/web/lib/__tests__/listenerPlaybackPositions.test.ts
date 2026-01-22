import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUpsertPlaybackPosition = vi.fn();
const mockGetPlaybackPosition = vi.fn();

vi.mock("@/lib/listenerPlaybackPositions", () => ({
  upsertPlaybackPosition: mockUpsertPlaybackPosition,
  getPlaybackPosition: mockGetPlaybackPosition
}));

describe("playback position updates and retrieval", () => {
  beforeEach(() => {
    vi.resetModules();
    mockUpsertPlaybackPosition.mockReset();
    mockGetPlaybackPosition.mockReset();
  });

  it("persists playback positions via the playback endpoint", async () => {
    const playbackPosition = {
      id: "pos_123",
      listenerId: "listener-123",
      assetId: "chapter-1",
      positionSeconds: 120
    };
    mockUpsertPlaybackPosition.mockResolvedValue(playbackPosition);

    const { POST } = await import("@/app/api/playback/position/route");
    const response = await POST(
      new Request("http://localhost/api/playback/position", {
        method: "POST",
        body: JSON.stringify({
          listenerId: "listener-123",
          chapterId: "chapter-1",
          positionSeconds: 120
        })
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ playbackPosition });
    expect(mockUpsertPlaybackPosition).toHaveBeenCalledWith({
      listenerId: "listener-123",
      email: undefined,
      assetId: "chapter-1",
      positionSeconds: 120
    });
  });

  it("retrieves playback positions for resume", async () => {
    const playbackPosition = {
      id: "pos_456",
      listenerId: "listener-456",
      assetId: "chapter-2",
      positionSeconds: 320
    };
    mockGetPlaybackPosition.mockResolvedValue(playbackPosition);

    const { GET } = await import("@/app/api/playback/position/route");
    const response = await GET(
      new Request(
        "http://localhost/api/playback/position?listenerId=listener-456&chapterId=chapter-2"
      )
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ playbackPosition });
    expect(mockGetPlaybackPosition).toHaveBeenCalledWith(
      "listener-456",
      "chapter-2"
    );
  });
});
