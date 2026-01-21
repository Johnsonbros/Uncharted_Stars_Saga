# Automation Workflow (Foundation Acceleration)

This document defines the automation entry point for turning `SYSTEM_TODO.md` into
structured work artifacts (JSON + reports). It is meant to be the first step in
automating the remaining foundation requirements.

## What the Script Does

- Parses `SYSTEM_TODO.md` for checklist items.
- Emits a JSON file containing each item with status, section path, and line
  number.
- Emits a Markdown report summarizing open items grouped by section.

## How to Run

```bash
python3 tools/automation/parse_system_todo.py
```

### Optional Arguments

- `--input` (default: `SYSTEM_TODO.md`)
- `--json-out` (default: `automation/system_todo.json`)
- `--report-out` (default: `automation/system_todo_report.md`)

Example:

```bash
python3 tools/automation/parse_system_todo.py \
  --json-out automation/system_todo.json \
  --report-out automation/system_todo_report.md
```

## Next Automation Steps (Planned)

1. Use the JSON output to generate task cards and owner assignments.
2. Generate diagram/playbook stubs for any open items with a matching template.
3. Enforce checklist alignment in CI (fail builds if required tasks lack tests).
