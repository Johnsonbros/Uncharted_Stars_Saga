#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List


CHECKBOX_RE = re.compile(r"^- \[(?P<status>[ x~])\] (?P<text>.+)")
HEADING_RE = re.compile(r"^(?P<level>#{1,6}) (?P<title>.+)")


@dataclass
class TodoItem:
    status: str
    text: str
    section_path: str
    line_number: int

    def as_dict(self) -> Dict[str, str]:
        return {
            "status": self.status,
            "text": self.text,
            "section_path": self.section_path,
            "line_number": self.line_number,
        }


def parse_system_todo(lines: Iterable[str]) -> List[TodoItem]:
    headings: Dict[int, str] = {}
    items: List[TodoItem] = []
    in_code_block = False

    for idx, raw_line in enumerate(lines, start=1):
        line = raw_line.rstrip("\n")
        if line.strip().startswith("```"):
            in_code_block = not in_code_block
            continue
        if in_code_block:
            continue

        heading_match = HEADING_RE.match(line)
        if heading_match:
            level = len(heading_match.group("level"))
            headings[level] = heading_match.group("title").strip()
            for deeper in range(level + 1, 7):
                headings.pop(deeper, None)
            continue

        checkbox_match = CHECKBOX_RE.match(line)
        if checkbox_match:
            status = checkbox_match.group("status")
            text = checkbox_match.group("text").strip()
            section_path = " > ".join(
                headings[level]
                for level in sorted(headings)
                if level >= 2
            )
            items.append(
                TodoItem(
                    status=status,
                    text=text,
                    section_path=section_path,
                    line_number=idx,
                )
            )

    return items


def build_report(items: List[TodoItem]) -> str:
    total = len(items)
    complete = sum(1 for item in items if item.status == "x")
    in_progress = sum(1 for item in items if item.status == "~")
    open_items = [item for item in items if item.status == " "]

    lines = [
        "# System TODO Automation Report",
        "",
        "## Summary",
        f"- Total checklist items: {total}",
        f"- Complete: {complete}",
        f"- In progress: {in_progress}",
        f"- Open: {len(open_items)}",
        "",
        "## Open Items by Section",
        "",
    ]

    grouped: Dict[str, List[TodoItem]] = {}
    for item in open_items:
        grouped.setdefault(item.section_path or "Uncategorized", []).append(item)

    for section in sorted(grouped):
        lines.append(f"### {section}")
        for item in grouped[section]:
            lines.append(f"- {item.text} (line {item.line_number})")
        lines.append("")

    return "\n".join(lines).rstrip() + "\n"


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Parse SYSTEM_TODO.md into structured JSON and summary report."
    )
    parser.add_argument(
        "--input",
        default="SYSTEM_TODO.md",
        help="Path to SYSTEM_TODO.md",
    )
    parser.add_argument(
        "--json-out",
        default="automation/system_todo.json",
        help="Path to write JSON output",
    )
    parser.add_argument(
        "--report-out",
        default="automation/system_todo_report.md",
        help="Path to write markdown report",
    )
    args = parser.parse_args()

    input_path = Path(args.input)
    items = parse_system_todo(input_path.read_text(encoding="utf-8").splitlines())

    json_path = Path(args.json_out)
    json_path.parent.mkdir(parents=True, exist_ok=True)
    json_path.write_text(
        json.dumps([item.as_dict() for item in items], indent=2),
        encoding="utf-8",
    )

    report_path = Path(args.report_out)
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(build_report(items), encoding="utf-8")

    print(f"Wrote {len(items)} items to {json_path}")
    print(f"Wrote report to {report_path}")


if __name__ == "__main__":
    main()
