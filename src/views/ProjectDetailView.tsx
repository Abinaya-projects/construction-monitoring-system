import React, { useState } from 'react';
import { Project, ImageObservation, ConstructionStageId } from '../types';
import { CONSTRUCTION_STAGES, getStageById } from '../constants/stages';
import { updateProject } from '../services/api';
import heroBgImage from '../assets/images/construction_site_tower_cranes_hero.png';

interface ProjectDetailViewProps {
  project: Project;
  observations: ImageObservation[];
  onBack: () => void;
  onNavigateUpload: (projectId: string) => void;
  onSelectObservation: (obs: ImageObservation) => void;
  onProjectUpdated: (project: Project) => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project,
  observations,
  onBack,
  onNavigateUpload,
  onSelectObservation,
  onProjectUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'gallery' | 'milestones' | 'info'>('timeline');

  // Date range filter state for observations
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Milestone weights configuration state
  const initialWeights: Record<string, number> = {};
  CONSTRUCTION_STAGES.forEach((s) => {
    initialWeights[s.id] = project.milestoneWeights?.[s.id] ?? s.defaultMilestoneWeight;
  });
  const [weights, setWeights] = useState<Record<string, number>>(initialWeights);
  const [isEditingWeights, setIsEditingWeights] = useState(false);
  const [weightSaveMsg, setWeightSaveMsg] = useState<string | null>(null);

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  const handleSaveWeights = async () => {
    try {
      const updated = await updateProject(project.id, {
        milestoneWeights: weights as any,
      });
      onProjectUpdated(updated);
      setIsEditingWeights(false);
      setWeightSaveMsg('Milestone weights successfully updated.');
      setTimeout(() => setWeightSaveMsg(null), 3000);
    } catch (err: any) {
      alert('Failed to update weights: ' + err.message);
    }
  };

  const projectObservations = observations.filter((o) => o.projectId === project.id);

  // Available observation dates for timeframe bounding
  const observationDates = projectObservations
    .map((o) => o.observationDate)
    .filter(Boolean)
    .sort();
  const minObsDate = observationDates[0] || '';
  const maxObsDate = observationDates[observationDates.length - 1] || '';

  const isFilterActive = Boolean(startDateFilter || endDateFilter || stageFilter !== 'ALL');

  // Filter observations by date range and optional stage
  const filteredObservations = projectObservations.filter((obs) => {
    if (startDateFilter && obs.observationDate < startDateFilter) return false;
    if (endDateFilter && obs.observationDate > endDateFilter) return false;
    if (stageFilter !== 'ALL' && obs.selectedCategory !== stageFilter) return false;
    return true;
  });

  // Sort observations chronologically
  const sortedObservations = [...filteredObservations].sort((a, b) => {
    const cmp = a.observationDate.localeCompare(b.observationDate);
    return sortOrder === 'asc' ? cmp : -cmp;
  });

  const handleClearFilters = () => {
    setStartDateFilter('');
    setEndDateFilter('');
    setStageFilter('ALL');
  };

  return (
    <div className="space-y-6">
      {/* Project Overview Hero Banner with Tower Cranes Photography */}
      <div className="relative overflow-hidden rounded-xs border border-stone-200 shadow-xs">
        <img
          src={heroBgImage}
          alt="Site construction with tower cranes"
          className="absolute inset-0 w-full h-full object-cover object-[center_35%] pointer-events-none select-none"
          referrerPolicy="no-referrer"
          loading="eager"
        />
        <div className="absolute inset-0 bg-stone-950/80 sm:bg-gradient-to-r sm:from-stone-950/90 sm:via-stone-950/80 sm:to-stone-950/65" />

        <div className="relative z-10 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-300">
              <button
                onClick={onBack}
                className="hover:text-amber-400 cursor-pointer font-medium transition-colors flex items-center gap-1"
              >
                ← Projects Register
              </button>
              <span aria-hidden="true" className="text-stone-500">/</span>
              <span className="font-mono text-amber-400 font-semibold text-xs bg-stone-900/90 px-2 py-0.5 rounded-xs border border-amber-500/30">
                {project.projectCode}
              </span>
              <span className="text-[11px] px-2 py-0.5 font-medium rounded-xs border bg-emerald-950/80 text-emerald-300 border-emerald-700/60">
                {project.status === 'ACTIVE' ? 'Active Site' : project.status}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white tracking-tight drop-shadow-xs">
              {project.name}
            </h1>
            <div className="text-xs text-stone-300 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="flex items-center gap-1.5">
                <span className="text-amber-500">📍</span>
                <span>{project.location}</span>
              </span>
              <span aria-hidden="true" className="text-stone-500 hidden sm:inline">·</span>
              <span className="hidden sm:inline">Client: <strong className="text-stone-100 font-medium">{project.clientName || 'Private Developer'}</strong></span>
              <span aria-hidden="true" className="text-stone-500 hidden sm:inline">·</span>
              <span className="hidden sm:inline">Contractor: <strong className="text-stone-100 font-medium">{project.contractorName || 'EPC Joint Venture'}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateUpload(project.id)}
              className="px-3.5 py-2 text-xs font-medium text-white bg-amber-700 hover:bg-amber-800 rounded-xs transition-colors cursor-pointer shadow-xs whitespace-nowrap"
            >
              + Log Inspection Photo
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 p-0.5 bg-stone-100 rounded-xs border border-stone-200 max-w-fit">
        {[
          {
            id: 'timeline',
            label: `Timeline (${sortedObservations.length}${
              isFilterActive && sortedObservations.length !== projectObservations.length
                ? ` / ${projectObservations.length}`
                : ''
            })`,
          },
          { id: 'gallery', label: `Gallery (${sortedObservations.length})` },
          { id: 'milestones', label: 'Milestone Weight Model' },
          { id: 'info', label: 'Specifications & Specs' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 text-xs font-medium rounded-xs transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-stone-900 text-stone-100 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Date Range & Timeframe Filter Control Bar (Applies to Timeline & Gallery) */}
      {(activeTab === 'timeline' || activeTab === 'gallery') && (
        <div className="bg-white p-3.5 rounded-xs border border-stone-200 shadow-xs space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-stone-700 font-medium">
              <span>Filter Observations Timeframe:</span>
              {minObsDate && maxObsDate && (
                <span className="font-mono text-stone-500 text-[11px]">
                  ({minObsDate} → {maxObsDate})
                </span>
              )}
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                onClick={handleClearFilters}
                className={`px-2 py-1 rounded-xs text-xs font-medium transition-colors cursor-pointer ${
                  !isFilterActive
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => {
                  setStartDateFilter('2025-01-01');
                  setEndDateFilter('2025-12-31');
                }}
                className={`px-2 py-1 rounded-xs text-xs font-medium transition-colors cursor-pointer ${
                  startDateFilter === '2025-01-01' && endDateFilter === '2025-12-31'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Year 2025
              </button>
              <button
                onClick={() => {
                  setStartDateFilter('2026-01-01');
                  setEndDateFilter('2026-12-31');
                }}
                className={`px-2 py-1 rounded-xs text-xs font-medium transition-colors cursor-pointer ${
                  startDateFilter === '2026-01-01' && endDateFilter === '2026-12-31'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Year 2026
              </button>
              {minObsDate && (
                <button
                  onClick={() => {
                    setStartDateFilter(minObsDate);
                    const d = new Date(minObsDate);
                    d.setDate(d.getDate() + 60);
                    setEndDateFilter(d.toISOString().slice(0, 10));
                  }}
                  className="px-2 py-1 rounded-xs text-xs font-medium bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
                >
                  Initial Phase (60d)
                </button>
              )}
            </div>
          </div>

          {/* Date Picker Form Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2.5 border-t border-stone-100 text-xs">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-xs text-xs font-mono text-stone-800 bg-white focus:outline-none focus:border-stone-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-xs text-xs font-mono text-stone-800 bg-white focus:outline-none focus:border-stone-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Milestone Stage
              </label>
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-xs text-xs text-stone-800 bg-white focus:outline-none focus:border-stone-500"
              >
                <option value="ALL">All Stages ({projectObservations.length})</option>
                {CONSTRUCTION_STAGES.map((stg) => {
                  const cnt = projectObservations.filter((o) => o.selectedCategory === stg.id).length;
                  return (
                    <option key={stg.id} value={stg.id}>
                      {stg.name} ({cnt})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex-1 py-1.5 px-2 text-xs font-medium border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-xs transition-colors cursor-pointer"
              >
                {sortOrder === 'asc' ? 'Chronological ↑' : 'Reverse ↓'}
              </button>

              {isFilterActive && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="py-1.5 px-3 text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xs transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {isFilterActive && (
            <div className="flex items-center justify-between text-xs text-stone-600 bg-stone-50 px-3 py-1.5 rounded-xs border border-stone-200">
              <div className="flex items-center gap-2">
                <span className="font-medium text-stone-900">
                  Showing {sortedObservations.length} of {projectObservations.length} observations
                </span>
                {(startDateFilter || endDateFilter) && (
                  <span className="font-mono text-stone-500 text-[11px]">
                    [{startDateFilter || 'Start'} → {endDateFilter || 'Present'}]
                  </span>
                )}
                {stageFilter !== 'ALL' && (
                  <span className="text-amber-800 font-medium">
                    · Stage: {getStageById(stageFilter as any).name}
                  </span>
                )}
              </div>
              <button
                onClick={handleClearFilters}
                className="text-amber-800 hover:text-amber-950 font-medium underline cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 1: Chronological Timeline */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xs border border-stone-200 shadow-xs">
            <h2 className="text-sm font-semibold text-stone-900 mb-4">
              Site Inspection Sequence & Progress Log
            </h2>

            {projectObservations.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-500">
                No observations recorded yet for this project.{' '}
                <button
                  onClick={() => onNavigateUpload(project.id)}
                  className="text-amber-800 font-medium underline cursor-pointer"
                >
                  Upload the first site photograph.
                </button>
              </div>
            ) : sortedObservations.length === 0 ? (
              <div className="p-8 text-center bg-stone-50 rounded-xs border border-stone-200 space-y-2">
                <div className="text-xs font-semibold text-stone-800">
                  No photographic observations match the selected date range
                </div>
                <div className="text-xs text-stone-500 font-mono">
                  Timeframe: {startDateFilter || 'Start'} to {endDateFilter || 'End'}
                </div>
                <button
                  onClick={handleClearFilters}
                  className="mt-2 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-300 hover:bg-stone-50 rounded-xs cursor-pointer"
                >
                  Reset Date Filter
                </button>
              </div>
            ) : (
              <div className="relative border-l border-stone-300 ml-3 space-y-6 py-2">
                {sortedObservations.map((obs) => {
                  const stageObj = getStageById(obs.selectedCategory);
                  return (
                    <div key={obs.id} className="relative pl-5">
                      {/* Technical Survey Pin */}
                      <span className="absolute -left-[5px] top-2.5 w-2.5 h-2.5 bg-stone-900 border border-amber-500 rounded-none" />

                      <div
                        onClick={() => onSelectObservation(obs)}
                        className="bg-white hover:bg-stone-50 p-4 rounded-xs border border-stone-200 hover:border-stone-400 transition-colors cursor-pointer flex flex-col md:flex-row gap-4 items-start shadow-xs"
                      >
                        <img
                          src={obs.imageUrl}
                          alt={obs.fileName}
                          referrerPolicy="no-referrer"
                          className="w-28 h-20 object-cover rounded-xs border border-stone-200 shrink-0 bg-stone-100"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-stone-900">
                              {stageObj.name}
                            </span>
                            <span className="font-mono text-xs text-stone-700">
                              {obs.observationDate}
                            </span>
                          </div>

                          <div className="text-xs text-stone-600 mt-1 leading-relaxed">
                            {obs.notes || 'No inspector field remarks logged.'}
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-stone-500">
                            <span>Inspector: {obs.inspectorName}</span>
                            <span aria-hidden="true" className="text-stone-300">·</span>
                            <span className="font-mono">{obs.locationTag || 'General Site'}</span>
                            {obs.hasMismatchAlert && (
                              <>
                                <span aria-hidden="true" className="text-stone-300">·</span>
                                <span className="font-medium text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded-xs border border-amber-200 text-[11px]">
                                  Stage Discrepancy Flagged
                                </span>
                              </>
                            )}
                            {obs.analysis?.isHumanVerified && (
                              <>
                                <span aria-hidden="true" className="text-stone-300">·</span>
                                <span className="font-medium text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-xs border border-emerald-200 text-[11px]">
                                  QA/QC Verified
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Gallery View */}
      {activeTab === 'gallery' && (
        <>
          {sortedObservations.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xs border border-stone-200 space-y-2">
              <div className="text-xs font-medium text-stone-700">
                No photographs in gallery match the active timeframe filter
              </div>
              <button
                onClick={handleClearFilters}
                className="mt-2 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xs cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {sortedObservations.map((obs) => (
                <div
                  key={obs.id}
                  onClick={() => onSelectObservation(obs)}
                  className="bg-white rounded-xs border border-stone-200 overflow-hidden shadow-xs hover:border-stone-400 transition-colors cursor-pointer group"
                >
                  <div className="h-44 bg-stone-100 overflow-hidden border-b border-stone-200">
                    <img
                      src={obs.imageUrl}
                      alt={obs.fileName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 text-xs">
                    <div className="font-semibold text-stone-900 truncate">
                      {getStageById(obs.selectedCategory).name}
                    </div>
                    <div className="flex items-center justify-between text-xs text-stone-500 mt-1">
                      <span className="font-mono">{obs.observationDate}</span>
                      <span className="font-mono truncate max-w-[140px]">{obs.locationTag}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Tab 3: Configurable Milestone Weights */}
      {activeTab === 'milestones' && (
        <div className="bg-white p-5 rounded-xs border border-stone-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-3.5">
            <div>
              <h2 className="text-sm font-semibold text-stone-900">
                Milestone Progress Weight Model (IS 456 / CPWD Standard)
              </h2>
              <p className="text-xs text-stone-500 max-w-2xl mt-0.5">
                Physical progress is computed from transparent, contractual milestone weightings according to Indian Standards and CPWD contract schedules.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isEditingWeights ? (
                <>
                  <button
                    onClick={() => setIsEditingWeights(false)}
                    className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveWeights}
                    className="px-3.5 py-1.5 text-xs font-medium text-white bg-amber-700 hover:bg-amber-800 rounded-xs transition-colors cursor-pointer"
                  >
                    Save Weights
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditingWeights(true)}
                  className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xs transition-colors cursor-pointer"
                >
                  Edit Weights
                </button>
              )}
            </div>
          </div>

          {weightSaveMsg && (
            <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs rounded-xs border border-emerald-200">
              {weightSaveMsg}
            </div>
          )}

          <div className="space-y-2">
            {CONSTRUCTION_STAGES.filter((s) => s.id !== 'STAGE_10_UNCLEAR').map((stage) => {
              const currentVal = weights[stage.id] || 0;
              return (
                <div
                  key={stage.id}
                  className="flex items-center justify-between p-3 rounded-xs border border-stone-200 bg-stone-50/50 text-xs"
                >
                  <div className="max-w-md">
                    <span className="font-mono text-stone-500 mr-2">{stage.code}</span>
                    <strong className="text-stone-900 font-medium">{stage.name}</strong>
                    <div className="text-xs text-stone-500 mt-0.5">
                      {stage.description}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isEditingWeights ? (
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={currentVal}
                        onChange={(e) =>
                          setWeights({
                            ...weights,
                            [stage.id]: parseInt(e.target.value, 10) || 0,
                          })
                        }
                        className="w-16 p-1 text-center font-mono text-xs border border-stone-300 rounded-xs bg-white text-stone-900"
                      />
                    ) : (
                      <span className="font-mono font-semibold text-stone-900 tabular-nums">
                        {currentVal}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-xs font-medium text-stone-900">
              <span>Aggregate Milestone Budget Allocation:</span>
              <span className={`font-mono font-semibold ${totalWeight === 100 ? 'text-emerald-800' : 'text-amber-800'}`}>
                {totalWeight}% {totalWeight !== 100 && '(Recommended sum: 100%)'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Project Info */}
      {activeTab === 'info' && (
        <div className="bg-white p-5 rounded-xs border border-stone-200 shadow-xs space-y-4">
          <h2 className="text-sm font-semibold text-stone-900">
            Project Technical Specifications
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-stone-50 rounded-xs border border-stone-200">
              <span className="text-stone-500 block mb-0.5">Client Organization</span>
              <span className="font-medium text-stone-900">{project.clientName}</span>
            </div>
            <div className="p-3 bg-stone-50 rounded-xs border border-stone-200">
              <span className="text-stone-500 block mb-0.5">Lead Civil Contractor</span>
              <span className="font-medium text-stone-900">{project.contractorName}</span>
            </div>
            <div className="p-3 bg-stone-50 rounded-xs border border-stone-200">
              <span className="text-stone-500 block mb-0.5">Commencement Date</span>
              <span className="font-medium font-mono text-stone-900">{project.startDate}</span>
            </div>
            <div className="p-3 bg-stone-50 rounded-xs border border-stone-200">
              <span className="text-stone-500 block mb-0.5">Target Completion</span>
              <span className="font-medium font-mono text-stone-900">
                {project.expectedCompletionDate || 'Under Schedule Review'}
              </span>
            </div>
          </div>
          <div className="p-3.5 bg-stone-50 rounded-xs border border-stone-200 text-xs text-stone-700 leading-relaxed">
            <strong className="block mb-1 text-stone-900 font-medium">Engineering Brief:</strong>
            {project.description}
          </div>
        </div>
      )}
    </div>
  );
};
