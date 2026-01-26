-- Add columns for source tracking
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS source_channel TEXT,
ADD COLUMN IF NOT EXISTS campaign_tag TEXT;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_applications_source_channel ON applications(source_channel);
CREATE INDEX IF NOT EXISTS idx_applications_campaign_tag ON applications(campaign_tag);
