# Observability Logging & Alerting Standards

> **Purpose:** Define consistent correlation identifiers, structured logging format, and alerting rules
> across services to enable rapid incident triage and system-wide traceability.

## 1) Log Correlation IDs Across Services

### Required Correlation Fields
Every log line **must** include the following identifiers when available:

- `trace_id`: End-to-end request trace (generated at edge or entry service).
- `request_id`: Unique per inbound request; stable across retries for the same request.
- `session_id`: User session identifier (web-app / listener platform).
- `user_id`: Authenticated user identifier (if present).
- `proposal_id`: MCP proposal lifecycle identifier (MCP Spine).
- `event_id`: Narrative event identifier (Narrative Engine).
- `scene_id` / `packet_id`: Audio Engine identifiers (when present).
- `job_id`: Background job identifier (batch tasks, async processors).

### Propagation Rules

1. **Inbound edges** (API gateways, web-app) generate `trace_id` if missing and pass it
   through all downstream calls.
2. **Service-to-service calls** must pass correlation IDs via headers or metadata:
   - HTTP: `x-trace-id`, `x-request-id`, `x-session-id`, `x-user-id`
   - Queue/Jobs: message metadata fields with the same names
3. **Database writes** include `trace_id` and `request_id` in audit tables where applicable.
4. **Logs from background workers** must include `job_id` and `trace_id` if they originated
   from a request.

### Sampling Guidance

- **Never sample** error logs (`level >= error`).
- **Sample info/debug** logs only at high volume with a consistent hash on `trace_id`.

---

## 2) Structured Logging Format (JSON)

### Base Schema
All services log JSON objects with consistent keys:

```json
{
  "timestamp": "2025-01-01T12:00:00.000Z",
  "level": "info",
  "service": "mcp-service",
  "environment": "production",
  "message": "proposal submitted",
  "trace_id": "trc_01...",
  "request_id": "req_01...",
  "user_id": "usr_01...",
  "proposal_id": "prop_01...",
  "duration_ms": 182,
  "status_code": 200,
  "error_code": null,
  "error_owner": null,
  "metadata": {
    "route": "/v1/proposals",
    "method": "POST"
  }
}
```

### Required Keys

- `timestamp` (ISO-8601)
- `level` (debug/info/warn/error/fatal)
- `service` (stable service name)
- `environment` (dev/staging/prod)
- `message` (human-readable summary)

### Recommended Keys

- `trace_id`, `request_id`, `session_id`, `user_id`
- `status_code`, `duration_ms`
- `error_code`, `error_owner` (align with [error taxonomy](./error_taxonomy.md))
- `metadata` (structured context; no free-form strings unless necessary)

### PII & Secrets

- Never log raw access tokens, API keys, or payment data.
- Hash or redact sensitive values before logging (`email`, `phone`, `token`).

---

## 3) Instrumentation Standards (Log Fields + Trace IDs)

### Required Headers (HTTP)
- `x-trace-id`: End-to-end trace identifier generated at the edge.
- `x-request-id`: Request identifier generated at the entry service if missing.
- `x-session-id`: Session identifier for listener platform requests.

### MCP Spine Specifics
- MCP Spine must include `request_id` in every JSON response to support tracing.
- Proposal lifecycle logs must include `proposal_id` and `validation_status`.
- Rate-limit violations are logged as `warn` with `scope`, `role`, `model`, and `reset_at`.

### Standard Log Fields
- `service`, `environment`, `timestamp`, `level`, `message`
- `trace_id`, `request_id`
- `status_code`, `duration_ms`
- `metadata.route`, `metadata.method`

---

## 4) Alerting Rules for Critical Failures

### Severity Mapping

- **P0 (Critical):** Outage or data corruption risk.
- **P1 (High):** Major feature unavailable or widespread failures.
- **P2 (Medium):** Degraded performance, partial failure.
- **P3 (Low):** Non-blocking errors or minor regressions.

### Alert Triggers

| Alert | Threshold | Window | Severity | Notes |
| --- | --- | --- | --- | --- |
| Error rate spike | > 5% error responses | 5 minutes | P1 | Per service & endpoint |
| P95 latency | > 2x baseline | 10 minutes | P2 | Alert on sustained degradation |
| Request drop | > 50% traffic drop | 10 minutes | P1 | Compare to rolling baseline |
| MCP proposal failures | > 3 validation failures per minute | 5 minutes | P2 | Indicates upstream regressions |
| Canon gate rejection spike | > 5% of proposals | 10 minutes | P2 | Possible continuity issues |
| Payments webhook failure | > 3 failed webhooks | 10 minutes | P1 | High risk to entitlements |
| Job backlog | > 2x normal queue depth | 15 minutes | P2 | Monitor async processors |
| Storage/CDN errors | > 2% signed URL failures | 10 minutes | P1 | Impacts playback |

### Alert Payload Requirements

Each alert must include:

- `service`
- `environment`
- `severity`
- `trace_id` (if available)
- `error_code` + `error_owner`
- `runbook_link` (map to [error playbooks](./error_playbooks.md))

### Paging Policy

- **P0/P1**: Page on-call immediately.
- **P2**: Slack/Email notification during business hours.
- **P3**: Log to backlog without paging.
