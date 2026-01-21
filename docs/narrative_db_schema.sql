-- Narrative DB schema snapshot for Narrative Engine alignment
-- Canonical narrative state (events, knowledge states, promises)

CREATE TYPE canon_status AS ENUM ('draft', 'proposed', 'canon');
CREATE TYPE knowledge_certainty AS ENUM ('known', 'suspected', 'rumored', 'false');
CREATE TYPE knowledge_source AS ENUM ('witnessed', 'told', 'inferred');
CREATE TYPE promise_type AS ENUM ('plot_thread', 'mystery', 'character_arc', 'prophecy');
CREATE TYPE promise_status AS ENUM ('pending', 'fulfilled', 'broken', 'transformed');

CREATE TABLE events (
  id UUID PRIMARY KEY,
  project_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL,
  participants TEXT[] NOT NULL,
  location TEXT,
  description TEXT NOT NULL,
  impacts JSONB NOT NULL,
  canon_status canon_status NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE event_dependencies (
  event_id UUID NOT NULL REFERENCES events(id),
  depends_on_event_id UUID NOT NULL REFERENCES events(id),
  PRIMARY KEY (event_id, depends_on_event_id),
  CONSTRAINT event_dependencies_not_self CHECK (event_id <> depends_on_event_id)
);

CREATE TABLE knowledge_states (
  id UUID PRIMARY KEY,
  project_id TEXT NOT NULL,
  character_id TEXT NOT NULL,
  event_id UUID NOT NULL REFERENCES events(id),
  learned_at TIMESTAMPTZ NOT NULL,
  certainty knowledge_certainty NOT NULL,
  source knowledge_source NOT NULL,
  canon_status canon_status NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE promises (
  id UUID PRIMARY KEY,
  project_id TEXT NOT NULL,
  type promise_type NOT NULL,
  established_in_scene TEXT NOT NULL,
  description TEXT NOT NULL,
  status promise_status NOT NULL,
  fulfilled_in_scene TEXT,
  canon_status canon_status NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
