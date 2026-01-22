DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listener_status') THEN
    CREATE TYPE listener_status AS ENUM ('pending', 'active', 'deleted');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'entitlement_status') THEN
    CREATE TYPE entitlement_status AS ENUM ('active', 'expired', 'revoked');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS listeners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  status listener_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listener_id UUID NOT NULL REFERENCES listeners(id) ON DELETE CASCADE ON UPDATE CASCADE,
  product_id TEXT NOT NULL,
  access_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  access_end TIMESTAMPTZ,
  status entitlement_status NOT NULL DEFAULT 'active',
  stripe_payment_intent_id TEXT,
  stripe_event_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS playback_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listener_id UUID NOT NULL REFERENCES listeners(id) ON DELETE CASCADE ON UPDATE CASCADE,
  asset_id TEXT NOT NULL,
  position_seconds INTEGER NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT playback_positions_unique_listener_asset UNIQUE (listener_id, asset_id)
);

CREATE TABLE IF NOT EXISTS stripe_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
