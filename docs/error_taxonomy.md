# Unified Error Taxonomy & Severity Table

## Purpose

This document defines a shared error taxonomy across the Narrative Engine, Audio Engine, MCP Spine, Listener Platform, Payments, and Data Layer. The goal is consistent **severity**, **ownership**, and **actionability** for every error surfaced to logs, tools, and user-facing experiences.

## 1) Severity Levels

| Severity | Label | User Impact | Operational Response | Target Time-to-Engage |
|---|---|---|---|---|
| **SEV0** | Critical | System-wide outage, data corruption, or security breach | Page immediately, halt writes if integrity risk | **< 15 min** |
| **SEV1** | High | Core workflow blocked for most users | Page on-call, rapid mitigation | **< 30 min** |
| **SEV2** | Medium | Partial degradation, limited user scope | Triage in working hours, mitigate within sprint | **< 4 hrs** |
| **SEV3** | Low | Non-critical failure, workaround exists | Track in backlog, fix when capacity allows | **< 3 business days** |
| **SEV4** | Info | Expected error path or validation feedback | Log for observability only | **N/A** |

**Guidance:**
- **SEV0/SEV1** require **incident response** and postmortem.
- **SEV2** should still have alerts if error rate spikes.
- **SEV3/SEV4** should include **clear user messaging** and actionable metadata for debugging.

## 2) Error Code Format

**Canonical format:**
```
<DOMAIN>-<CLASS>-<NUMBER>
```

- **DOMAIN:** Subsystem owner and traceability root.
- **CLASS:** Broad error category.
- **NUMBER:** Stable numeric identifier (000–999).

### Domains
| Domain | Subsystem Owner | Example Logs Prefix |
|---|---|---|
| **NAR** | Narrative Engine | `NAR-VAL-001` |
| **AUD** | Audio Engine | `AUD-DEP-004` |
| **MCP** | MCP Spine | `MCP-AUT-010` |
| **LST** | Listener Platform | `LST-ENT-003` |
| **PAY** | Payments | `PAY-INT-002` |
| **DB** | Data Layer | `DB-CON-005` |
| **OBS** | Observability | `OBS-LOG-001` |

### Classes
| Class | Category | Notes |
|---|---|---|
| **AUT** | Authorization/Auth | Missing scope, invalid token, forbidden | 
| **VAL** | Validation | Schema or contract failure | 
| **DEP** | Dependency | Missing canon dependency, DAG cycle, missing asset |
| **INT** | Integration | External API failure (Stripe, storage, auth provider) |
| **CON** | Consistency | Canon vs draft conflicts, data integrity issues |
| **STA** | State | Invalid state transitions (proposal lifecycle) |
| **RAT** | Rate Limit | Abuse safeguards, throttling |
| **NET** | Network | Timeouts, DNS, transient transport issues |
| **DAT** | Data | Serialization issues, migrations, storage corruption |
| **UNK** | Unknown | Unhandled exceptions (must be minimized) |

## 3) Standard Error Payload

When returning errors from APIs or tools, emit a structured payload with stable fields for traceability:

```json
{
  "code": "MCP-AUT-010",
  "severity": "SEV2",
  "owner": "mcp-spine",
  "message": "Missing tool scope: proposals.write",
  "user_message": "You do not have permission to submit proposals.",
  "retryable": false,
  "http_status": 403,
  "correlation_id": "req_01H...",
  "context": {
    "tool": "proposal.submit",
    "model": "opus",
    "scope": "proposals.write"
  }
}
```

**Required fields:** `code`, `severity`, `owner`, `message`, `retryable`, `correlation_id`.

## 4) MCP Spine Error Mapping

The MCP Spine must map tool failures to the unified taxonomy to ensure consistent reporting and audit logs.

| Scenario | Code | Severity | Owner | Notes |
|---|---|---|---|---|
| Missing tool scope | **MCP-AUT-010** | SEV2 | mcp-spine | Surface in tool response + audit log |
| Proposal schema invalid | **MCP-VAL-020** | SEV3 | mcp-spine | Include validation path list |
| Canon gate rejection | **MCP-CON-030** | SEV2 | narrative-engine | Block apply; report conflicts |
| Rate limited | **MCP-RAT-040** | SEV2 | mcp-spine | Include retry-after |
| Resource access denied | **MCP-AUT-011** | SEV2 | mcp-spine | Guarded resource check |
| Proposal lifecycle invalid | **MCP-STA-050** | SEV3 | mcp-spine | Invalid state transition |
| Tool internal error | **MCP-UNK-900** | SEV1 | mcp-spine | Investigate immediately |

## 5) Cross-Subsystem Examples

| Scenario | Code | Severity | Owner | Notes |
|---|---|---|---|---|
| DAG cycle detected | **NAR-DEP-003** | SEV1 | narrative-engine | Canon gate must block apply |
| Missing audio asset | **AUD-DEP-004** | SEV2 | audio-engine | Block publish release |
| Playback position update failure | **LST-DAT-006** | SEV2 | listener-platform | Retry on next session |
| Stripe webhook signature invalid | **PAY-AUT-002** | SEV1 | payments | Potential fraud or config error |
| Canon vs draft conflict | **NAR-CON-010** | SEV2 | narrative-engine | Surface in continuity report |
| Database migration failed | **DB-DAT-001** | SEV1 | data-layer | Halt deploy, rollback |

## 6) Ownership Rules

1. **Domain owns the error** unless explicitly tagged otherwise.
2. **Upstream callers** should not re-map codes, only append context.
3. **Downstream services** must preserve `correlation_id` and `proposal_id` (when applicable).
4. **Unknown errors** must be tagged **UNK** and create a backlog issue within 24 hours.

## 7) Logging + Alerting Expectations

- **Structured JSON logs** with `code`, `severity`, `owner`, `correlation_id`, `request_id`.
- **Alerting thresholds** for SEV0/SEV1 and elevated SEV2 error rates.
- **Audit logs** for proposal lifecycle transitions and canon gate decisions.

## 8) Change Control

Any new error code should:
1. Use the canonical format and domain mapping.
2. Be added to this document with example payloads.
3. Update tests to assert correct code and severity.
