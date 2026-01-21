"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

function countWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

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

  const currentWordCount = useMemo(() => countWords(content), [content]);
  const proposedWordCount = useMemo(() => countWords(proposalText), [proposalText]);

  return (
    <section className="studio-section">
      <div className="studio-card">
        <div className="studio-card-header">
          <div>
            <h2>Scene editor</h2>
            <p className="muted">
              Adjust the scene with confidence. Every proposal is reviewed before it becomes canon.
            </p>
          </div>
          <span className="studio-pill">SHA • {sha || "Loading"}</span>
        </div>

        <div className="studio-status-banner">{status || "Ready to edit."}</div>

        <div className="studio-meta-row">
          <div>
            <span className="muted">Project</span>
            <strong>{projectId}</strong>
          </div>
          <div>
            <span className="muted">Scene file</span>
            <strong>narrative/{scenePath}</strong>
          </div>
          <div>
            <span className="muted">Word count</span>
            <strong>
              {currentWordCount} → {proposedWordCount}
            </strong>
          </div>
        </div>

        <div className="studio-grid two">
          <div>
            <h3>Current</h3>
            <textarea className="studio-textarea" value={content} readOnly />
          </div>

          <div>
            <h3>Proposed (live)</h3>
            <textarea
              className="studio-textarea"
              value={proposalText}
              onChange={(event) => setProposalText(event.target.value)}
            />

            <label className="studio-field">
              Why are you changing this?
              <input
                value={rationale}
                onChange={(event) => setRationale(event.target.value)}
                placeholder="Optional context for your future self"
              />
            </label>

            <div className="studio-actions">
              <button className="button" onClick={createProposal}>
                Create proposal
              </button>
              <a className="button secondary" href="/studio/proposals">
                View proposals
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
