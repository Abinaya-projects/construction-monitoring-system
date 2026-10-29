-- BuildSight AI Database Schema (SQLite / PostgreSQL compatible)
-- Academic Project: Utilization of Images for Monitoring of Progress of Construction Activities

CREATE TABLE IF NOT EXISTS construction_stages (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    default_milestone_weight INTEGER NOT NULL,
    sequence_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(50) PRIMARY KEY,
    project_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    client_name VARCHAR(255),
    contractor_name VARCHAR(255),
    description TEXT,
    start_date DATE NOT NULL,
    expected_completion_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    current_estimated_progress INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS image_observations (
    id VARCHAR(50) PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_sha256 VARCHAR(64) NOT NULL,
    observation_date DATE NOT NULL,
    inspector_name VARCHAR(150) NOT NULL,
    location_tag VARCHAR(150),
    selected_category VARCHAR(50) NOT NULL,
    notes TEXT,
    has_mismatch_alert BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (selected_category) REFERENCES construction_stages(id)
);

CREATE TABLE IF NOT EXISTS ai_analyses (
    id VARCHAR(50) PRIMARY KEY,
    observation_id VARCHAR(50) NOT NULL UNIQUE,
    predicted_stage VARCHAR(50) NOT NULL,
    confidence_level VARCHAR(20) NOT NULL,
    confidence_explanation TEXT,
    visible_activities_json TEXT,
    observable_evidence_json TEXT,
    visible_materials_json TEXT,
    structural_elements_json TEXT,
    finishing_works_json TEXT,
    quality_observations_json TEXT,
    uncertainty_limitations_json TEXT,
    category_match BOOLEAN NOT NULL,
    mismatch_explanation TEXT,
    recommended_review_action TEXT,
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    model_version VARCHAR(100) NOT NULL,
    is_human_verified BOOLEAN DEFAULT FALSE,
    verified_by VARCHAR(150),
    verified_at TIMESTAMP,
    verification_notes TEXT,
    FOREIGN KEY (observation_id) REFERENCES image_observations(id) ON DELETE CASCADE,
    FOREIGN KEY (predicted_stage) REFERENCES construction_stages(id)
);

CREATE TABLE IF NOT EXISTS image_comparisons (
    id VARCHAR(50) PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL,
    baseline_observation_id VARCHAR(50) NOT NULL,
    target_observation_id VARCHAR(50) NOT NULL,
    elapsed_days INTEGER NOT NULL,
    viewpoint_consistency VARCHAR(50) NOT NULL,
    viewpoint_limitations TEXT,
    visible_changes_summary TEXT NOT NULL,
    newly_visible_elements_json TEXT,
    structural_progression_notes TEXT,
    estimated_progress_delta_percent INTEGER DEFAULT 0,
    progress_disclaimer TEXT,
    recommended_site_action TEXT,
    compared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (baseline_observation_id) REFERENCES image_observations(id),
    FOREIGN KEY (target_observation_id) REFERENCES image_observations(id)
);

CREATE TABLE IF NOT EXISTS review_alerts (
    id VARCHAR(50) PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL,
    observation_id VARCHAR(50) NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    selected_category VARCHAR(50) NOT NULL,
    predicted_category VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING_REVIEW',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    resolved_by VARCHAR(150),
    resolution_notes TEXT,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (observation_id) REFERENCES image_observations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS progress_reports (
    id VARCHAR(50) PRIMARY KEY,
    report_number VARCHAR(100) NOT NULL UNIQUE,
    project_id VARCHAR(50) NOT NULL,
    reporting_period_start DATE NOT NULL,
    reporting_period_end DATE NOT NULL,
    total_observations_in_period INTEGER NOT NULL,
    predominant_stage VARCHAR(50) NOT NULL,
    estimated_weighted_progress INTEGER NOT NULL,
    executive_summary TEXT NOT NULL,
    critical_observations_json TEXT,
    category_mismatches_count INTEGER DEFAULT 0,
    unresolved_alerts_count INTEGER DEFAULT 0,
    reviewer_notes TEXT,
    lead_engineer_signature VARCHAR(255),
    compliance_disclaimer TEXT NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_obs_project ON image_observations(project_id);
CREATE INDEX IF NOT EXISTS idx_obs_date ON image_observations(observation_date);
CREATE INDEX IF NOT EXISTS idx_obs_sha256 ON image_observations(file_sha256);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON review_alerts(status);
