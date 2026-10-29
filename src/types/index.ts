/**
 * BuildSight EPC - Construction Progress Intelligence System
 * Domain Types & Schemas
 */

export type ConstructionStageId =
  | 'STAGE_01_FOUNDATION'
  | 'STAGE_02_PLINTH'
  | 'STAGE_03_SUPERSTRUCTURE'
  | 'STAGE_04_MASONRY'
  | 'STAGE_05_FACADE'
  | 'STAGE_06_ROOFING'
  | 'STAGE_07_MEP_SERVICES'
  | 'STAGE_08_INTERIOR'
  | 'STAGE_09_COMPLETION'
  | 'STAGE_10_UNCLEAR';

export interface ConstructionStage {
  id: ConstructionStageId;
  code: string;
  name: string;
  description: string;
  keyIndicators: string[];
  defaultMilestoneWeight: number; // percentage in progress calculation
  sequenceOrder: number;
}

export type ProjectStatus = 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';

export interface Project {
  id: string;
  name: string;
  projectCode: string;
  location: string;
  clientName: string;
  contractorName: string;
  description: string;
  startDate: string;
  expectedCompletionDate: string;
  status: ProjectStatus;
  currentEstimatedProgress: number; // 0 - 100 based on weighted milestones
  createdAt: string;
  updatedAt: string;
  coverImage?: string;
  milestoneWeights?: Record<ConstructionStageId, number>;
}

export interface CategoryCorrectionLog {
  timestamp: string;
  previousCategory: ConstructionStageId;
  newCategory: ConstructionStageId;
  correctedBy: string;
  reason: string;
}

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNCERTAIN';

export interface AIAnalysisResult {
  id: string;
  observationId: string;
  predictedStage: ConstructionStageId;
  predictedStageName: string;
  confidenceLevel: ConfidenceLevel;
  confidenceExplanation: string;
  visibleActivities: string[];
  observableEvidence: string[];
  visibleMaterials: string[];
  structuralElements: string[];
  finishingWorks: string[];
  imageQualityObservations: string[];
  uncertaintyAndLimitations: string[];
  selectedCategory: ConstructionStageId;
  categoryMatch: boolean;
  mismatchExplanation?: string;
  recommendedReviewAction: string;
  analyzedAt: string;
  modelVersion: string;
  isUnsupportedOrNonConstruction?: boolean;
  isHumanVerified?: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  verificationNotes?: string;
}

export interface ImageObservation {
  id: string;
  projectId: string;
  projectName?: string;
  imageUrl: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  fileSha256: string;
  observationDate: string;
  inspectorName: string;
  locationTag?: string;
  selectedCategory: ConstructionStageId;
  originalClaimedCategory?: ConstructionStageId;
  correctionHistory?: CategoryCorrectionLog[];
  notes?: string;
  createdAt: string;
  analysis?: AIAnalysisResult;
  hasMismatchAlert?: boolean;
}

export interface ImageComparisonResult {
  id: string;
  projectId: string;
  baselineObservationId: string;
  baselineObservationDate: string;
  baselineImageUrl: string;
  baselineStage: ConstructionStageId;
  targetObservationId: string;
  targetObservationDate: string;
  targetImageUrl: string;
  targetStage: ConstructionStageId;
  elapsedDays: number;
  viewpointConsistency: 'HIGH' | 'MODERATE' | 'POOR_DIFFERENT_ANGLES';
  viewpointLimitations?: string;
  visibleChangesSummary: string;
  newlyVisibleElements: string[];
  structuralProgressionNotes: string;
  estimatedProgressDeltaPercent: number; // based on milestone weights, not raw subtraction
  progressCalculationDisclaimer: string;
  recommendedSiteAction: string;
  comparedAt: string;
}

export interface ReviewAlert {
  id: string;
  projectId: string;
  projectName: string;
  observationId: string;
  alertType: 'CATEGORY_MISMATCH' | 'POOR_IMAGE_QUALITY' | 'NON_CONSTRUCTION_IMAGE' | 'STAGE_REGRESSION';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  selectedCategory: ConstructionStageId;
  predictedCategory: ConstructionStageId;
  status: 'PENDING_REVIEW' | 'CONFIRMED_BY_ENGINEER' | 'OVERRIDDEN_BY_ENGINEER' | 'DISMISSED';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
}

export interface ProgressReport {
  id: string;
  reportNumber: string;
  projectId: string;
  projectName: string;
  location: string;
  generatedAt: string;
  reportingPeriodStart: string;
  reportingPeriodEnd: string;
  totalObservationsInPeriod: number;
  predominantStage: ConstructionStageId;
  estimatedWeightedProgress: number;
  executiveSummary: string;
  criticalObservations: string[];
  categoryMismatchesCount: number;
  unresolvedAlertsCount: number;
  reviewerNotes?: string;
  leadEngineerSignature?: string;
  complianceDisclaimer: string;
}

export interface EvaluationMetric {
  stageId: ConstructionStageId;
  stageName: string;
  totalSamples: number;
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  precision: number;
  recall: number;
  f1Score: number;
}

export interface BackendStatus {
  activeMode: 'cloud-express' | 'local-springboot';
  isSpringAvailable: boolean;
  springEndpoint: string;
  geminiModel: string;
}

export type {
  DailySiteReport,
  ConstructionMilestone,
  LabourAttendanceRecord,
  MaterialInventoryItem,
  ProjectFinancials,
  SafetyIncidentItem,
  ProjectDocumentItem,
} from '../data/constructionSiteData';

