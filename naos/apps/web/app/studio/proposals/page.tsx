"use client";

import { useEffect, useState } from "react";

type Proposal = {
  id: string;
  projectId: string;
  sceneId: string;
  baseSha256: string | null;
  isApproved: boolean;
  isApplied: boolean;
  createdAt: string;
};

export default function ProposalsPage() {
  const projectId = "uncharted-stars";
  const [rows, setRows] = useState<Proposal[]>([]);
  const [status, setStatus] = useState("");

  async function refresh() {
    const res = await fetch(`/api/proposals?projectId=${projectId}`);
    const data = await res.json();
    if (!data.ok) {
      setStatus(`Error: ${JSON.stringify(data.error)}`);
      return;
    }
    setRows(data.proposals);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function approve(proposalId: string) {
    setStatus(`Approving ${proposalId}...`);
    const res = await fetch(`/api/proposals/${proposalId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approver: "creator", note: "Approved in Studio" })
    });
    const data = await res.json();
    if (!data.ok) {
      setStatus(`Error: ${JSON.stringify(data.error)}`);
      return;
    }
    setStatus(`Applied. New SHA: ${data.newSha256}`);
    await refresh();
  }

  return (
    <div style={{ padding: 16, fontFamily: "system-ui" }}>
      <h2>Studio · Proposals</h2>
      <div style={{ marginBottom: 12, opacity: 0.85 }}>{status}</div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left" }}>
            <th style={{ borderBottom: "1px solid #ddd", padding: 8 }}>ID</th>
            <th style={{ borderBottom: "1px solid #ddd", padding: 8 }}>Scene</th>
            <th style={{ borderBottom: "1px solid #ddd", padding: 8 }}>
              Approved
            </th>
            <th style={{ borderBottom: "1px solid #ddd", padding: 8 }}>
              Applied
            </th>
            <th style={{ borderBottom: "1px solid #ddd", padding: 8 }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id}>
              <td
                style={{
                  borderBottom: "1px solid #eee",
                  padding: 8,
                  fontFamily: "ui-monospace"
                }}
              >
                {p.id.slice(0, 8)}…
              </td>
              <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                {p.sceneId}
              </td>
              <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                {String(p.isApproved)}
              </td>
              <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                {String(p.isApplied)}
              </td>
              <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                <button
                  disabled={p.isApplied}
                  onClick={() => approve(p.id)}
                  style={{ padding: "6px 10px" }}
                >
                  Approve + Apply
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 12 }}>
        <a href="/studio/scenes/act_01_discovery%2Fch_01_elara_scene_01.md">
          Back to sample scene
        </a>
      </div>
    </div>
  );
}
