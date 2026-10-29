import React, { useState, useEffect } from 'react';
import { Project, ImageObservation, ImageComparisonResult } from '../types';
import { compareImages, getSavedComparisons } from '../services/api';
import { getStageById } from '../constants/stages';

interface ComparisonViewProps {
  projects: Project[];
  observations: ImageObservation[];
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  projects,
  observations,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projects[0]?.id || ''
  );

  const projectObservations = observations.filter(
    (o) => o.projectId === selectedProjectId
  );

  const [baselineObsId, setBaselineObsId] = useState<string>(
    projectObservations[0]?.id || ''
  );
  const [targetObsId, setTargetObsId] = useState<string>(
    projectObservations[1]?.id || projectObservations[0]?.id || ''
  );

  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [comparisonResult, setComparisonResult] = useState<ImageComparisonResult | null>(null);
  const [comparisonError, setComparisonError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [savedComparisons, setSavedComparisons] = useState<ImageComparisonResult[]>([]);

  useEffect(() => {
    if (selectedProjectId) {
      getSavedComparisons(selectedProjectId)
        .then(setSavedComparisons)
        .catch(() => {});
    }
  }, [selectedProjectId]);

  const baselineObs = observations.find((o) => o.id === baselineObsId);
  const targetObs = observations.find((o) => o.id === targetObsId);
  const currentProject = projects.find((p) => p.id === selectedProjectId);

  const handleRunComparison = async () => {
    if (!baselineObs || !targetObs) return;

    setIsComparing(true);
    setComparisonError(null);

    try {
      const result = await compareImages({
        baselineImageDataUri: baselineObs.imageUrl,
        baselineDate: baselineObs.observationDate,
        baselineStage: baselineObs.selectedCategory,
        targetImageDataUri: targetObs.imageUrl,
        targetDate: targetObs.observationDate,
        targetStage: targetObs.selectedCategory,
        projectName: currentProject?.name,
        projectId: selectedProjectId,
      });
      setComparisonResult(result);
      getSavedComparisons(selectedProjectId).then(setSavedComparisons).catch(() => {});
    } catch (err: any) {
      setComparisonError(err.message || 'Comparison analysis failed.');
    } finally {
      setIsComparing(false);
    }
  };

  const handlePrintComparison = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="border-b border-stone-200 pb-4">
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
          <span className="font-mono text-stone-600">IS 456 / Quality Audit</span>
          <span aria-hidden="true" className="text-stone-300">·</span>
          <span>Temporal Computer Vision</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-semibold text-stone-900 tracking-tight">
          Historical Image Comparison & Progress Delta
        </h1>
        <p className="mt-0.5 text-xs sm:text-sm text-stone-600 max-w-3xl leading-relaxed">
          Pairwise side-by-side computer vision comparison over time. Identifies newly visible structural members, assesses viewpoint consistency, and evaluates milestone advancement.
        </p>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-xs border border-stone-200 shadow-xs space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Select Project Site
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                const first = observations.find((o) => o.projectId === e.target.value);
                if (first) {
                  setBaselineObsId(first.id);
                  setTargetObsId(first.id);
                }
                setComparisonResult(null);
              }}
              className="w-full text-xs px-2.5 py-1.5 rounded-xs border border-stone-300 bg-white text-stone-900 focus:outline-none focus:border-stone-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.projectCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Earlier Baseline Observation
            </label>
            <select
              value={baselineObsId}
              onChange={(e) => {
                setBaselineObsId(e.target.value);
                setComparisonResult(null);
              }}
              className="w-full text-xs px-2.5 py-1.5 rounded-xs border border-stone-300 bg-white text-stone-900 focus:outline-none focus:border-stone-500"
            >
              {projectObservations.map((obs) => (
                <option key={obs.id} value={obs.id}>
                  {obs.observationDate} — {obs.analysis?.predictedStageName || obs.selectedCategory}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Subsequent / Later Observation
            </label>
            <select
              value={targetObsId}
              onChange={(e) => {
                setTargetObsId(e.target.value);
                setComparisonResult(null);
              }}
              className="w-full text-xs px-2.5 py-1.5 rounded-xs border border-stone-300 bg-white text-stone-900 focus:outline-none focus:border-stone-500"
            >
              {projectObservations.map((obs) => (
                <option key={obs.id} value={obs.id}>
                  {obs.observationDate} — {obs.analysis?.predictedStageName || obs.selectedCategory}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100">
          <div className="flex items-center gap-3">
            <button
              onClick={handleRunComparison}
              disabled={isComparing || !baselineObs || !targetObs}
              className="px-4 py-2 text-xs font-medium text-white bg-amber-700 hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xs transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
            >
              {isComparing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Computing Visual Delta with Vision Model...</span>
                </>
              ) : (
                <span>Execute Pairwise Progress Comparison →</span>
              )}
            </button>

            {comparisonResult && (
              <button
                onClick={handlePrintComparison}
                className="px-3 py-2 text-xs font-medium text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-xs transition-colors cursor-pointer border border-stone-200"
              >
                Print / Export Report
              </button>
            )}
          </div>

          {/* Synchronized Zoom Control */}
          <div className="flex items-center gap-2 text-xs text-stone-600 font-medium">
            <span>Synchronized Zoom:</span>
            <button
              onClick={() => setZoomLevel((z) => Math.max(1, z - 0.25))}
              className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 rounded-xs text-xs font-mono font-medium cursor-pointer border border-stone-200"
            >
              -
            </button>
            <span className="font-mono tabular-nums text-xs text-stone-900 w-12 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
              className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 rounded-xs text-xs font-mono font-medium cursor-pointer border border-stone-200"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {comparisonError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xs text-xs text-rose-900">
          <div className="font-semibold mb-0.5">Comparison Execution Failed</div>
          {comparisonError}
        </div>
      )}

      {/* Side-by-Side Dual Image Viewport */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Baseline Card */}
        <div className="bg-white rounded-xs border border-stone-200 overflow-hidden shadow-xs">
          <div className="p-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs">
            <div>
              <span className="font-mono text-stone-500 mr-2 text-[11px]">SURVEY A</span>
              <strong className="text-stone-900 font-medium">Earlier Baseline Observation</strong>
            </div>
            <div className="font-mono text-stone-600 text-xs">
              {baselineObs?.observationDate || 'N/A'}
            </div>
          </div>

          <div className="relative bg-stone-900 overflow-hidden flex items-center justify-center min-h-[340px]">
            {baselineObs ? (
              <div
                className="transition-transform duration-150 origin-center"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <img
                  src={baselineObs.imageUrl}
                  alt={baselineObs.fileName}
                  referrerPolicy="no-referrer"
                  className="max-h-[360px] w-auto object-contain mx-auto"
                />
              </div>
            ) : (
              <div className="text-xs text-stone-400">No baseline selected</div>
            )}
          </div>

          <div className="p-3.5 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-medium text-stone-900">
                {baselineObs ? getStageById(baselineObs.selectedCategory).name : 'N/A'}
              </span>
              <span className="text-stone-500 font-mono text-[11px]">
                {baselineObs?.locationTag}
              </span>
            </div>
            <p className="text-stone-600 line-clamp-2 text-xs">
              {baselineObs?.notes || 'No recorded inspector notes.'}
            </p>
          </div>
        </div>

        {/* Target Card */}
        <div className="bg-white rounded-xs border border-stone-200 overflow-hidden shadow-xs">
          <div className="p-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs">
            <div>
              <span className="font-mono text-stone-500 mr-2 text-[11px]">SURVEY B</span>
              <strong className="text-stone-900 font-medium">Subsequent Observation</strong>
            </div>
            <div className="font-mono text-stone-600 text-xs">
              {targetObs?.observationDate || 'N/A'}
            </div>
          </div>

          <div className="relative bg-stone-900 overflow-hidden flex items-center justify-center min-h-[340px]">
            {targetObs ? (
              <div
                className="transition-transform duration-150 origin-center"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <img
                  src={targetObs.imageUrl}
                  alt={targetObs.fileName}
                  referrerPolicy="no-referrer"
                  className="max-h-[360px] w-auto object-contain mx-auto"
                />
              </div>
            ) : (
              <div className="text-xs text-stone-400">No target selected</div>
            )}
          </div>

          <div className="p-3.5 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-medium text-stone-900">
                {targetObs ? getStageById(targetObs.selectedCategory).name : 'N/A'}
              </span>
              <span className="text-stone-500 font-mono text-[11px]">
                {targetObs?.locationTag}
              </span>
            </div>
            <p className="text-stone-600 line-clamp-2 text-xs">
              {targetObs?.notes || 'No recorded inspector notes.'}
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Analysis Findings Card */}
      {comparisonResult && (
        <div className="bg-white p-5 rounded-xs border border-stone-200 shadow-xs space-y-5">
          <div className="border-b border-stone-200 pb-3.5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono text-stone-500">
                TEMPORAL PROGRESSION AUDIT
              </div>
              <h2 className="text-base font-semibold text-stone-900">
                Progress Delta Analysis ({comparisonResult.elapsedDays} Elapsed Days)
              </h2>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-stone-500">Viewpoint Alignment:</span>{' '}
                <span className="font-medium text-stone-900">
                  {comparisonResult.viewpointConsistency}
                </span>
              </div>
              <div className="h-3.5 w-px bg-stone-200" />
              <div>
                <span className="text-stone-500">Milestone Delta:</span>{' '}
                <span className="font-semibold text-amber-800 font-mono">
                  +{comparisonResult.estimatedProgressDeltaPercent}%
                </span>
              </div>
            </div>
          </div>

          {/* Three Structural Progression Dimensions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="p-3.5 rounded-xs border border-stone-200 bg-stone-50/50">
              <div className="text-[11px] font-mono text-stone-500">
                DIMENSION 1
              </div>
              <div className="text-xs font-semibold text-stone-900 mt-0.5">
                Observed Physical Changes
              </div>
              <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                {comparisonResult.visibleChangesSummary}
              </p>
            </div>

            <div className="p-3.5 rounded-xs border border-stone-200 bg-stone-50/50">
              <div className="text-[11px] font-mono text-stone-500">
                DIMENSION 2
              </div>
              <div className="text-xs font-semibold text-stone-900 mt-0.5">
                Stage Transition
              </div>
              <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                {comparisonResult.structuralProgressionNotes}
              </p>
            </div>

            <div className="p-3.5 rounded-xs border border-stone-200 bg-stone-50/50">
              <div className="text-[11px] font-mono text-stone-500">
                DIMENSION 3
              </div>
              <div className="text-xs font-semibold text-stone-900 mt-0.5">
                Verified Structural Readiness
              </div>
              <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                Requires lab cube compressive test certificates (7 and 28-day curing) and surveyor leveling benchmarks before billing sign-off.
              </p>
            </div>
          </div>

          {/* Newly Visible Elements List */}
          <div>
            <h3 className="text-xs font-medium text-stone-800 mb-1.5">
              Newly Visible Structural Elements:
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {comparisonResult.newlyVisibleElements.map((el, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-stone-100 border border-stone-200 rounded-xs text-xs text-stone-700"
                >
                  {el}
                </span>
              ))}
            </div>
          </div>

          {comparisonResult.viewpointLimitations && (
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xs text-xs text-stone-600">
              <strong className="text-stone-800 font-medium">Viewpoint Limitation:</strong> {comparisonResult.viewpointLimitations}
            </div>
          )}

          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xs text-xs text-amber-950">
            <strong className="font-medium">Milestone Progress Model Disclaimer:</strong>{' '}
            {comparisonResult.progressCalculationDisclaimer}
          </div>

          <div className="text-xs text-stone-800">
            <span className="font-semibold text-stone-900">Recommended Site Action:</span>{' '}
            {comparisonResult.recommendedSiteAction}
          </div>
        </div>
      )}

      {/* Saved Database Comparisons History */}
      {savedComparisons.length > 0 && (
        <div className="bg-white p-5 rounded-xs border border-stone-200 shadow-xs space-y-3.5">
          <h2 className="text-sm font-semibold text-stone-900">
            Saved Pairwise Comparisons Log (Database Archive)
          </h2>
          <div className="divide-y divide-stone-100">
            {savedComparisons.map((cmp) => (
              <div key={cmp.id} className="py-2.5 flex items-start justify-between gap-4 text-xs">
                <div>
                  <div className="font-medium text-stone-800">{cmp.visibleChangesSummary}</div>
                  <div className="text-stone-500 text-xs mt-0.5">
                    Elapsed: {cmp.elapsedDays} days · Alignment: {cmp.viewpointConsistency} · Timestamp: {cmp.comparedAt}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono font-medium text-amber-800">+{cmp.estimatedProgressDeltaPercent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
