ALTER TYPE approval_status ADD VALUE IF NOT EXISTS 'change_requested';

ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS comments TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS user_role VARCHAR(50);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS resulting_status VARCHAR(50);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS approval_level INTEGER;

CREATE TABLE IF NOT EXISTS change_requests (
    id SERIAL PRIMARY KEY,
    cost_sheet_id INTEGER NOT NULL REFERENCES cost_sheets(id) ON DELETE CASCADE,
    requested_by INTEGER NOT NULL REFERENCES users(id),
    requested_by_role VARCHAR(50) NOT NULL,
    request_type VARCHAR(50) NOT NULL,
    affected_fields TEXT[],
    change_reason TEXT NOT NULL,
    detailed_comments TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'pending',
    resolved_by INTEGER REFERENCES users(id),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_change_requests_cost_sheet ON change_requests(cost_sheet_id);
CREATE INDEX IF NOT EXISTS idx_change_requests_status ON change_requests(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_cost_sheet_created ON audit_logs(cost_sheet_id, created_at DESC);
