CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'canon_status') THEN
    CREATE TYPE canon_status AS ENUM ('draft', 'proposed', 'canon');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'knowledge_certainty') THEN
    CREATE TYPE knowledge_certainty AS ENUM ('known', 'suspected', 'rumored', 'false');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'knowledge_source') THEN
    CREATE TYPE knowledge_source AS ENUM ('witnessed', 'told', 'inferred');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'promise_type') THEN
    CREATE TYPE promise_type AS ENUM ('plot_thread', 'mystery', 'character_arc', 'prophecy');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'promise_status') THEN
    CREATE TYPE promise_status AS ENUM ('pending', 'fulfilled', 'broken', 'transformed');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL,
  participants TEXT[] NOT NULL DEFAULT '{}',
  location TEXT,
  description TEXT NOT NULL,
  impacts JSONB NOT NULL DEFAULT '[]',
  canon_status canon_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_dependencies (
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE ON UPDATE CASCADE,
  depends_on_event_id UUID NOT NULL REFERENCES events(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  PRIMARY KEY (event_id, depends_on_event_id),
  CONSTRAINT event_dependencies_not_self CHECK (event_id <> depends_on_event_id)
);

CREATE TABLE IF NOT EXISTS knowledge_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  character_id TEXT NOT NULL,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  learned_at TIMESTAMPTZ NOT NULL,
  certainty knowledge_certainty NOT NULL,
  source knowledge_source NOT NULL,
  canon_status canon_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS promises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  type promise_type NOT NULL,
  established_in_scene TEXT NOT NULL,
  description TEXT NOT NULL,
  status promise_status NOT NULL,
  fulfilled_in_scene TEXT,
  canon_status canon_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION prevent_canon_mutation()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.canon_status = 'canon' THEN
    RAISE EXCEPTION 'Canonical records are immutable.';
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION prevent_event_dependency_mutation()
RETURNS TRIGGER AS $$
DECLARE
  target_event_id UUID;
  target_dep_id UUID;
  has_canon BOOLEAN;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_event_id := OLD.event_id;
    target_dep_id := OLD.depends_on_event_id;
  ELSE
    target_event_id := NEW.event_id;
    target_dep_id := NEW.depends_on_event_id;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM events
    WHERE id IN (target_event_id, target_dep_id)
      AND canon_status = 'canon'
  ) INTO has_canon;

  IF has_canon THEN
    RAISE EXCEPTION 'Cannot modify dependencies for canonical events.';
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS events_prevent_canon_mutation ON events;
CREATE TRIGGER events_prevent_canon_mutation
  BEFORE UPDATE OR DELETE ON events
  FOR EACH ROW
  EXECUTE FUNCTION prevent_canon_mutation();

DROP TRIGGER IF EXISTS knowledge_states_prevent_canon_mutation ON knowledge_states;
CREATE TRIGGER knowledge_states_prevent_canon_mutation
  BEFORE UPDATE OR DELETE ON knowledge_states
  FOR EACH ROW
  EXECUTE FUNCTION prevent_canon_mutation();

DROP TRIGGER IF EXISTS promises_prevent_canon_mutation ON promises;
CREATE TRIGGER promises_prevent_canon_mutation
  BEFORE UPDATE OR DELETE ON promises
  FOR EACH ROW
  EXECUTE FUNCTION prevent_canon_mutation();

DROP TRIGGER IF EXISTS event_dependencies_prevent_canon_mutation ON event_dependencies;
CREATE TRIGGER event_dependencies_prevent_canon_mutation
  BEFORE INSERT OR UPDATE OR DELETE ON event_dependencies
  FOR EACH ROW
  EXECUTE FUNCTION prevent_event_dependency_mutation();
