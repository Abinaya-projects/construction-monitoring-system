import React, { useState } from 'react';
import { Project, ImageObservation, ProgressReport, ReviewAlert } from '../types';
import { createReport } from '../services/api';
import { getStageById } from '../constants/stages';

interface ReportsViewProps {
  projects: Project[];
  observations: ImageObservation[];
  alerts: ReviewAlert[];
  reports: ProgressReport[];
  onReportCreated: (report: ProgressReport) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  projects,
  observations,
  alerts,
  reports,
  onReportCreated,
}) => {
  const [selectedReportId, setSelectedReportId] = useState<string>(
    reports[0]?.id || ''
  );
  const [showGenerateModal, setShowGenerateModal] = useState<boolean>(false);

  // Report generation form state
  const [genProjectId, setGenProjectId] = useState<string>(projects[0]?.id || '');
  const [startDate, setStartDate] = useState<string>('2025-06-01');
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [executiveSummary, setExecutiveSummary] = useState<string>('');
  const [reviewerNotes, setReviewerNotes] = useState<string>('');
  const [signatory, setSignatory] = useState<string>(
    'Er. Vikram Menon, FIE, Chartered Civil Engineer (Lic. KA/CIV/4819)'
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const activeReport = reports.find((r) => r.id === selectedReportId) || reports[0];
  const activeProject = projects.find((p) => p.id === activeReport?.projectId);

  const reportObservations = activeReport
    ? observations.filter(
        (o) =>
          o.projectId === activeReport.projectId &&
          o.observationDate >= activeReport.reportingPeriodStart &&
          o.observationDate <= activeReport.reportingPeriodEnd
      )
    : [];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const newReport = await createReport({
        projectId: genProjectId,
        reportingPeriodStart: startDate,
        reportingPeriodEnd: endDate,
        executiveSummary:
          executiveSummary ||
          `Progress Intelligence Report covering inspection cycle from ${startDate} to ${endDate}.`,
        reviewerNotes,
        leadEngineerSignature: signatory,
      });

      onReportCreated(newReport);
      setSelectedReportId(newReport.id);
      setShowGenerateModal(false);
    } catch (err: any) {
      alert('Failed to generate report: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
            <span className="font-mono text-stone-600">IS 456 / Statutory Compliance</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span>Formal Documentation</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-stone-900 tracking-tight">
            Progress Reports & Statutory Audit Sheets
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-stone-600">
            Export printable civil progress assessments with photographic evidence logs and engineering verification signatures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGenerateModal(true)}
            className="px-3.5 py-2 text-xs font-medium text-white bg-amber-700 hover:bg-amber-800 rounded-xs transition-colors cursor-pointer shadow-xs"
          >
            + Compile New Report
          </button>
          {activeReport && (
            <button
              onClick={handlePrint}
              className="px-3 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 hover:bg-stone-50 rounded-xs transition-colors cursor-pointer"
            >
              Print / Save PDF
            </button>
          )}
        </div>
      </div>

      {/* Report Selector Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs text-stone-500 font-medium whitespace-nowrap">
          Archived Reports:
        </span>
        {reports.map((rep) => (
          <button
            key={rep.id}
            onClick={() => setSelectedReportId(rep.id)}
            className={`px-2.5 py-1 text-xs font-medium rounded-xs transition-colors whitespace-nowrap cursor-pointer ${
              activeReport?.id === rep.id
                ? 'bg-stone-900 text-stone-100 shadow-xs'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            {rep.reportNumber} ({rep.projectName})
          </button>
        ))}
      </div>

      {/* Printable Report Document Sheet */}
      {activeReport ? (
        <div className="bg-white rounded-xs border border-stone-300 shadow-xs p-6 sm:p-10 max-w-5xl mx-auto space-y-6 print:p-0 print:border-none print:shadow-none">
          {/* Header Block */}
          <div className="border-b-2 border-stone-900 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-mono text-stone-500 tracking-wider">
                CIVIL QUALITY AUDIT & PROGRESS DOSSIER
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-stone-900 mt-0.5">
                {activeReport.projectName}
              </h2>
              <div className="text-xs text-stone-600 mt-1">
                Location: {activeReport.location}
              </div>
            </div>

            <div className="text-right text-xs space-y-0.5">
              <div className="font-mono font-semibold text-stone-900">
                {activeReport.reportNumber}
              </div>
              <div className="text-stone-500">
                Generated: <span className="font-mono">{activeReport.generatedAt.split('T')[0]}</span>
              </div>
              <div className="text-stone-500 font-mono text-[11px]">
                Cycle: {activeReport.reportingPeriodStart} to {activeReport.reportingPeriodEnd}
              </div>
            </div>
          </div>

          {/* Key Audit Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xs bg-stone-50 border border-stone-200 text-xs">
            <div>
              <div className="text-[10px] text-stone-500 font-mono">
                REPORTING PERIOD
              </div>
              <div className="font-medium text-stone-900 mt-0.5 font-mono">
                {activeReport.reportingPeriodStart} ~ {activeReport.reportingPeriodEnd}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-stone-500 font-mono">
                VALIDATED EVIDENCE
              </div>
              <div className="font-medium text-stone-900 font-mono mt-0.5">
                {activeReport.totalObservationsInPeriod} Observations
              </div>
            </div>

            <div>
              <div className="text-[10px] text-stone-500 font-mono">
                PREDOMINANT STAGE
              </div>
              <div className="font-medium text-stone-900 mt-0.5">
                {getStageById(activeReport.predominantStage).name}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-stone-500 font-mono">
                WEIGHTED PROGRESS
              </div>
              <div className="font-semibold text-amber-800 font-mono mt-0.5">
                {activeReport.estimatedWeightedProgress}% (Milestone Est.)
              </div>
            </div>
          </div>

          {/* Executive Summary Section */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-semibold text-stone-900">
              1. Executive Engineering Summary
            </h3>
            <p className="text-xs text-stone-700 leading-relaxed text-justify">
              {activeReport.executiveSummary}
            </p>
          </div>

          {/* Critical Observations Bullet List */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-semibold text-stone-900">
              2. Key Milestone Observations & Field Logs
            </h3>
            <ul className="space-y-1 text-xs text-stone-700 list-disc list-inside">
              {activeReport.criticalObservations.map((obs, i) => (
                <li key={i}>{obs}</li>
              ))}
            </ul>
          </div>

          {/* Photographic Evidence Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-stone-900">
              3. Visual Evidence Gallery & Multimodal Vision Logs
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {reportObservations.map((obs) => (
                <div
                  key={obs.id}
                  className="p-3 rounded-xs border border-stone-200 bg-stone-50/50 space-y-2"
                >
                  <img
                    src={obs.imageUrl}
                    alt={obs.fileName}
                    referrerPolicy="no-referrer"
                    className="w-full h-40 object-cover rounded-xs border border-stone-200"
                  />
                  <div className="text-xs space-y-0.5">
                    <div className="flex items-center justify-between font-medium text-stone-900">
                      <span>{getStageById(obs.selectedCategory).name}</span>
                      <span className="font-mono text-stone-500">{obs.observationDate}</span>
                    </div>
                    <div className="text-stone-600 line-clamp-2">{obs.notes}</div>
                    <div className="text-[11px] text-stone-500">
                      Inspector: {obs.inspectorName}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviewer Sign-off & Legal Disclaimers */}
          <div className="border-t border-stone-200 pt-5 space-y-3.5">
            <div className="text-xs text-stone-700">
              <strong className="block mb-1 text-stone-900 font-medium">
                4. Civil Engineer Reviewer Notes & Determination:
              </strong>
              {activeReport.reviewerNotes || 'All observations examined and verified against site logs.'}
            </div>

            <div className="p-3 bg-stone-50 rounded-xs text-xs text-stone-600 leading-relaxed border border-stone-200">
              <strong className="text-stone-800 font-medium">Statutory Compliance Note:</strong> {activeReport.complianceDisclaimer}
            </div>

            <div className="pt-6 flex items-end justify-between text-xs">
              <div>
                <div className="font-mono text-[10px] text-stone-500">
                  SYSTEM TIMESTAMP
                </div>
                <div className="font-mono text-stone-700">{activeReport.generatedAt}</div>
              </div>

              <div className="text-right">
                <div className="border-b border-stone-400 w-64 mb-1" />
                <div className="font-medium text-stone-900">
                  {activeReport.leadEngineerSignature || 'Chartered Civil Engineer'}
                </div>
                <div className="text-[11px] text-stone-500">
                  Authorized Structural QA/QC Signatory
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-xs border border-stone-200">
          <div className="text-xs font-semibold text-stone-800">No Reports Available</div>
          <p className="text-xs text-stone-500 mt-1">
            Click &quot;Compile New Report&quot; to synthesize image observations into an audit sheet.
          </p>
        </div>
      )}

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4">
          <div className="bg-white rounded-xs shadow-lg max-w-lg w-full p-5 border border-stone-200 space-y-3.5">
            <h3 className="text-base font-semibold text-stone-900">
              Compile Progress Monitoring Report
            </h3>
            <p className="text-xs text-stone-500">
              Synthesize verified photographs, stage transitions, and mismatch adjudications for statutory review.
            </p>

            <form onSubmit={handleGenerate} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Target Project *
                </label>
                <select
                  value={genProjectId}
                  onChange={(e) => setGenProjectId(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-xs border border-stone-300 bg-white text-stone-900"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Period Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-xs border border-stone-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Period End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-xs border border-stone-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Executive Summary Narrative
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Substructure completed; Level 8 superstructure slab cast on schedule..."
                  value={executiveSummary}
                  onChange={(e) => setExecutiveSummary(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-xs border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Reviewer Notes & Action Items
                </label>
                <input
                  type="text"
                  placeholder="e.g. Recommend releasing Contractor Bill #4 with hold on facade..."
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-xs border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Lead Engineer Signatory Name
                </label>
                <input
                  type="text"
                  value={signatory}
                  onChange={(e) => setSignatory(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-xs border border-stone-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-amber-700 hover:bg-amber-800 rounded-xs transition-colors cursor-pointer"
                >
                  {isGenerating ? 'Compiling...' : 'Generate Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
