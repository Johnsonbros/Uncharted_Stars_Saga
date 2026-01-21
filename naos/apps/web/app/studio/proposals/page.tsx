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
  const [lastSync, setLastSync] = useState("just now");

  async function refresh() {
    const res = await fetch(`/api/proposals?projectId=${projectId}`);
    const data = await res.json();
    if (!data.ok) {
      setStatus(`Error: ${JSON.stringify(data.error)}`);
      return;
    }
    setRows(data.proposals);
    setLastSync(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
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
    <section className="studio-section">
      <div className="studio-card">
        <div className="studio-card-header">
          <div>
            <h2>AI proposals</h2>
            <p className="muted">
              Review AI-suggested edits before they touch your canon. Approving applies the update
              instantly.
            </p>
          </div>
          <span className="studio-pill">Last synced • {lastSync}</span>
        </div>

        <div className="studio-status-banner">{status || "Ready to review."}</div>

        <div className="studio-table-wrapper">
          <table className="studio-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Scene</th>
                <th>Approved</th>
                <th>Applied</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((proposal) => (
                <tr key={proposal.id}>
                  <td className="mono">{proposal.id.slice(0, 8)}…</td>
                  <td>{proposal.sceneId}</td>
                  <td>{proposal.isApproved ? "Yes" : "No"}</td>
                  <td>{proposal.isApplied ? "Yes" : "No"}</td>
                  <td>
                    <button
                      className="button secondary"
                      disabled={proposal.isApplied}
                      onClick={() => approve(proposal.id)}
                    >
                      Approve & apply
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="muted">
                    No proposals yet. Create one from a scene draft.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
