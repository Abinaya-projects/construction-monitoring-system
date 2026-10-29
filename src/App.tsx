/**
 * BuildSight EPC — Construction Management & Visual Progress Monitoring System
 * Academic Project: "UTILIZATION OF IMAGES FOR MONITORING OF PROGRESS OF
 * CONSTRUCTION ACTIVITIES FOR BUILDING CONSTRUCTION PROJECTS"
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Project, ImageObservation, ReviewAlert, ProgressReport } from './types';
import { getProjects, getObservations, getAlerts, getReports, resetSeedData } from './services/api';
import { Navbar } from './components/Navbar';
import { DashboardView } from './views/DashboardView';
import { ProjectsView } from './views/ProjectsView';
import { ProjectDetailView } from './views/ProjectDetailView';
import { UploadAnalyzeView } from './views/UploadAnalyzeView';
import { ComparisonView } from './views/ComparisonView';
import { AlertsQueueView } from './views/AlertsQueueView';
import { ReportsView } from './views/ReportsView';
import { EvaluationView } from './views/EvaluationView';
import { AcademicJavaCenterView } from './views/AcademicJavaCenterView';
import { getStageById } from './constants/stages';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [observations, setObservations] = useState<ImageObservation[]>([]);
  const [alerts, setAlerts] = useState<ReviewAlert[]>([]);
  const [reports, setReports] = useState<ProgressReport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeObservationModal, setActiveObservationModal] = useState<ImageObservation | null>(null);

  // Fetch real data from backend
  const loadBackendData = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const [projData, obsData, alertData, repData] = await Promise.all([
        getProjects(),
        getObservations(),
        getAlerts(),
        getReports(),
      ]);
      setProjects(projData || []);
      setObservations(obsData || []);
      setAlerts(alertData || []);
      setReports(repData || []);
    } catch (err: any) {
      console.error('Failed to load database records:', err);
      setApiError(err.message || 'Unable to connect to backend service.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBackendData();
  }, [loadBackendData]);

  const handleResetData = async () => {
    if (window.confirm('Reset SQLite database to the initial academic benchmark seed dataset? This will reload ground-truth projects and verified observations.')) {
      try {
        await resetSeedData();
        await loadBackendData();
        alert('Database successfully reset to benchmark seed dataset.');
      } catch (err: any) {
        alert('Failed to reset seed data: ' + err.message);
      }
    }
  };

  const openMismatchesCount = alerts.filter((a) => a.status === 'PENDING_REVIEW').length;

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentView('project-detail');
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-stone-900 antialiased selection:bg-amber-500 selection:text-white">
      {/* Top Bar Header */}
      <Navbar
        currentView={currentView}
        onSelectView={(view) => {
          setCurrentView(view);
          if (view !== 'project-detail') {
            setSelectedProjectId(null);
          }
        }}
        openMismatchesCount={openMismatchesCount}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={handleSelectProject}
      />

      {apiError && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 text-xs text-rose-800 flex items-center justify-between max-w-7xl mx-auto w-full">
          <span>Backend communication error: {apiError}</span>
          <button
            onClick={loadBackendData}
            className="underline font-semibold cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        {isLoading && projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[360px] space-y-3">
            <div className="w-6 h-6 border-2 border-stone-800 border-t-transparent rounded-full animate-spin" />
            <div className="text-xs font-semibold text-stone-800">Connecting to BuildSight SQLite Database...</div>
            <div className="text-[11px] text-stone-500 font-mono">Loading active construction projects and observation logs</div>
          </div>
        ) : (
          <>
            {currentView === 'dashboard' && (
              <DashboardView
                projects={projects}
                observations={observations}
                alerts={alerts}
                onNavigate={(view, pId) => {
                  if (pId) {
                    setSelectedProjectId(pId);
                    setCurrentView('project-detail');
                  } else {
                    setCurrentView(view);
                  }
                }}
                onSelectObservation={(obs) => setActiveObservationModal(obs)}
              />
            )}

            {currentView === 'projects' && (
              <ProjectsView
                projects={projects}
                onSelectProject={handleSelectProject}
                onProjectCreated={(newP) => setProjects([newP, ...projects])}
              />
            )}

            {currentView === 'project-detail' && selectedProject && (
              <ProjectDetailView
                project={selectedProject}
                observations={observations}
                onBack={() => {
                  setSelectedProjectId(null);
                  setCurrentView('projects');
                }}
                onNavigateUpload={(pId) => {
                  setSelectedProjectId(pId);
                  setCurrentView('upload');
                }}
                onSelectObservation={(obs) => setActiveObservationModal(obs)}
                onProjectUpdated={(updatedP) => {
                  setProjects(projects.map((p) => (p.id === updatedP.id ? updatedP : p)));
                }}
              />
            )}

            {currentView === 'upload' && (
              <UploadAnalyzeView
                projects={projects}
                onObservationSaved={(newObs) => {
                  setObservations([newObs, ...observations]);
                  // Refresh alerts from database to show real mismatch status
                  getAlerts().then(setAlerts).catch(() => {});
                }}
                onNavigate={(view) => setCurrentView(view)}
              />
            )}

            {currentView === 'compare' && (
              <ComparisonView projects={projects} observations={observations} />
            )}

            {currentView === 'alerts' && (
              <AlertsQueueView
                alerts={alerts}
                onAlertUpdated={(updated) => {
                  setAlerts(alerts.map((a) => (a.id === updated.id ? updated : a)));
                }}
              />
            )}

            {currentView === 'reports' && (
              <ReportsView
                projects={projects}
                observations={observations}
                alerts={alerts}
                reports={reports}
                onReportCreated={(newRep) => setReports([newRep, ...reports])}
              />
            )}

            {currentView === 'evaluation' && <EvaluationView />}

            {currentView === 'academic' && <AcademicJavaCenterView />}
          </>
        )}
      </main>

      {/* Observation Modal Lightbox (Engineering inspection record card) */}
      {activeObservationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4">
          <div className="bg-white rounded-sm shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-stone-300">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div>
                <span className="font-mono text-[11px] text-stone-500 font-semibold uppercase">Inspection Observation Record</span>
                <h3 className="text-sm font-bold text-stone-900">
                  {getStageById(activeObservationModal.selectedCategory).name}
                </h3>
              </div>
              <button
                onClick={() => setActiveObservationModal(null)}
                className="text-stone-400 hover:text-stone-800 text-sm font-mono p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3.5">
              <img
                src={activeObservationModal.imageUrl}
                alt={activeObservationModal.fileName}
                referrerPolicy="no-referrer"
                className="max-h-96 w-full object-contain rounded-xs bg-stone-950 border border-stone-200"
              />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs bg-stone-50 p-3 rounded-xs border border-stone-200">
                <div>
                  <span className="text-stone-500 block text-[10px] uppercase font-mono">Date</span>
                  <span className="font-semibold text-stone-900 font-mono text-[11px]">{activeObservationModal.observationDate}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[10px] uppercase font-mono">Inspector</span>
                  <span className="font-medium text-stone-900">{activeObservationModal.inspectorName}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[10px] uppercase font-mono">Location</span>
                  <span className="font-medium text-stone-900">{activeObservationModal.locationTag || 'General Site'}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[10px] uppercase font-mono">SHA-256 Digest</span>
                  <span className="font-mono text-[10px] text-stone-600 truncate block">
                    {activeObservationModal.fileSha256.substring(0, 16)}...
                  </span>
                </div>
              </div>

              <div className="text-xs text-stone-800">
                <span className="font-semibold text-stone-900 block mb-0.5">Field Inspection Notes:</span>
                <p className="text-stone-700 leading-relaxed bg-stone-50/50 p-2 border border-stone-200 rounded-xs">
                  {activeObservationModal.notes || 'No field notes logged for this observation.'}
                </p>
              </div>

              {/* Category Correction & Audit Trail if revised */}
              {activeObservationModal.correctionHistory && activeObservationModal.correctionHistory.length > 0 && (
                <div className="p-3 bg-stone-50 rounded-xs border border-stone-200 text-xs space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-stone-200">
                    <span className="font-semibold text-stone-900">
                      Category Adjudication History ({activeObservationModal.correctionHistory.length} Revision{activeObservationModal.correctionHistory.length > 1 ? 's' : ''})
                    </span>
                    <span className="text-[10px] font-mono text-stone-600">
                      Original: {getStageById(activeObservationModal.originalClaimedCategory || activeObservationModal.selectedCategory).name}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {activeObservationModal.correctionHistory.map((rev, idx) => (
                      <div key={idx} className="bg-white p-2 border border-stone-200 text-[11px] text-stone-900">
                        <div className="flex items-center justify-between font-mono text-[10px] text-stone-500">
                          <span>By: {rev.correctedBy}</span>
                          <span>{new Date(rev.timestamp).toLocaleDateString()}</span>
                        </div>
                        <div className="mt-1 font-medium">
                          <span className="line-through text-stone-500">{getStageById(rev.previousCategory).name}</span> → <strong className="text-stone-900">{getStageById(rev.newCategory).name}</strong>
                        </div>
                        <div className="text-stone-600 mt-0.5 italic">
                          &ldquo;{rev.reason}&rdquo;
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeObservationModal.analysis && (
                <div className="p-3.5 bg-stone-50 rounded-xs border border-stone-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-900">Automated Visual Stage Evaluation:</span>
                    <span className="font-medium text-stone-800">
                      {activeObservationModal.analysis.predictedStageName} ({activeObservationModal.analysis.confidenceLevel})
                    </span>
                  </div>
                  <p className="text-stone-700 text-[11px] leading-relaxed">{activeObservationModal.analysis.confidenceExplanation}</p>
                  {activeObservationModal.analysis.visibleActivities && activeObservationModal.analysis.visibleActivities.length > 0 && (
                    <div className="pt-1">
                      <span className="font-semibold text-stone-800 block text-[11px] mb-0.5">Observed Activities:</span>
                      <ul className="list-disc list-inside space-y-0.5 text-stone-600 text-[11px]">
                        {activeObservationModal.analysis.visibleActivities.map((act, i) => (
                          <li key={i}>{act}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {activeObservationModal.analysis.mismatchExplanation && (
                    <div className="p-2 bg-amber-50 text-amber-900 rounded-xs border border-amber-200 text-[11px]">
                      <span className="font-semibold">Discrepancy Note:</span> {activeObservationModal.analysis.mismatchExplanation}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-3.5 border-t border-stone-200 flex justify-end bg-stone-50">
              <button
                onClick={() => setActiveObservationModal(null)}
                className="px-3.5 py-1 text-xs font-medium text-stone-700 bg-white border border-stone-300 hover:bg-stone-100 rounded-sm cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Authentic Engineering Footer */}
      <footer className="border-t border-stone-200 bg-white py-4 text-xs text-stone-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            BuildSight EPC · Construction Management & Progress Intelligence Platform
          </div>
          <div className="flex items-center gap-4 text-stone-500 text-[11px] font-mono">
            <button
              onClick={handleResetData}
              title="Reset SQLite database to original benchmark dataset"
              className="hover:text-stone-900 cursor-pointer text-stone-600 underline"
            >
              Reset Benchmark Seed Data
            </button>
            <span aria-hidden="true">|</span>
            <button
              onClick={() => setCurrentView('academic')}
              className="hover:text-stone-900 cursor-pointer underline text-stone-600"
            >
              System Architecture
            </button>
            <span aria-hidden="true">|</span>
            <span>SQLite Database: Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
