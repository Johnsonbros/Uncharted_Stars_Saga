# Systematic Evaluation & Reduction Framework

> **Purpose:** Provide a repeatable method to evaluate every system, workflow, and artifact in NAOS, then reduce complexity and risk through prioritized action.
> **Status:** Foundation Phase – applies to all subsystems (Creator OS, Listener Platform, MCP Spine, Data Layer).

---

## 1) Goals

1. **Surface risk early** (canon integrity, payments, listener experience).
2. **Reduce complexity** by eliminating redundant or low-value components.
3. **Establish a measurable baseline** for system health.
4. **Create a repeatable cadence** for continuous improvement.

---

## 2) Scope & Inputs

### 2.1 In-Scope Systems
- **Creator OS** (Narrative Engine, Audio Engine)
- **MCP Spine** (Resources/Tools/Prompts)
- **Listener Platform** (marketing, auth, player)
- **Data Layer** (PostgreSQL + object storage)
- **Observability & Error Handling**

### 2.2 Required Inputs
- **SYSTEM_TODO.md** (checklists + tests + diagrams)
- **ARCHITECTURE.md** (design intent)
- **TESTING_STRATEGY.md** (coverage expectations)
- **Process docs** in `/docs` (workflow and governance)

---

## 3) Evaluation Cadence

- **Weekly:** fast review of critical paths (payments, canon gates, auth).
- **Monthly:** subsystem audit (Narrative, Audio, MCP, Listener).
- **Quarterly:** full system reduction pass.

---

## 4) Evaluation Framework

Each component is scored on five axes (1–5 scale, higher is better).

| Axis | Description | Example Evidence |
|------|-------------|------------------|
| **Reliability** | Consistent behavior under expected load | Test pass rate, error rate |
| **Integrity** | Canon/payment correctness, immutability | Gate tests, audit logs |
| **Complexity** | Simplicity of implementation | # modules, dependencies, glue code |
| **Observability** | Ability to trace/diagnose | Logs, trace IDs, dashboards |
| **User Value** | Impact on creator/listener experience | Usage metrics, feedback |

### 4.1 Score Interpretation
- **5:** Exemplary, no action needed
- **4:** Good, minor improvements
- **3:** Acceptable, plan improvements
- **2:** Risky, prioritize reductions/fixes
- **1:** Critical, immediate remediation

---

## 5) Reduction Playbook

Use the following sequence to simplify and de-risk:

1. **Stop/Defer** — Remove work that is not aligned with Phase goals.
2. **Simplify** — Replace custom logic with existing patterns or fewer steps.
3. **Consolidate** — Merge duplicated flows or overlapping responsibilities.
4. **Isolate** — Reduce blast radius by narrowing scope or permissions.
5. **Automate** — Add tests or checks that prevent regressions.

---

## 6) Systematic Evaluation Procedure

### Step 1: Inventory
- Enumerate components, routes, workflows, and data stores.
- Confirm ownership (Creator OS, Listener Platform, MCP Spine, Data Layer).

### Step 2: Evidence Collection
- Test results and coverage
- Error logs and incident history
- Performance observations
- User-facing outcomes (creator + listener)

### Step 3: Scoring
- Score each component on the five axes.
- Record evidence for each score.

### Step 4: Action Mapping
Map scores to actions:
- **Scores 4–5:** Maintain + monitor
- **Score 3:** Plan improvements next sprint
- **Scores 1–2:** Prioritize reduction and remediation

### Step 5: Reduction Plan
- Identify quick wins vs. architectural work
- Assign owners and dates
- Update SYSTEM_TODO.md with traceable tasks

---

## 7) Deliverables

### 7.1 Evaluation Report (Required)
For each subsystem:
- Inventory list
- Scorecard
- Key risks
- Reduction plan

### 7.2 Reduction Backlog (Required)
- Tasks prioritized by impact and effort
- Linked to SYSTEM_TODO.md entries
- Tests or checks required to lock in improvements

---

## 8) Templates

### 8.1 Scorecard Template
```
Subsystem: [Narrative Engine]
Date: [YYYY-MM-DD]
Owner: [Name]

Reliability: [1-5] Evidence: [tests, incidents]
Integrity:  [1-5] Evidence: [canon gates, audits]
Complexity: [1-5] Evidence: [modules, coupling]
Observability:[1-5] Evidence: [logs, trace IDs]
User Value: [1-5] Evidence: [usage, feedback]

Top Risks:
- [Risk 1]
- [Risk 2]

Reduction Actions:
- [Action 1]
- [Action 2]
```

### 8.2 Reduction Task Template
```
Task: [Short title]
Subsystem: [Narrative/Audio/MCP/Listener/Data]
Impact: [High/Med/Low]
Effort: [High/Med/Low]
Risk Reduced: [Canon/Payments/Availability/etc]
Evidence: [Tests/Logs/Docs]
Definition of Done:
- [ ] Change implemented
- [ ] Tests added/updated
- [ ] Docs updated
```

---

## 9) Acceptance Criteria

A subsystem passes evaluation when:
- All critical paths score **>= 4**
- There is **traceability** from reduction tasks to SYSTEM_TODO.md
- Tests exist for any new or modified critical behavior

---

## 10) Next Steps (Phase 1)

1. Run baseline scorecards for each subsystem.
2. Populate a reduction backlog based on the scorecards.
3. Align changes with SYSTEM_TODO.md and testing strategy.
4. Re-run evaluation after each major milestone.

---

## 11) References

- `SYSTEM_TODO.md`
- `ARCHITECTURE.md`
- `TESTING_STRATEGY.md`
- `/docs` process files
