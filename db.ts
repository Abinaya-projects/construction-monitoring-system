/**
 * SQLite Database Manager for BuildSight AI
 * Uses Node 22 native node:sqlite (DatabaseSync) on buildsight_academic.db
 * Provides persistent relational storage matching Spring Boot schema.sql
 */

import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Project, ImageObservation, AIAnalysisResult, ReviewAlert, ProgressReport, ImageComparisonResult } from './src/types';
import { INITIAL_PROJECTS, INITIAL_OBSERVATIONS, INITIAL_ALERTS, INITIAL_REPORTS } from './src/data/mockData';
import { CONSTRUCTION_STAGES } from './src/constants/stages';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'buildsight_academic.db');
const UPLOAD_DIR = path.join(__dirname, 'uploads', 'observations');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const db = new DatabaseSync(DB_PATH);

// Initialize Tables
export function initDatabase() {
  const schemaPath = path.join(__dirname, 'backend', 'src', 'main', 'resources', 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schemaSql);
  }

  // Safe migrations for newly added audit columns
  try {
    db.exec('ALTER TABLE image_observations ADD COLUMN original_category VARCHAR(50);');
  } catch {}
  try {
    db.exec('ALTER TABLE image_observations ADD COLUMN correction_history_json TEXT;');
  } catch {}

  // Ensure stages are populated
  const stageCountStmt = db.prepare('SELECT COUNT(*) as count FROM construction_stages');
  const stageCount = (stageCountStmt.get() as any).count;
  if (stageCount === 0) {
    const insertStageStmt = db.prepare(`
      INSERT INTO construction_stages (id, code, name, description, default_milestone_weight, sequence_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const stage of CONSTRUCTION_STAGES) {
      insertStageStmt.run(stage.id, stage.code, stage.name, stage.description, stage.defaultMilestoneWeight, stage.sequenceOrder);
    }
  }

  // Seed benchmark demo data if database is empty
  const projCountStmt = db.prepare('SELECT COUNT(*) as count FROM projects');
  const projCount = (projCountStmt.get() as any).count;
  if (projCount === 0) {
    seedBenchmarkData();
  }
}

export function seedBenchmarkData() {
  const insertProjectStmt = db.prepare(`
    INSERT INTO projects (id, project_code, name, location, client_name, contractor_name, description, start_date, expected_completion_date, status, current_estimated_progress, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const p of INITIAL_PROJECTS) {
    insertProjectStmt.run(
      p.id,
      p.projectCode,
      p.name,
      p.location,
      p.clientName,
      p.contractorName,
      p.description,
      p.startDate,
      p.expectedCompletionDate,
      p.status,
      p.currentEstimatedProgress,
      p.createdAt,
      p.updatedAt
    );
  }

  const insertObsStmt = db.prepare(`
    INSERT INTO image_observations (id, project_id, file_name, file_path, file_size_bytes, mime_type, file_sha256, observation_date, inspector_name, location_tag, selected_category, notes, has_mismatch_alert, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertAnalysisStmt = db.prepare(`
    INSERT INTO ai_analyses (id, observation_id, predicted_stage, confidence_level, confidence_explanation, visible_activities_json, observable_evidence_json, visible_materials_json, structural_elements_json, finishing_works_json, quality_observations_json, uncertainty_limitations_json, category_match, mismatch_explanation, recommended_review_action, model_version, is_human_verified, verified_by, verified_at, verification_notes, analyzed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const o of INITIAL_OBSERVATIONS) {
    insertObsStmt.run(
      o.id,
      o.projectId,
      o.fileName,
      o.imageUrl,
      o.fileSizeBytes,
      o.mimeType,
      o.fileSha256,
      o.observationDate,
      o.inspectorName,
      o.locationTag || '',
      o.selectedCategory,
      o.notes || '',
      o.hasMismatchAlert ? 1 : 0,
      o.createdAt
    );

    if (o.analysis) {
      const a = o.analysis;
      insertAnalysisStmt.run(
        a.id,
        a.observationId,
        a.predictedStage,
        a.confidenceLevel,
        a.confidenceExplanation,
        JSON.stringify(a.visibleActivities),
        JSON.stringify(a.observableEvidence),
        JSON.stringify(a.visibleMaterials),
        JSON.stringify(a.structuralElements),
        JSON.stringify(a.finishingWorks),
        JSON.stringify(a.imageQualityObservations),
        JSON.stringify(a.uncertaintyAndLimitations),
        a.categoryMatch ? 1 : 0,
        a.mismatchExplanation || null,
        a.recommendedReviewAction,
        a.modelVersion,
        a.isHumanVerified ? 1 : 0,
        a.verifiedBy || null,
        a.verifiedAt || null,
        a.verificationNotes || null,
        a.analyzedAt
      );
    }
  }

  const insertAlertStmt = db.prepare(`
    INSERT INTO review_alerts (id, project_id, observation_id, alert_type, severity, title, description, selected_category, predicted_category, status, created_at, resolved_at, resolved_by, resolution_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const a of INITIAL_ALERTS) {
    insertAlertStmt.run(
      a.id,
      a.projectId,
      a.observationId,
      a.alertType,
      a.severity,
      a.title,
      a.description,
      a.selectedCategory,
      a.predictedCategory,
      a.status,
      a.createdAt,
      a.resolvedAt || null,
      a.resolvedBy || null,
      a.resolutionNotes || null
    );
  }

  const insertReportStmt = db.prepare(`
    INSERT INTO progress_reports (id, report_number, project_id, reporting_period_start, reporting_period_end, total_observations_in_period, predominant_stage, estimated_weighted_progress, executive_summary, critical_observations_json, category_mismatches_count, unresolved_alerts_count, reviewer_notes, lead_engineer_signature, compliance_disclaimer, generated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const r of INITIAL_REPORTS) {
    insertReportStmt.run(
      r.id,
      r.reportNumber,
      r.projectId,
      r.reportingPeriodStart,
      r.reportingPeriodEnd,
      r.totalObservationsInPeriod,
      r.predominantStage,
      r.estimatedWeightedProgress,
      r.executiveSummary,
      JSON.stringify(r.criticalObservations),
      r.categoryMismatchesCount,
      r.unresolvedAlertsCount,
      r.reviewerNotes || null,
      r.leadEngineerSignature || null,
      r.complianceDisclaimer,
      r.generatedAt
    );
  }
}

// DAO Helpers

export function getProjectsDb(): Project[] {
  const rows = db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all() as any[];
  return rows.map((r) => ({
    id: r.id,
    projectCode: r.project_code,
    name: r.name,
    location: r.location,
    clientName: r.client_name,
    contractorName: r.contractor_name,
    description: r.description,
    startDate: r.start_date,
    expectedCompletionDate: r.expected_completion_date,
    status: r.status,
    currentEstimatedProgress: r.current_estimated_progress,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export function getProjectByIdDb(id: string): Project | null {
  const r = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as any;
  if (!r) return null;
  return {
    id: r.id,
    projectCode: r.project_code,
    name: r.name,
    location: r.location,
    clientName: r.client_name,
    contractorName: r.contractor_name,
    description: r.description,
    startDate: r.start_date,
    expectedCompletionDate: r.expected_completion_date,
    status: r.status,
    currentEstimatedProgress: r.current_estimated_progress,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function insertProjectDb(p: Project): Project {
  db.prepare(`
    INSERT INTO projects (id, project_code, name, location, client_name, contractor_name, description, start_date, expected_completion_date, status, current_estimated_progress, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    p.id,
    p.projectCode,
    p.name,
    p.location,
    p.clientName,
    p.contractorName,
    p.description,
    p.startDate,
    p.expectedCompletionDate,
    p.status,
    p.currentEstimatedProgress,
    p.createdAt,
    p.updatedAt
  );
  return p;
}

export function updateProjectDb(id: string, updates: Partial<Project>): Project | null {
  const current = getProjectByIdDb(id);
  if (!current) return null;

  const merged = { ...current, ...updates, updatedAt: new Date().toISOString() };
  db.prepare(`
    UPDATE projects SET
      name = ?,
      location = ?,
      client_name = ?,
      contractor_name = ?,
      description = ?,
      status = ?,
      current_estimated_progress = ?,
      updated_at = ?
    WHERE id = ?
  `).run(
    merged.name,
    merged.location,
    merged.clientName,
    merged.contractorName,
    merged.description,
    merged.status,
    merged.currentEstimatedProgress,
    merged.updatedAt,
    id
  );

  return merged;
}

export function deleteProjectDb(id: string): boolean {
  const res = db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  return res.changes > 0;
}

export function getObservationsDb(projectId?: string): ImageObservation[] {
  let query = 'SELECT o.*, p.name as project_name FROM image_observations o LEFT JOIN projects p ON o.project_id = p.id';
  const params: any[] = [];
  if (projectId) {
    query += ' WHERE o.project_id = ?';
    params.push(projectId);
  }
  query += ' ORDER BY o.observation_date DESC';

  const rows = (params.length > 0 ? db.prepare(query).all(...params) : db.prepare(query).all()) as any[];

  return rows.map((r) => {
    // Check if analysis exists
    const a = db.prepare('SELECT * FROM ai_analyses WHERE observation_id = ?').get(r.id) as any;
    let analysis: AIAnalysisResult | undefined;
    if (a) {
      analysis = {
        id: a.id,
        observationId: a.observation_id,
        predictedStage: a.predicted_stage,
        predictedStageName: a.predicted_stage,
        confidenceLevel: a.confidence_level,
        confidenceExplanation: a.confidence_explanation,
        visibleActivities: JSON.parse(a.visible_activities_json || '[]'),
        observableEvidence: JSON.parse(a.observable_evidence_json || '[]'),
        visibleMaterials: JSON.parse(a.visible_materials_json || '[]'),
        structuralElements: JSON.parse(a.structural_elements_json || '[]'),
        finishingWorks: JSON.parse(a.finishing_works_json || '[]'),
        imageQualityObservations: JSON.parse(a.quality_observations_json || '[]'),
        uncertaintyAndLimitations: JSON.parse(a.uncertainty_limitations_json || '[]'),
        selectedCategory: r.selected_category,
        categoryMatch: Boolean(a.category_match),
        mismatchExplanation: a.mismatch_explanation,
        recommendedReviewAction: a.recommended_review_action,
        analyzedAt: a.analyzed_at,
        modelVersion: a.model_version,
        isHumanVerified: Boolean(a.is_human_verified),
        verifiedBy: a.verified_by,
        verifiedAt: a.verified_at,
        verificationNotes: a.verification_notes,
      };
    }

    return {
      id: r.id,
      projectId: r.project_id,
      projectName: r.project_name || 'Project',
      imageUrl: r.file_path,
      fileName: r.file_name,
      fileSizeBytes: r.file_size_bytes,
      mimeType: r.mime_type,
      fileSha256: r.file_sha256,
      observationDate: r.observation_date,
      inspectorName: r.inspector_name,
      locationTag: r.location_tag,
      selectedCategory: r.selected_category,
      originalClaimedCategory: r.original_category || r.selected_category,
      correctionHistory: JSON.parse(r.correction_history_json || '[]'),
      notes: r.notes,
      hasMismatchAlert: Boolean(r.has_mismatch_alert),
      createdAt: r.created_at,
      analysis,
    };
  });
}

export function correctObservationCategoryDb(
  obsId: string,
  newCategory: string,
  correctedBy: string,
  reason: string
): ImageObservation | null {
  const current = db.prepare('SELECT * FROM image_observations WHERE id = ?').get(obsId) as any;
  if (!current) return null;

  const originalCategory = current.original_category || current.selected_category;
  const history = JSON.parse(current.correction_history_json || '[]');
  history.push({
    timestamp: new Date().toISOString(),
    previousCategory: current.selected_category,
    newCategory,
    correctedBy,
    reason,
  });

  // Check if new category matches analysis prediction
  const analysis = db.prepare('SELECT * FROM ai_analyses WHERE observation_id = ?').get(obsId) as any;
  const hasMismatch = analysis ? analysis.predicted_stage !== newCategory : false;

  db.prepare(`
    UPDATE image_observations SET
      selected_category = ?,
      original_category = ?,
      correction_history_json = ?,
      has_mismatch_alert = ?
    WHERE id = ?
  `).run(
    newCategory,
    originalCategory,
    JSON.stringify(history),
    hasMismatch ? 1 : 0,
    obsId
  );

  // Update associated alert if resolved
  if (!hasMismatch) {
    db.prepare(`
      UPDATE review_alerts SET
        status = 'RESOLVED_BY_CORRECTION',
        resolution_notes = ?,
        resolved_by = ?,
        resolved_at = ?
      WHERE observation_id = ? AND status = 'PENDING_REVIEW'
    `).run(
      `Category corrected to ${newCategory}: ${reason}`,
      correctedBy,
      new Date().toISOString(),
      obsId
    );
  }

  const updatedObs = getObservationsDb().find((o) => o.id === obsId);
  return updatedObs || null;
}

export function getObservationByHashDb(projectId: string, sha256: string): ImageObservation | null {
  const r = db.prepare('SELECT * FROM image_observations WHERE project_id = ? AND file_sha256 = ?').get(projectId, sha256) as any;
  if (!r) return null;
  return {
    id: r.id,
    projectId: r.project_id,
    fileName: r.file_name,
    imageUrl: r.file_path,
    fileSizeBytes: r.file_size_bytes,
    mimeType: r.mime_type,
    fileSha256: r.file_sha256,
    observationDate: r.observation_date,
    inspectorName: r.inspector_name,
    locationTag: r.location_tag,
    selectedCategory: r.selected_category,
    notes: r.notes,
    hasMismatchAlert: Boolean(r.has_mismatch_alert),
    createdAt: r.created_at,
  };
}

export function insertObservationDb(obs: ImageObservation): ImageObservation {
  db.prepare(`
    INSERT INTO image_observations (id, project_id, file_name, file_path, file_size_bytes, mime_type, file_sha256, observation_date, inspector_name, location_tag, selected_category, notes, has_mismatch_alert, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    obs.id,
    obs.projectId,
    obs.fileName,
    obs.imageUrl,
    obs.fileSizeBytes,
    obs.mimeType,
    obs.fileSha256,
    obs.observationDate,
    obs.inspectorName,
    obs.locationTag || '',
    obs.selectedCategory,
    obs.notes || '',
    obs.hasMismatchAlert ? 1 : 0,
    obs.createdAt
  );

  if (obs.analysis) {
    const a = obs.analysis;
    db.prepare(`
      INSERT INTO ai_analyses (id, observation_id, predicted_stage, confidence_level, confidence_explanation, visible_activities_json, observable_evidence_json, visible_materials_json, structural_elements_json, finishing_works_json, quality_observations_json, uncertainty_limitations_json, category_match, mismatch_explanation, recommended_review_action, model_version, is_human_verified, verified_by, verified_at, verification_notes, analyzed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      a.id,
      obs.id,
      a.predictedStage,
      a.confidenceLevel,
      a.confidenceExplanation,
      JSON.stringify(a.visibleActivities),
      JSON.stringify(a.observableEvidence),
      JSON.stringify(a.visibleMaterials),
      JSON.stringify(a.structuralElements),
      JSON.stringify(a.finishingWorks),
      JSON.stringify(a.imageQualityObservations),
      JSON.stringify(a.uncertaintyAndLimitations),
      a.categoryMatch ? 1 : 0,
      a.mismatchExplanation || null,
      a.recommendedReviewAction,
      a.modelVersion,
      a.isHumanVerified ? 1 : 0,
      a.verifiedBy || null,
      a.verifiedAt || null,
      a.verificationNotes || null,
      a.analyzedAt
    );
  }

  return obs;
}

export function getAlertsDb(projectId?: string): ReviewAlert[] {
  let query = 'SELECT a.*, p.name as project_name FROM review_alerts a LEFT JOIN projects p ON a.project_id = p.id';
  const params: any[] = [];
  if (projectId) {
    query += ' WHERE a.project_id = ?';
    params.push(projectId);
  }
  query += ' ORDER BY a.created_at DESC';

  const rows = (params.length > 0 ? db.prepare(query).all(...params) : db.prepare(query).all()) as any[];
  return rows.map((r) => ({
    id: r.id,
    projectId: r.project_id,
    projectName: r.project_name || 'Project',
    observationId: r.observation_id,
    alertType: r.alert_type,
    severity: r.severity,
    title: r.title,
    description: r.description,
    selectedCategory: r.selected_category,
    predictedCategory: r.predicted_category,
    status: r.status,
    createdAt: r.created_at,
    resolvedAt: r.resolved_at,
    resolvedBy: r.resolved_by,
    resolutionNotes: r.resolution_notes,
  }));
}

export function insertAlertDb(alert: ReviewAlert): ReviewAlert {
  db.prepare(`
    INSERT INTO review_alerts (id, project_id, observation_id, alert_type, severity, title, description, selected_category, predicted_category, status, created_at, resolved_at, resolved_by, resolution_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    alert.id,
    alert.projectId,
    alert.observationId,
    alert.alertType,
    alert.severity,
    alert.title,
    alert.description,
    alert.selectedCategory,
    alert.predictedCategory,
    alert.status,
    alert.createdAt,
    alert.resolvedAt || null,
    alert.resolvedBy || null,
    alert.resolutionNotes || null
  );
  return alert;
}

export function updateAlertDb(id: string, updates: { status: string; resolutionNotes?: string; resolvedBy?: string }): ReviewAlert | null {
  const current = db.prepare('SELECT * FROM review_alerts WHERE id = ?').get(id) as any;
  if (!current) return null;

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE review_alerts SET
      status = ?,
      resolution_notes = ?,
      resolved_by = ?,
      resolved_at = ?
    WHERE id = ?
  `).run(
    updates.status,
    updates.resolutionNotes || current.resolution_notes,
    updates.resolvedBy || current.resolved_by,
    now,
    id
  );

  return {
    ...current,
    status: updates.status,
    resolutionNotes: updates.resolutionNotes || current.resolution_notes,
    resolvedBy: updates.resolvedBy || current.resolved_by,
    resolvedAt: now,
  };
}

export function getReportsDb(projectId?: string): ProgressReport[] {
  let query = 'SELECT r.*, p.name as project_name, p.location as project_location FROM progress_reports r LEFT JOIN projects p ON r.project_id = p.id';
  const params: any[] = [];
  if (projectId) {
    query += ' WHERE r.project_id = ?';
    params.push(projectId);
  }
  query += ' ORDER BY r.generated_at DESC';

  const rows = (params.length > 0 ? db.prepare(query).all(...params) : db.prepare(query).all()) as any[];
  return rows.map((r) => ({
    id: r.id,
    reportNumber: r.report_number,
    projectId: r.project_id,
    projectName: r.project_name || 'Project',
    location: r.project_location || 'Site',
    generatedAt: r.generated_at,
    reportingPeriodStart: r.reporting_period_start,
    reportingPeriodEnd: r.reporting_period_end,
    totalObservationsInPeriod: r.total_observations_in_period,
    predominantStage: r.predominant_stage,
    estimatedWeightedProgress: r.estimated_weighted_progress,
    executiveSummary: r.executive_summary,
    criticalObservations: JSON.parse(r.critical_observations_json || '[]'),
    categoryMismatchesCount: r.category_mismatches_count,
    unresolvedAlertsCount: r.unresolved_alerts_count,
    reviewerNotes: r.reviewer_notes,
    leadEngineerSignature: r.lead_engineer_signature,
    complianceDisclaimer: r.compliance_disclaimer,
  }));
}

export function insertReportDb(report: ProgressReport): ProgressReport {
  db.prepare(`
    INSERT INTO progress_reports (id, report_number, project_id, reporting_period_start, reporting_period_end, total_observations_in_period, predominant_stage, estimated_weighted_progress, executive_summary, critical_observations_json, category_mismatches_count, unresolved_alerts_count, reviewer_notes, lead_engineer_signature, compliance_disclaimer, generated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    report.id,
    report.reportNumber,
    report.projectId,
    report.reportingPeriodStart,
    report.reportingPeriodEnd,
    report.totalObservationsInPeriod,
    report.predominantStage,
    report.estimatedWeightedProgress,
    report.executiveSummary,
    JSON.stringify(report.criticalObservations),
    report.categoryMismatchesCount,
    report.unresolvedAlertsCount,
    report.reviewerNotes || null,
    report.leadEngineerSignature || null,
    report.complianceDisclaimer,
    report.generatedAt
  );
  return report;
}

export function insertComparisonDb(cmp: ImageComparisonResult): ImageComparisonResult {
  db.prepare(`
    INSERT INTO image_comparisons (id, project_id, baseline_observation_id, target_observation_id, elapsed_days, viewpoint_consistency, viewpoint_limitations, visible_changes_summary, newly_visible_elements_json, structural_progression_notes, estimated_progress_delta_percent, progress_disclaimer, recommended_site_action, compared_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    cmp.id,
    cmp.projectId,
    cmp.baselineObservationId,
    cmp.targetObservationId,
    cmp.elapsedDays,
    cmp.viewpointConsistency,
    cmp.viewpointLimitations || null,
    cmp.visibleChangesSummary,
    JSON.stringify(cmp.newlyVisibleElements),
    cmp.structuralProgressionNotes,
    cmp.estimatedProgressDeltaPercent,
    cmp.progressCalculationDisclaimer,
    cmp.recommendedSiteAction,
    cmp.comparedAt
  );
  return cmp;
}

export function getComparisonsDb(projectId?: string): ImageComparisonResult[] {
  let query = 'SELECT * FROM image_comparisons';
  const params: any[] = [];
  if (projectId) {
    query += ' WHERE project_id = ?';
    params.push(projectId);
  }
  query += ' ORDER BY compared_at DESC';

  const rows = (params.length > 0 ? db.prepare(query).all(...params) : db.prepare(query).all()) as any[];
  return rows.map((r) => ({
    id: r.id,
    projectId: r.project_id,
    baselineObservationId: r.baseline_observation_id,
    baselineObservationDate: '',
    baselineImageUrl: '',
    baselineStage: '' as any,
    targetObservationId: r.target_observation_id,
    targetObservationDate: '',
    targetImageUrl: '',
    targetStage: '' as any,
    elapsedDays: r.elapsed_days,
    viewpointConsistency: r.viewpoint_consistency,
    viewpointLimitations: r.viewpoint_limitations,
    visibleChangesSummary: r.visible_changes_summary,
    newlyVisibleElements: JSON.parse(r.newly_visible_elements_json || '[]'),
    structuralProgressionNotes: r.structural_progression_notes,
    estimatedProgressDeltaPercent: r.estimated_progress_delta_percent,
    progressCalculationDisclaimer: r.progress_disclaimer,
    recommendedSiteAction: r.recommended_site_action,
    comparedAt: r.compared_at,
  }));
}

export function resetDatabaseDb() {
  db.exec('DELETE FROM progress_reports');
  db.exec('DELETE FROM review_alerts');
  db.exec('DELETE FROM image_comparisons');
  db.exec('DELETE FROM ai_analyses');
  db.exec('DELETE FROM image_observations');
  db.exec('DELETE FROM projects');
  seedBenchmarkData();
}
