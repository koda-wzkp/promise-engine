-- Add promise_schema_versions table for version tracking
CREATE TABLE IF NOT EXISTS promise_schema_versions (
    schema_id VARCHAR(100) NOT NULL,
    version INTEGER NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    commitment_type VARCHAR(100),
    stakes VARCHAR(20),
    schema_json JSONB NOT NULL,
    verification_type VARCHAR(50),
    verification_rules JSONB,
    change_summary TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (schema_id, version)
);

CREATE INDEX IF NOT EXISTS idx_schema_versions_id ON promise_schema_versions (schema_id);

-- Seed initial versions for all HB2021 schemas
INSERT INTO promise_schema_versions (schema_id, version, name, description, commitment_type, stakes, schema_json, verification_type, verification_rules, change_summary, created_at)
SELECT id, version, name, description, commitment_type, stakes, schema_json, verification_type, verification_rules, 'Initial version', created_at
FROM promise_schemas
WHERE vertical = 'hb2021'
ON CONFLICT (schema_id, version) DO NOTHING;
