-- Promise Data Pipeline — Database Schema (Supabase/PostgreSQL)
-- Run this against your Supabase project to initialize all tables.

-- Core tables

CREATE TABLE IF NOT EXISTS sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    url TEXT,
    last_fetched_at TIMESTAMPTZ,
    checksum TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS networks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES sources(id),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    source_type TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    network_id UUID REFERENCES networks(id) ON DELETE CASCADE,
    external_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    short TEXT,
    metadata JSONB,
    UNIQUE(network_id, external_id)
);

CREATE TABLE IF NOT EXISTS promises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    network_id UUID REFERENCES networks(id) ON DELETE CASCADE,
    external_id TEXT NOT NULL,
    ref TEXT,
    promiser_id UUID REFERENCES agents(id),
    promisee_id UUID REFERENCES agents(id),
    body TEXT NOT NULL,
    domain TEXT NOT NULL,
    status TEXT NOT NULL,
    target TIMESTAMPTZ,
    progress FLOAT,
    required FLOAT,
    note TEXT,
    polarity TEXT DEFAULT '+',
    scope TEXT,
    origin TEXT DEFAULT 'imposed',
    verification_method TEXT NOT NULL,
    verification_source TEXT,
    verification_metric TEXT,
    verification_frequency TEXT,
    source_raw JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(network_id, external_id)
);

CREATE TABLE IF NOT EXISTS dependency_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    network_id UUID REFERENCES networks(id) ON DELETE CASCADE,
    source_promise_id UUID REFERENCES promises(id) ON DELETE CASCADE,
    target_promise_id UUID REFERENCES promises(id) ON DELETE CASCADE,
    edge_type TEXT NOT NULL,
    weight FLOAT DEFAULT 1.0,
    metadata JSONB,
    UNIQUE(source_promise_id, target_promise_id, edge_type)
);

-- Time series (Paper III requirement)

CREATE TABLE IF NOT EXISTS promise_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promise_id UUID REFERENCES promises(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    progress FLOAT,
    snapshot_date TIMESTAMPTZ NOT NULL,
    source_document TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Analysis results (Papers I-VI)

CREATE TABLE IF NOT EXISTS network_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    network_id UUID REFERENCES networks(id) ON DELETE CASCADE,
    analysis_type TEXT NOT NULL,
    results JSONB NOT NULL,
    parameters JSONB,
    computed_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(network_id, analysis_type, computed_at)
);

-- ML predictions

CREATE TABLE IF NOT EXISTS predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promise_id UUID REFERENCES promises(id) ON DELETE CASCADE,
    model_version TEXT NOT NULL,
    predicted_status TEXT NOT NULL,
    confidence FLOAT NOT NULL,
    features JSONB,
    predicted_at TIMESTAMPTZ DEFAULT now()
);

-- API metering

CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_hash TEXT UNIQUE NOT NULL,
    owner TEXT NOT NULL,
    tier TEXT NOT NULL DEFAULT 'free',
    rate_limit_per_hour INT DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS api_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key_id UUID REFERENCES api_keys(id),
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    status_code INT,
    response_time_ms INT,
    called_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes

CREATE INDEX IF NOT EXISTS idx_promises_network ON promises(network_id);
CREATE INDEX IF NOT EXISTS idx_promises_status ON promises(status);
CREATE INDEX IF NOT EXISTS idx_promises_domain ON promises(domain);
CREATE INDEX IF NOT EXISTS idx_snapshots_promise ON promise_snapshots(promise_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_date ON promise_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_edges_network ON dependency_edges(network_id);
CREATE INDEX IF NOT EXISTS idx_analysis_network ON network_analysis(network_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_key ON api_usage(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_time ON api_usage(called_at);
