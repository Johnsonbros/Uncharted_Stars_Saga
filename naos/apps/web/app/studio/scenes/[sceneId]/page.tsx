"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

export default function ScenePage() {
  const params = useParams<{ sceneId: string }>();
  const scenePath = decodeURIComponent(params.sceneId ?? "");
  const projectId = "uncharted-stars";

  const [content, setContent] = useState("");
  const [sha, setSha] = useState("");
  const [proposalText, setProposalText] = useState("");
  const [rationale, setRationale] = useState("");
  const [status, setStatus] = useState<string>("");

  const sceneUrl = useMemo(
    () => `/api/scenes/${encodeURIComponent(scenePath)}?projectId=${projectId}`,
    [scenePath]
  );

  useEffect(() => {
    (async () => {
      const res = await fetch(sceneUrl);
      const data = await res.json();
      if (!data.ok) {
        setStatus(`Error: ${data.error}`);
        return;
      }
      setContent(data.content);
      setProposalText(data.content);
      setSha(data.sha256);
    })();
  }, [sceneUrl]);

  async function createProposal() {
    setStatus("Creating proposal...");
    const res = await fetch("/api/proposals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        scenePath,
        proposedContent: proposalText,
        rationale
      })
    });
    const data = await res.json();
    if (!data.ok) {
      setStatus(`Error: ${JSON.stringify(data.error)}`);
      return;
    }
    setStatus(`Proposal created: ${data.proposal.id}`);
  }

  return (
    <div style={{ padding: 16, fontFamily: "system-ui" }}>
      <h2>Studio · Scene</h2>
      <div style={{ opacity: 0.8, marginBottom: 8 }}>
        <div>
          <b>Project:</b> {projectId}
        </div>
        <div>
          <b>Scene file:</b> narrative/{scenePath}
        </div>
        <div>
          <b>SHA:</b> {sha}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <h3>Current</h3>
          <textarea
            value={content}
            readOnly
            style={{
              width: "100%",
              height: 520,
              fontFamily: "ui-monospace",
              fontSize: 12
            }}
          />
        </div>

        <div>
          <h3>Proposed</h3>
          <textarea
            value={proposalText}
            onChange={(e) => setProposalText(e.target.value)}
            style={{
              width: "100%",
              height: 520,
              fontFamily: "ui-monospace",
              fontSize: 12
            }}
          />

          <div style={{ marginTop: 8 }}>
            <label style={{ display: "block", marginBottom: 6 }}>
              Rationale (optional)
            </label>
            <input
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              style={{ width: "100%", padding: 8 }}
            />
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <button onClick={createProposal} style={{ padding: "8px 12px" }}>
              Create Proposal
            </button>
            <a href="/studio/proposals" style={{ padding: "8px 12px" }}>
              View Proposals
            </a>
          </div>

          <div style={{ marginTop: 10, opacity: 0.85 }}>{status}</div>
        </div>
      </div>
    </div>
  );
}
