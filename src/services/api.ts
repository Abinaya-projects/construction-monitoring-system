import {
  Project,
  ImageObservation,
  AIAnalysisResult,
  ImageComparisonResult,
  ReviewAlert,
  ProgressReport,
  BackendStatus,
} from '../types';

let currentBackendMode: 'cloud-express' | 'local-springboot' = 'cloud-express';

export function getActiveBackendMode(): 'cloud-express' | 'local-springboot' {
  const saved = localStorage.getItem('buildsight_backend_mode');
  if (saved === 'local-springboot') {
    return 'local-springboot';
  }
  return 'cloud-express';
}

export function setActiveBackendMode(mode: 'cloud-express' | 'local-springboot') {
  currentBackendMode = mode;
  localStorage.setItem('buildsight_backend_mode', mode);
}

function getBaseUrl(): string {
  const mode = getActiveBackendMode();
  if (mode === 'local-springboot') {
    return 'http://localhost:8080/api/v1';
  }
  return '/api';
}

export async function checkBackendStatus(): Promise<BackendStatus> {
  const mode = getActiveBackendMode();
  let isSpringAvailable = false;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);
    const res = await fetch('http://localhost:8080/api/v1/health', { signal: controller.signal });
    clearTimeout(timeout);
    isSpringAvailable = res.ok;
  } catch {
    isSpringAvailable = false;
  }

  return {
    activeMode: mode,
    isSpringAvailable,
    springEndpoint: 'http://localhost:8080/api/v1',
    geminiModel: 'gemini-3.8-flash',
  };
}

export async function getProjects(): Promise<Project[]> {
  const res = await fetch(`${getBaseUrl()}/projects`);
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
}

export async function createProject(project: Partial<Project>): Promise<Project> {
  const res = await fetch(`${getBaseUrl()}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to create project' }));
    throw new Error(err.error || 'Failed to create project');
  }
  return res.json();
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project> {
  const res = await fetch(`${getBaseUrl()}/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update project');
  return res.json();
}

export async function getObservations(projectId?: string): Promise<ImageObservation[]> {
  const url = projectId ? `${getBaseUrl()}/observations?projectId=${projectId}` : `${getBaseUrl()}/observations`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch observations');
  return res.json();
}

export async function saveObservation(observation: Partial<ImageObservation>): Promise<ImageObservation> {
  const res = await fetch(`${getBaseUrl()}/observations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(observation),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to save observation' }));
    throw new Error(err.error || 'Failed to save observation');
  }
  return res.json();
}

export async function correctObservationCategory(
  obsId: string,
  payload: { newCategory: string; correctedBy: string; reason: string }
): Promise<ImageObservation> {
  const res = await fetch(`${getBaseUrl()}/observations/${obsId}/correct-category`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to correct category');
  return res.json();
}

export async function analyzeImage(payload: {
  imageDataUri: string;
  selectedCategory: string;
  projectName?: string;
  notes?: string;
  observationDate?: string;
  observationId?: string;
  projectId?: string;
}): Promise<AIAnalysisResult> {
  const mode = getActiveBackendMode();
  const endpoint = mode === 'local-springboot' ? 'http://localhost:8080/api/v1/ai/analyze-image' : '/api/ai/analyze-image';

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Vision analysis failed' }));
    throw new Error(err.error || `Server returned status ${res.status}`);
  }

  return res.json();
}

export async function compareImages(payload: {
  baselineImageDataUri: string;
  baselineDate: string;
  baselineStage: string;
  targetImageDataUri: string;
  targetDate: string;
  targetStage: string;
  projectName?: string;
  projectId?: string;
}): Promise<ImageComparisonResult> {
  const res = await fetch('/api/ai/compare-images', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Image comparison failed' }));
    throw new Error(err.error || `Server returned status ${res.status}`);
  }

  return res.json();
}

export async function getSavedComparisons(projectId?: string): Promise<ImageComparisonResult[]> {
  const url = projectId ? `/api/comparisons?projectId=${projectId}` : '/api/comparisons';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch comparisons');
  return res.json();
}

export async function getAlerts(projectId?: string): Promise<ReviewAlert[]> {
  const url = projectId ? `${getBaseUrl()}/alerts?projectId=${projectId}` : `${getBaseUrl()}/alerts`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export async function resolveAlert(id: string, resolution: { status: string; resolutionNotes: string; resolvedBy: string }): Promise<ReviewAlert> {
  const res = await fetch(`${getBaseUrl()}/alerts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(resolution),
  });
  if (!res.ok) throw new Error('Failed to resolve alert');
  return res.json();
}

export async function getReports(projectId?: string): Promise<ProgressReport[]> {
  const url = projectId ? `${getBaseUrl()}/reports?projectId=${projectId}` : `${getBaseUrl()}/reports`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch reports');
  return res.json();
}

export async function createReport(payload: Partial<ProgressReport>): Promise<ProgressReport> {
  const res = await fetch(`${getBaseUrl()}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create report');
  return res.json();
}

export async function getEvaluationData(): Promise<any> {
  const res = await fetch('/api/evaluation');
  if (!res.ok) throw new Error('Failed to fetch evaluation metrics');
  return res.json();
}

export async function resetSeedData(): Promise<void> {
  await fetch('/api/seed-reset', { method: 'POST' });
}
