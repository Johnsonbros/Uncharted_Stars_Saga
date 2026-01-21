-- Audio Storage schema snapshot for Data Layer alignment
-- Object storage metadata registry for audio assets

CREATE TYPE audio_asset_type AS ENUM ('master', 'stream', 'preview', 'stems', 'transcript');

CREATE TABLE audio_assets (
  id UUID PRIMARY KEY,
  series_id TEXT NOT NULL,
  season_number INTEGER NOT NULL,
  episode_number INTEGER NOT NULL,
  scene_id TEXT NOT NULL,
  scene_version TEXT NOT NULL,
  asset_type audio_asset_type NOT NULL,
  storage_path TEXT NOT NULL,
  codec TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  bitrate_kbps INTEGER NOT NULL,
  sample_rate_hz INTEGER NOT NULL,
  checksum_sha256 TEXT NOT NULL,
  content_size_bytes BIGINT NOT NULL,
  provenance_source TEXT NOT NULL,
  provenance_pipeline TEXT NOT NULL,
  provenance_model TEXT,
  provenance_input TEXT,
  provenance_commit TEXT,
  language_tag TEXT,
  loudness_lufs NUMERIC(5,2),
  true_peak_db NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  UNIQUE (series_id, season_number, episode_number, scene_id, scene_version, asset_type)
);

CREATE INDEX audio_assets_scene_idx
  ON audio_assets (series_id, season_number, episode_number, scene_id);

CREATE INDEX audio_assets_storage_path_idx
  ON audio_assets (storage_path);
