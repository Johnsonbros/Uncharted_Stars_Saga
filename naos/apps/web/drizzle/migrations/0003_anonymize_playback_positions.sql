ALTER TABLE playback_positions
  ALTER COLUMN listener_id DROP NOT NULL;

ALTER TABLE playback_positions
  DROP CONSTRAINT IF EXISTS playback_positions_listener_id_fkey,
  ADD CONSTRAINT playback_positions_listener_id_fkey
    FOREIGN KEY (listener_id) REFERENCES listeners(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE;
