-- Add unique constraint to meeting_id column if not already exists
ALTER TABLE meetings ADD CONSTRAINT uk_meetings_meeting_id UNIQUE (meeting_id);

-- Create index for faster lookups by meeting_id
CREATE INDEX IF NOT EXISTS idx_meetings_meeting_id ON meetings(meeting_id);

-- Create index for status-based queries
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);

-- Create index for upcoming meetings queries
CREATE INDEX IF NOT EXISTS idx_meetings_start_time ON meetings(start_time);

-- Create index for user meetings queries
CREATE INDEX IF NOT EXISTS idx_meetings_host_id ON meetings(host_id);
