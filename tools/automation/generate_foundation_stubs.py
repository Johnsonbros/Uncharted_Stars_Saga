#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path
from typing import List

from parse_system_todo import parse_system_todo


DIAGRAM_KEYWORDS = ("diagram", "flowchart", "ERD", "schema")
PLAYBOOK_KEYWORDS = ("playbook", "playbooks")


def write_stub(path: Path, title: str, items: List[str], template: str) -> None:
    lines = [f"# {title}", ""]
    if not items:
        lines.append("No open items matched this category.")
    else:
        for item in items:
            lines.append(f"## {item}")
            lines.append("")
            lines.extend(template.strip().splitlines())
            lines.append("")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate stub queues for diagrams and playbooks from SYSTEM_TODO.md"
    )
    parser.add_argument(
        "--input",
        default="SYSTEM_TODO.md",
        help="Path to SYSTEM_TODO.md",
    )
    parser.add_argument(
        "--out-dir",
        default="automation",
        help="Output directory for stub queues",
    )
    args = parser.parse_args()

    input_path = Path(args.input)
    items = parse_system_todo(input_path.read_text(encoding="utf-8").splitlines())
    open_items = [item for item in items if item.status == " "]

    diagram_items = [
        item.text for item in open_items if any(k.lower() in item.text.lower() for k in DIAGRAM_KEYWORDS)
    ]
    playbook_items = [
        item.text for item in open_items if any(k.lower() in item.text.lower() for k in PLAYBOOK_KEYWORDS)
    ]

    out_dir = Path(args.out_dir)
    write_stub(
        out_dir / "diagram_stub_queue.md",
        "Diagram Stub Queue",
        diagram_items,
        template="""
```mermaid
%% TODO: Replace with final diagram.
flowchart TD
  A[Placeholder] --> B[Placeholder]
```
""",
    )
    write_stub(
        out_dir / "playbook_stub_queue.md",
        "Playbook Stub Queue",
        playbook_items,
        template="""
### Objective
- TODO

### Inputs
- TODO

### Steps
1. TODO

### Escalation
- TODO
""",
    )

    print(f"Wrote stubs to {out_dir.resolve()}")


if __name__ == "__main__":
    main()
