CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  scene_id TEXT NOT NULL,
  scene_path TEXT NOT NULL,
  base_sha256 TEXT,
  proposed_content TEXT NOT NULL,
  rationale TEXT DEFAULT '',
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  is_applied BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  applied_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE ON UPDATE CASCADE,
  approver TEXT NOT NULL DEFAULT 'creator',
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
