-- Create lists table
CREATE TABLE IF NOT EXISTS lists (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lists_created_at ON lists(created_at);
CREATE INDEX IF NOT EXISTS idx_lists_name ON lists(name);
