# Storage → CDN Delivery Flow

> **Purpose:** Visualize how audio assets move from object storage through CDN delivery
> so the listener platform can serve signed, cacheable audio streams.

```mermaid
flowchart LR
  A[Creator OS Upload] --> B[Object Storage Bucket]
  B --> C[Metadata + Cache Headers]
  C --> D[CDN Origin Pull]
  D --> E[Edge Cache]
  E --> F[Signed URL Access]
  F --> G[Listener Player]
  G --> H[Playback Resume + Metrics]

  subgraph Access Controls
    F --> I[Signed URL Validation]
    I --> J[Entitlement Check]
  end

  subgraph Operations
    B --> K[Lifecycle Rules]
    E --> L[Cache Purge on Update]
  end
```

## Notes
- Signed URLs are short-lived and tied to entitlements.
- Cache headers are set at upload time and respected by the CDN.
- Cache purges occur when audio masters are replaced.
