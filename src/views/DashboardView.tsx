import React, { useState, useEffect } from 'react';
import {
  Project,
  ImageObservation,
  ReviewAlert,
  DailySiteReport,
  ConstructionMilestone,
  LabourAttendanceRecord,
  MaterialInventoryItem,
  ProjectFinancials,
  SafetyIncidentItem,
  ProjectDocumentItem,
} from '../types';
import { CONSTRUCTION_STAGES, getStageById } from '../constants/stages';
import {
  INITIAL_DAILY_REPORTS,
  INITIAL_MILESTONES,
  INITIAL_LABOUR_ATTENDANCE,
  INITIAL_MATERIALS_INVENTORY,
  INITIAL_PROJECT_FINANCIALS,
  INITIAL_SAFETY_INCIDENTS,
  INITIAL_DOCUMENTS,
} from '../data/constructionSiteData';
import heroBgImage from '../assets/images/construction_site_tower_cranes_hero.png';

interface DashboardViewProps {
  projects: Project[];
  observations: ImageObservation[];
  alerts: ReviewAlert[];
  onNavigate: (view: string, projectId?: string) => void;
  onSelectObservation: (obs: ImageObservation) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  observations,
  alerts,
  onNavigate,
  onSelectObservation,
}) => {
  // Spotlight project selection
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projects[0]?.id || 'proj-blr-01'
  );

  // Active Construction Module Tab
  const [activeModuleTab, setActiveModuleTab] = useState<
    'schedule' | 'dpr' | 'labour' | 'materials' | 'cost' | 'safety' | 'documents' | 'vision'
  >('schedule');

  // State for construction-specific modules (with localStorage persistence)
  const [dailyReports, setDailyReports] = useState<DailySiteReport[]>(() => {
    const saved = localStorage.getItem('buildsight_daily_reports');
    return saved ? JSON.parse(saved) : INITIAL_DAILY_REPORTS;
  });

  const [milestones] = useState<ConstructionMilestone[]>(() => {
    const saved = localStorage.getItem('buildsight_milestones');
    return saved ? JSON.parse(saved) : INITIAL_MILESTONES;
  });

  const [labourRecords] = useState<LabourAttendanceRecord[]>(() => {
    const saved = localStorage.getItem('buildsight_labour');
    return saved ? JSON.parse(saved) : INITIAL_LABOUR_ATTENDANCE;
  });

  const [materials, setMaterials] = useState<MaterialInventoryItem[]>(() => {
    const saved = localStorage.getItem('buildsight_materials');
    return saved ? JSON.parse(saved) : INITIAL_MATERIALS_INVENTORY;
  });

  const [safetyIncidents, setSafetyIncidents] = useState<SafetyIncidentItem[]>(() => {
    const saved = localStorage.getItem('buildsight_safety');
    return saved ? JSON.parse(saved) : INITIAL_SAFETY_INCIDENTS;
  });

  const [documents] = useState<ProjectDocumentItem[]>(INITIAL_DOCUMENTS);

  // Modal dialog states for adding records
  const [showAddDprModal, setShowAddDprModal] = useState(false);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [showAddSafetyModal, setShowAddSafetyModal] = useState(false);

  // Form states for modals
  const [newDprSummary, setNewDprSummary] = useState('');
  const [newDprActivities, setNewDprActivities] = useState('');
  const [newDprDelays, setNewDprDelays] = useState('');

  const [newMatCode, setNewMatCode] = useState('TMT-FE500D');
  const [newMatQty, setNewMatQty] = useState<number>(10);
  const [newMatNotes, setNewMatNotes] = useState('');

  const [newSafetyDesc, setNewSafetyDesc] = useState('');
  const [newSafetySeverity, setNewSafetySeverity] = useState<'INFO' | 'LOW' | 'MEDIUM' | 'HIGH'>('LOW');

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('buildsight_daily_reports', JSON.stringify(dailyReports));
  }, [dailyReports]);

  useEffect(() => {
    localStorage.setItem('buildsight_materials', JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem('buildsight_safety', JSON.stringify(safetyIncidents));
  }, [safetyIncidents]);

  const activeProject =
    projects.find((p) => p.id === selectedProjectId) || projects[0] || {
      id: 'proj-blr-01',
      projectCode: 'BLR-TECH-T3',
      name: 'Bangalore CyberPark Tower 3',
      location: 'Electronic City Phase II, Bengaluru, Karnataka, India',
      clientName: 'Infosys Horizon Infrastructure Pvt Ltd',
      contractorName: 'Larsen & Toubro ECC Division',
      description: 'Commercial G+14 IT Park with dual basement parking.',
      startDate: '2025-04-15',
      expectedCompletionDate: '2027-03-31',
      status: 'ACTIVE',
      currentEstimatedProgress: 42,
      createdAt: '',
      updatedAt: '',
    };

  const projectObservations = observations.filter((o) => o.projectId === activeProject.id);
  const pendingAlerts = alerts.filter((a) => a.status === 'PENDING_REVIEW');
  const projectFinancials: ProjectFinancials =
    INITIAL_PROJECT_FINANCIALS[activeProject.id] || INITIAL_PROJECT_FINANCIALS['proj-blr-01'];

  // Calculate real stage distribution
  const stageCounts: Record<string, number> = {};
  observations.forEach((o) => {
    const stage = o.analysis?.predictedStage || o.selectedCategory;
    stageCounts[stage] = (stageCounts[stage] || 0) + 1;
  });

  // Calculate days elapsed and remaining
  const startDate = new Date(activeProject.startDate);
  const finishDate = new Date(activeProject.expectedCompletionDate);
  const now = new Date();
  const totalDays = Math.max(1, Math.round((finishDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)));
  const elapsedDays = Math.max(0, Math.round((now.getTime() - startDate.getTime()) / (1000 * 3600 * 24)));
  const daysRemaining = Math.max(0, Math.round((finishDate.getTime() - now.getTime()) / (1000 * 3600 * 24)));
  const plannedProgressPercent = Math.min(100, Math.round((elapsedDays / totalDays) * 100));
  const progressVariance = activeProject.currentEstimatedProgress - plannedProgressPercent;

  // Active labour count for today
  const totalLabourDeployed = labourRecords
    .filter((l) => l.projectId === activeProject.id)
    .reduce((acc, curr) => acc + curr.actualCount, 0);

  const handleAddDpr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDprSummary.trim()) return;

    const newReport: DailySiteReport = {
      id: `dpr-${Date.now()}`,
      projectId: activeProject.id,
      date: new Date().toISOString().slice(0, 10),
      shift: 'DAY',
      weather: 'Clear / 28°C',
      temperature: '28°C',
      residentEngineer: 'Er. Rajesh K. Sharma',
      shiftSupervisor: 'Site QA/QC Engineer',
      summary: newDprSummary,
      activitiesCompleted: newDprActivities
        ? newDprActivities.split('\n').filter(Boolean)
        : ['Concreting works inspected', 'Rebar placement verified'],
      equipmentDeployed: [
        { name: 'Potain Tower Crane TC-1', hoursOperated: 8.0, status: 'OPERATIONAL' },
        { name: 'Boom Pump 36m', hoursOperated: 4.5, status: 'OPERATIONAL' },
      ],
      safetyObservations: 'All personnel wearing PPE. Scaffolding tag inspection verified.',
      materialsReceivedSummary: 'Daily material intake logged in site ledger.',
      delaysOrBottlenecks: newDprDelays.trim() || undefined,
      photoUrl: '/src/assets/images/construction_superstructure_stage_1792592933145.jpg',
    };

    setDailyReports([newReport, ...dailyReports]);
    setNewDprSummary('');
    setNewDprActivities('');
    setNewDprDelays('');
    setShowAddDprModal(false);
  };

  const handleAddMaterialReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    setMaterials(
      materials.map((m) => {
        if (m.itemCode === newMatCode && m.projectId === activeProject.id) {
          return {
            ...m,
            currentStock: m.currentStock + newMatQty,
            lastDeliveryDate: new Date().toISOString().slice(0, 10),
          };
        }
        return m;
      })
    );
    setShowAddMaterialModal(false);
    setNewMatNotes('');
  };

  const handleAddSafetyObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSafetyDesc.trim()) return;

    const newIncident: SafetyIncidentItem = {
      id: `sft-${Date.now()}`,
      projectId: activeProject.id,
      date: new Date().toISOString().slice(0, 10),
      type: 'HOUSEKEEPING',
      severity: newSafetySeverity,
      description: newSafetyDesc,
      actionTaken: 'Rectification notice issued to field subcontractor. Hazard mitigated.',
      reportedBy: 'Site Engineer On-Duty',
      status: 'OPEN',
    };

    setSafetyIncidents([newIncident, ...safetyIncidents]);
    setNewSafetyDesc('');
    setShowAddSafetyModal(false);
  };

  return (
    <div className="space-y-5">
      {/* 1. PROJECT OVERVIEW & SITE HERO (With Authentic Architectural Construction Photography) */}
      <section className="bg-white border border-stone-200 rounded-xs overflow-hidden shadow-xs">
        {/* Hero Background Banner: Large Building Under Construction with Tower Cranes */}
        <div className="relative overflow-hidden border-b border-stone-200 min-h-[175px] sm:min-h-[190px] flex flex-col justify-between">
          {/* Authentic Architectural Background Photograph */}
          <img
            src={heroBgImage}
            alt="Multi-story commercial construction site with tower cranes and reinforced concrete frame"
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none"
            referrerPolicy="no-referrer"
            loading="eager"
          />

          {/* Neutral Translucent Dark Charcoal Scrim Overlay (Ensures WCAG AA Text Contrast & Excellent Readability) */}
          <div className="absolute inset-0 bg-stone-950/75 sm:bg-gradient-to-r sm:from-stone-950/90 sm:via-stone-950/80 sm:to-stone-950/65" />

          {/* Content Layer (Foreground z-10) */}
          <div className="relative z-10 p-5 sm:p-6 flex flex-col md:flex-row md:items-start justify-between gap-5">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-semibold bg-stone-900/90 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded-xs">
                  {activeProject.projectCode}
                </span>
                <span className="text-[11px] px-2 py-0.5 font-medium rounded-xs border bg-emerald-950/80 text-emerald-300 border-emerald-700/60">
                  {activeProject.status === 'ACTIVE' ? 'Active Site' : activeProject.status} · {progressVariance >= 0 ? 'On Schedule' : 'Minor Variance'}
                </span>
                <span className="text-xs text-stone-300 hidden sm:inline">
                  IS 456 / NBC 2016 Certified
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white tracking-tight drop-shadow-xs">
                {activeProject.name}
              </h1>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-300">
                <span className="flex items-center gap-1.5">
                  <span className="text-amber-500">📍</span>
                  <span>{activeProject.location}</span>
                </span>
                <span aria-hidden="true" className="text-stone-500 hidden sm:inline">·</span>
                <span className="text-stone-300 hidden sm:inline">
                  Contractor: <strong className="text-stone-100 font-medium">{activeProject.contractorName}</strong>
                </span>
              </div>
            </div>

            {/* Right Controls: Site Selector (Styled with Dark Translucent Background) & Quick Action */}
            <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center gap-2.5 shrink-0">
              <div className="flex items-center gap-2 bg-stone-900/85 backdrop-blur-xs p-1.5 rounded-xs border border-stone-700/80">
                <label className="text-xs font-medium text-stone-300 pl-1 whitespace-nowrap">
                  Site:
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="h-7 px-2 bg-stone-950 text-stone-100 border border-stone-700 rounded-xs text-xs font-medium focus:outline-none focus:border-amber-500 cursor-pointer min-w-[200px]"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.projectCode}] {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => onNavigate('upload')}
                className="h-9 px-3.5 text-xs font-medium text-white bg-amber-700 hover:bg-amber-800 rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs whitespace-nowrap"
              >
                <span>+ Log Observation</span>
              </button>
            </div>
          </div>

          {/* Sub-hero Operational Highlights Strip */}
          <div className="relative z-10 px-5 sm:px-6 py-2 bg-stone-950/60 border-t border-stone-800/80 backdrop-blur-xs flex flex-wrap items-center justify-between gap-3 text-xs text-stone-300">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                <span>Physical Progress: <strong className="font-mono text-white tabular-nums">{activeProject.currentEstimatedProgress}%</strong></span>
              </span>
              <span aria-hidden="true" className="text-stone-600 hidden sm:inline">|</span>
              <span className="hidden sm:inline">
                Target Handover: <strong className="font-mono text-stone-200">{activeProject.expectedCompletionDate}</strong>
              </span>
              <span aria-hidden="true" className="text-stone-600 hidden md:inline">|</span>
              <span className="hidden md:inline">
                Indexed Surveys: <strong className="font-mono text-stone-200">{projectObservations.length} captures</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-stone-400 font-mono">
              <span>HSE Metric: 482.5k LTI-Free Hours</span>
            </div>
          </div>
        </div>

        {/* 4-Panel Structured Grid: Stakeholders, Schedule, Financials, Field Status (Clean Light Background) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-stone-200 text-xs bg-white">
          {/* Panel 1: Structured Stakeholder Matrix (2-column layout, clear role vs name) */}
          <div className="p-4 sm:p-5 space-y-3">
            <div className="font-semibold text-stone-900 flex items-center justify-between pb-1.5 border-b border-stone-100">
              <span>Project Stakeholders</span>
              <span className="text-[11px] text-stone-400 font-normal">EPC Contract</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <div>
                <span className="text-[11px] text-stone-500 block">Principal Client</span>
                <span className="font-semibold text-stone-900 block leading-tight">
                  {activeProject.clientName}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-stone-500 block">EPC Contractor</span>
                <span className="font-semibold text-stone-800 block leading-tight">
                  {activeProject.contractorName}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-stone-500 block">Resident Engineer</span>
                <span className="font-medium text-stone-800 block leading-tight">
                  Er. Rajesh K. Sharma (QA/QC Lead)
                </span>
              </div>
              <div>
                <span className="text-[11px] text-stone-500 block">Safety & HSE Officer</span>
                <span className="font-medium text-stone-800 block leading-tight">
                  Er. K. Ramanathan
                </span>
              </div>
            </div>
          </div>

          {/* Panel 2: Schedule & Milestones */}
          <div className="p-4 sm:p-5 space-y-3">
            <div className="font-semibold text-stone-900 flex items-center justify-between pb-1.5 border-b border-stone-100">
              <span>Schedule Performance</span>
              <span className="text-[11px] font-mono text-stone-600">SPI: 0.96</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline">
                <span className="text-stone-500">Physical Progress:</span>
                <span className="font-mono font-bold text-stone-900 text-sm">
                  {activeProject.currentEstimatedProgress}%
                </span>
              </div>
              <div className="w-full bg-stone-100 h-2 rounded-xs overflow-hidden border border-stone-200">
                <div
                  className="bg-amber-700 h-full transition-all duration-300"
                  style={{ width: `${activeProject.currentEstimatedProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-stone-500 pt-0.5">
                <span>Target: {plannedProgressPercent}%</span>
                <span className={progressVariance >= 0 ? 'text-emerald-700 font-medium' : 'text-amber-800 font-medium'}>
                  {progressVariance >= 0 ? 'On Target' : `${progressVariance}% variance`}
                </span>
              </div>
            </div>

            <div className="pt-1.5 border-t border-stone-100 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-stone-500 block">Target Finish</span>
                <span className="font-mono text-stone-800 font-medium">{activeProject.expectedCompletionDate}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Days Remaining</span>
                <span className="font-mono text-stone-800 font-medium">{daysRemaining} days</span>
              </div>
            </div>
          </div>

          {/* Panel 3: Financial & Commercial Utilization */}
          <div className="p-4 sm:p-5 space-y-3">
            <div className="font-semibold text-stone-900 flex items-center justify-between pb-1.5 border-b border-stone-100">
              <span>Commercial & Billing</span>
              <span className="text-[11px] font-mono text-stone-600">CPI: 1.02</span>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-stone-500 text-[11px] block">Contract Value</span>
                <span className="font-mono font-bold text-stone-900 text-sm">
                  ₹{projectFinancials.totalContractValue.toFixed(2)} Cr
                </span>
              </div>
              <div>
                <span className="text-stone-500 text-[11px] block">Certified Milestone Billing</span>
                <div className="flex items-center justify-between font-mono font-medium text-stone-800">
                  <span>₹{projectFinancials.certifiedMilestoneBilling.toFixed(2)} Cr</span>
                  <span className="text-stone-500 text-[11px]">({projectFinancials.budgetUtilizationPercent}%)</span>
                </div>
              </div>
              <div className="pt-1 border-t border-stone-100 flex justify-between text-[11px] text-stone-600">
                <span>Retention Withheld (5%):</span>
                <span className="font-mono">₹{projectFinancials.retentionWithheld.toFixed(2)} Cr</span>
              </div>
            </div>
          </div>

          {/* Panel 4: Operations Overview & Navigation Actions */}
          <div className="p-4 sm:p-5 space-y-3 flex flex-col justify-between">
            <div>
              <div className="font-semibold text-stone-900 pb-1.5 border-b border-stone-100 flex items-center justify-between">
                <span>Field Operations Summary</span>
                <span className="text-[11px] text-emerald-700 font-medium">Safe Site</span>
              </div>
              <div className="space-y-1.5 pt-1.5 text-stone-700">
                <div className="flex justify-between">
                  <span className="text-stone-500">Workers on Site:</span>
                  <span className="font-mono font-semibold text-stone-900">{totalLabourDeployed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Indexed Site Photos:</span>
                  <span className="font-mono font-semibold text-stone-900">{projectObservations.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Discrepancy Alerts:</span>
                  <span className={`font-mono font-semibold ${pendingAlerts.length > 0 ? 'text-amber-800' : 'text-stone-900'}`}>
                    {pendingAlerts.length} Pending
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-1.5">
              <button
                onClick={() => onNavigate('upload', activeProject.id)}
                className="w-full py-1.5 px-3 text-xs font-medium bg-amber-700 hover:bg-amber-800 active:bg-amber-900 text-white rounded-sm transition-colors cursor-pointer text-center"
              >
                + Log Site Inspection
              </button>
              <button
                onClick={() => onNavigate('projects', activeProject.id)}
                className="w-full py-1.5 px-3 text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-sm transition-colors cursor-pointer text-center"
              >
                Open Project Details →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. COMPACT SUMMARY STRIP (Clean single row with vertical dividers, no repetitive floating cards) */}
      <section className="bg-white border border-stone-200 rounded-sm divide-y sm:divide-y-0 sm:divide-x divide-stone-200 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 text-xs">
        <div className="p-3 sm:p-3.5">
          <div className="text-[11px] text-stone-500 font-medium">Total Projects</div>
          <div className="text-lg font-bold font-mono text-stone-900 mt-0.5">
            {projects.length}
          </div>
          <div className="text-[11px] text-stone-500 truncate mt-0.5">
            {projects.filter((p) => p.status === 'ACTIVE').length} Active Sites
          </div>
        </div>

        <div className="p-3 sm:p-3.5">
          <div className="text-[11px] text-stone-500 font-medium">Physical Progress</div>
          <div className="text-lg font-bold font-mono text-stone-900 mt-0.5">
            {activeProject.currentEstimatedProgress}%
          </div>
          <div className="text-[11px] text-stone-500 truncate mt-0.5">
            Target: {plannedProgressPercent}%
          </div>
        </div>

        <div className="p-3 sm:p-3.5">
          <div className="text-[11px] text-stone-500 font-medium">Site Photos Indexed</div>
          <div className="text-lg font-bold font-mono text-stone-900 mt-0.5">
            {observations.length}
          </div>
          <div className="text-[11px] text-stone-500 truncate mt-0.5">
            SHA-256 Digest Verified
          </div>
        </div>

        <div className="p-3 sm:p-3.5">
          <div className="text-[11px] text-stone-500 font-medium">Discrepancy Reviews</div>
          <div className={`text-lg font-bold font-mono mt-0.5 ${pendingAlerts.length > 0 ? 'text-amber-800' : 'text-stone-900'}`}>
            {pendingAlerts.length}
          </div>
          <div className="text-[11px] text-stone-500 truncate mt-0.5">
            {pendingAlerts.length > 0 ? 'Requires Engineering Sign-off' : 'All Claims Verified'}
          </div>
        </div>

        <div className="p-3 sm:p-3.5">
          <div className="text-[11px] text-stone-500 font-medium">Active Labour Today</div>
          <div className="text-lg font-bold font-mono text-stone-900 mt-0.5">
            {totalLabourDeployed}
          </div>
          <div className="text-[11px] text-stone-500 truncate mt-0.5">
            Across 6 Field Trades
          </div>
        </div>

        <div className="p-3 sm:p-3.5">
          <div className="text-[11px] text-stone-500 font-medium">Safety Man-Hours</div>
          <div className="text-lg font-bold font-mono text-stone-900 mt-0.5">
            482.5k
          </div>
          <div className="text-[11px] text-emerald-700 font-medium truncate mt-0.5">
            Zero LTI Incidents
          </div>
        </div>
      </section>

      {/* 3. CONSTRUCTION OPERATIONS WORKSPACE (Clear tabs, clean data tables, purposeful actions) */}
      <section className="bg-white border border-stone-200 rounded-sm">
        {/* Navigation Tabs Bar */}
        <div className="border-b border-stone-200 px-4 sm:px-5 flex items-center justify-between gap-4 overflow-x-auto bg-stone-50/50">
          <div className="flex gap-1 -mb-px text-xs font-medium">
            {[
              { id: 'schedule', label: 'Milestones & Schedule' },
              { id: 'dpr', label: 'Daily Reports (DPR)' },
              { id: 'labour', label: 'Labour & Workforce' },
              { id: 'materials', label: 'Materials & Yard Stock' },
              { id: 'cost', label: 'Budget & Cost' },
              { id: 'safety', label: 'HSE Safety' },
              { id: 'documents', label: 'Drawings & Documents' },
              { id: 'vision', label: 'Visual Progress Intelligence' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveModuleTab(tab.id as any)}
                className={`py-3 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeModuleTab === tab.id
                    ? 'border-amber-700 text-stone-950 font-semibold bg-white'
                    : 'border-transparent text-stone-600 hover:text-stone-900 hover:border-stone-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-stone-500 font-mono hidden md:inline shrink-0">
            Site: {activeProject.projectCode}
          </span>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-5">
          {/* TAB 1: Milestones & Work Schedules */}
          {activeModuleTab === 'schedule' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <h3 className="font-semibold text-stone-900">
                    Master Milestone Schedule & Critical Path
                  </h3>
                  <p className="text-stone-500 text-[11px]">
                    Baseline target completion versus actual physical progress per work package
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono text-stone-600">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 bg-rose-600 rounded-xs" /> Critical Path (CP)
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto border border-stone-200 rounded-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-100 text-stone-700 font-medium border-b border-stone-200 font-mono text-[11px]">
                    <tr>
                      <th className="py-2 px-3">Code</th>
                      <th className="py-2 px-3">Milestone Scope</th>
                      <th className="py-2 px-3">Assigned Agency</th>
                      <th className="py-2 px-3">Target Finish</th>
                      <th className="py-2 px-3">Forecast</th>
                      <th className="py-2 px-3 text-right">Target</th>
                      <th className="py-2 px-3 text-right">Actual</th>
                      <th className="py-2 px-3 text-center">Variance</th>
                      <th className="py-2 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-800">
                    {milestones
                      .filter((m) => m.projectId === activeProject.id)
                      .map((m) => (
                        <tr key={m.id} className="hover:bg-stone-50/80">
                          <td className="py-2.5 px-3 font-mono font-semibold text-stone-900">
                            {m.code}
                            {m.isCriticalPath && (
                              <span className="ml-1 text-[10px] text-rose-700 font-bold" title="Critical Path Task">
                                [CP]
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-stone-900">{m.name}</td>
                          <td className="py-2.5 px-3 text-stone-600">{m.assignedContractor}</td>
                          <td className="py-2.5 px-3 font-mono text-stone-600 text-[11px]">{m.plannedFinishDate}</td>
                          <td className="py-2.5 px-3 font-mono text-stone-900 text-[11px] font-medium">{m.forecastFinishDate}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-stone-500">{m.plannedProgressPercent}%</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900">{m.actualProgressPercent}%</td>
                          <td className="py-2.5 px-3 text-center font-mono text-[11px]">
                            {m.delayDays > 0 ? (
                              <span className="text-amber-800 font-medium">+{m.delayDays}d</span>
                            ) : (
                              <span className="text-stone-500">0d</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`px-1.5 py-0.5 rounded-xs text-[10px] font-medium ${
                                m.status === 'COMPLETED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : m.status === 'ON_TRACK'
                                  ? 'bg-stone-100 text-stone-800'
                                  : m.status === 'AT_RISK'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {m.status.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Daily Progress Reports (DPR) */}
          {activeModuleTab === 'dpr' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <h3 className="font-semibold text-stone-900">
                    Daily Progress Reports (DPR) & Site Logs
                  </h3>
                  <p className="text-stone-500 text-[11px]">
                    Official shift diaries, concrete batching records, and plant machinery logs
                  </p>
                </div>
                <button
                  onClick={() => setShowAddDprModal(true)}
                  className="px-3 py-1.5 text-xs font-medium bg-amber-700 hover:bg-amber-800 text-white rounded-sm transition-colors cursor-pointer self-start sm:self-auto"
                >
                  + Log Daily Progress Entry
                </button>
              </div>

              <div className="space-y-3">
                {dailyReports
                  .filter((r) => r.projectId === activeProject.id)
                  .map((report) => (
                    <div
                      key={report.id}
                      className="p-4 border border-stone-200 rounded-sm bg-stone-50/40 text-xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-stone-200">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-stone-900 text-sm">
                            {report.date}
                          </span>
                          <span className="px-1.5 py-0.5 bg-stone-200 text-stone-800 font-mono text-[11px] rounded-xs font-medium">
                            {report.shift} Shift
                          </span>
                          <span className="text-stone-500 text-[11px]">
                            {report.weather} · {report.temperature}
                          </span>
                        </div>
                        <div className="text-stone-600 text-[11px]">
                          Resident Engineer: <span className="font-medium text-stone-900">{report.residentEngineer}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 space-y-2">
                          <p className="text-stone-800 leading-relaxed font-medium">
                            {report.summary}
                          </p>

                          <div className="text-[11px] font-semibold text-stone-700 pt-1">
                            Completed Shift Activities:
                          </div>
                          <ul className="list-disc list-inside text-stone-600 space-y-0.5 pl-1">
                            {report.activitiesCompleted.map((act, i) => (
                              <li key={i}>{act}</li>
                            ))}
                          </ul>

                          {report.delaysOrBottlenecks && (
                            <div className="mt-2 text-stone-800 bg-amber-50/80 p-2 border border-amber-200 rounded-xs text-[11px]">
                              <span className="font-semibold text-amber-900">Site Delay Note:</span> {report.delaysOrBottlenecks}
                            </div>
                          )}
                        </div>

                        {/* Machinery & Inward Deliveries */}
                        <div className="bg-white p-3 border border-stone-200 rounded-xs space-y-2.5 text-[11px]">
                          <div>
                            <span className="font-semibold text-stone-900 block pb-1 border-b border-stone-100">
                              Plant & Equipment:
                            </span>
                            <div className="space-y-1 pt-1">
                              {report.equipmentDeployed.map((eq, i) => (
                                <div key={i} className="flex justify-between text-stone-600">
                                  <span>{eq.name}</span>
                                  <span className="font-mono text-stone-900 font-medium">{eq.hoursOperated} hrs</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="pt-1.5 border-t border-stone-100">
                            <span className="font-semibold text-stone-900 block">
                              Materials Inward:
                            </span>
                            <span className="text-stone-600">{report.materialsReceivedSummary}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 3: Labour & Workforce Attendance */}
          {activeModuleTab === 'labour' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <h3 className="font-semibold text-stone-900">
                    Daily Manpower & Trade Muster Roll
                  </h3>
                  <p className="text-stone-500 text-[11px]">
                    Subcontractor headcount deployed on site today across structural and finishing packages
                  </p>
                </div>
                <div className="text-xs font-mono bg-stone-100 px-2.5 py-1 rounded-sm border border-stone-200 font-medium text-stone-800">
                  Total Deployed: {totalLabourDeployed} Workers
                </div>
              </div>

              <div className="overflow-x-auto border border-stone-200 rounded-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-100 text-stone-700 font-medium border-b border-stone-200 font-mono text-[11px]">
                    <tr>
                      <th className="py-2 px-3">Trade / Package</th>
                      <th className="py-2 px-3">Contractor</th>
                      <th className="py-2 px-3 text-right">Planned</th>
                      <th className="py-2 px-3 text-right">Actual</th>
                      <th className="py-2 px-3 text-center">Variance</th>
                      <th className="py-2 px-3">Assigned Work Zone & Tasks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-800">
                    {labourRecords
                      .filter((l) => l.projectId === activeProject.id)
                      .map((lab) => (
                        <tr key={lab.id} className="hover:bg-stone-50">
                          <td className="py-2 px-3 font-medium text-stone-900">{lab.trade}</td>
                          <td className="py-2 px-3 text-stone-600">{lab.contractor}</td>
                          <td className="py-2 px-3 text-right font-mono text-stone-500">{lab.plannedCount}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-stone-900">{lab.actualCount}</td>
                          <td className="py-2 px-3 text-center font-mono">
                            {lab.actualCount - lab.plannedCount < 0 ? (
                              <span className="text-amber-800">{lab.actualCount - lab.plannedCount}</span>
                            ) : (
                              <span className="text-stone-600">+{lab.actualCount - lab.plannedCount}</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-stone-600 text-[11px]">{lab.notes || 'General Site Deployment'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: Materials Inventory & Yard Stock */}
          {activeModuleTab === 'materials' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <h3 className="font-semibold text-stone-900">
                    Materials Inventory & Testing Status
                  </h3>
                  <p className="text-stone-500 text-[11px]">
                    On-site raw material stock, cumulative consumption, and NABL laboratory certification
                  </p>
                </div>
                <button
                  onClick={() => setShowAddMaterialModal(true)}
                  className="px-3 py-1.5 text-xs font-medium bg-stone-900 hover:bg-stone-800 text-white rounded-sm transition-colors cursor-pointer self-start sm:self-auto"
                >
                  + Record Inward Material Delivery
                </button>
              </div>

              <div className="overflow-x-auto border border-stone-200 rounded-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-100 text-stone-700 font-medium border-b border-stone-200 font-mono text-[11px]">
                    <tr>
                      <th className="py-2 px-3">Item Code</th>
                      <th className="py-2 px-3">Material & Specification</th>
                      <th className="py-2 px-3">Unit</th>
                      <th className="py-2 px-3 text-right">BOQ Target</th>
                      <th className="py-2 px-3 text-right">Consumed</th>
                      <th className="py-2 px-3 text-right">Yard Stock</th>
                      <th className="py-2 px-3">Stock Status</th>
                      <th className="py-2 px-3">Quality Certificate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-800">
                    {materials
                      .filter((m) => m.projectId === activeProject.id)
                      .map((mat) => {
                        const isLow = mat.currentStock < mat.minimumThreshold;
                        return (
                          <tr key={mat.id} className="hover:bg-stone-50">
                            <td className="py-2.5 px-3 font-mono font-medium text-stone-900">{mat.itemCode}</td>
                            <td className="py-2.5 px-3">
                              <span className="font-medium text-stone-900 block">{mat.name}</span>
                              <span className="text-[11px] text-stone-500 block">{mat.specification}</span>
                            </td>
                            <td className="py-2.5 px-3 text-stone-600">{mat.unit}</td>
                            <td className="py-2.5 px-3 text-right font-mono text-stone-500">{mat.boqQuantity.toLocaleString()}</td>
                            <td className="py-2.5 px-3 text-right font-mono text-stone-800">{mat.cumulativeConsumed.toLocaleString()}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900">{mat.currentStock.toLocaleString()}</td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-1.5 py-0.5 rounded-xs text-[10px] font-medium ${
                                  isLow ? 'bg-amber-100 text-amber-900' : 'bg-stone-100 text-stone-700'
                                }`}
                              >
                                {isLow ? 'Reorder Soon' : 'Adequate'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-stone-600 font-mono text-[11px]">
                              {mat.qaCertificateStatus}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: Budget & Cost Performance */}
          {activeModuleTab === 'cost' && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="font-semibold text-stone-900">
                  Project Financial Health & Work Package Allocations
                </h3>
                <p className="text-stone-500 text-[11px]">
                  Contract sum utilization, progress billings, and certified cost performance index (CPI)
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xs">
                  <span className="text-stone-500 text-[11px] block">Total Contract Value</span>
                  <span className="text-base font-bold font-mono text-stone-900">
                    ₹{projectFinancials.totalContractValue.toFixed(2)} Cr
                  </span>
                </div>
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xs">
                  <span className="text-stone-500 text-[11px] block">Certified Milestone Billing</span>
                  <span className="text-base font-bold font-mono text-stone-900">
                    ₹{projectFinancials.certifiedMilestoneBilling.toFixed(2)} Cr
                  </span>
                </div>
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xs">
                  <span className="text-stone-500 text-[11px] block">Cost Performance Index (CPI)</span>
                  <span className="text-base font-bold font-mono text-stone-900">
                    {projectFinancials.costPerformanceIndex.toFixed(2)} (Favorable)
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto border border-stone-200 rounded-xs">
                <table className="w-full text-left">
                  <thead className="bg-stone-100 text-stone-700 font-medium border-b border-stone-200 font-mono text-[11px]">
                    <tr>
                      <th className="py-2 px-3">Work Breakdown Package</th>
                      <th className="py-2 px-3 text-right">Allocated Budget</th>
                      <th className="py-2 px-3 text-right">Expenditure</th>
                      <th className="py-2 px-3 text-right">Progress</th>
                      <th className="py-2 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-800 font-mono text-[11px]">
                    {projectFinancials.packages.map((pkg, i) => (
                      <tr key={i} className="hover:bg-stone-50">
                        <td className="py-2 px-3 font-sans text-stone-900 font-medium">{pkg.packageName}</td>
                        <td className="py-2 px-3 text-right text-stone-600">₹{pkg.allocatedCost.toFixed(2)} Cr</td>
                        <td className="py-2 px-3 text-right text-stone-900 font-bold">₹{pkg.spentToDate.toFixed(2)} Cr</td>
                        <td className="py-2 px-3 text-right text-stone-700">{pkg.progressPercent}%</td>
                        <td className="py-2 px-3 text-center font-sans">
                          <span className="px-1.5 py-0.5 rounded-xs text-[10px] bg-stone-100 text-stone-800">
                            {pkg.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: HSE Safety */}
          {activeModuleTab === 'safety' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <h3 className="font-semibold text-stone-900">
                    Health, Safety & Environment (HSE) Field Register
                  </h3>
                  <p className="text-stone-500 text-[11px]">
                    Toolbox briefings, PPE compliance audits, and hazard mitigation notices
                  </p>
                </div>
                <button
                  onClick={() => setShowAddSafetyModal(true)}
                  className="px-3 py-1.5 text-xs font-medium bg-stone-900 hover:bg-stone-800 text-white rounded-sm transition-colors cursor-pointer self-start sm:self-auto"
                >
                  + Log Safety Notice
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {safetyIncidents
                  .filter((s) => s.projectId === activeProject.id)
                  .map((incident) => (
                    <div
                      key={incident.id}
                      className="p-3 border border-stone-200 rounded-sm bg-stone-50/50 space-y-2"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono text-stone-500">{incident.date}</span>
                        <span className="px-1.5 py-0.5 rounded-xs font-mono font-medium bg-stone-200 text-stone-800 text-[10px]">
                          {incident.type}
                        </span>
                      </div>
                      <p className="text-stone-800 font-medium leading-relaxed">
                        {incident.description}
                      </p>
                      <div className="text-[11px] text-stone-600 bg-white p-2 border border-stone-200 rounded-xs">
                        <span className="font-semibold text-stone-700">Action:</span> {incident.actionTaken}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono pt-0.5">
                        <span>Reported by: {incident.reportedBy}</span>
                        <span className="font-semibold text-stone-700">{incident.status}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 7: GFC Drawings & Documents */}
          {activeModuleTab === 'documents' && (
            <div className="space-y-3">
              <div className="text-xs">
                <h3 className="font-semibold text-stone-900">
                  Good for Construction (GFC) Drawings Register
                </h3>
                <p className="text-stone-500 text-[11px]">
                  Approved architectural, structural, and MEP engineering blueprints
                </p>
              </div>

              <div className="overflow-x-auto border border-stone-200 rounded-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-100 text-stone-700 font-medium border-b border-stone-200 font-mono text-[11px]">
                    <tr>
                      <th className="py-2 px-3">Drawing Reference</th>
                      <th className="py-2 px-3">Title & Specification</th>
                      <th className="py-2 px-3">Discipline</th>
                      <th className="py-2 px-3">Revision</th>
                      <th className="py-2 px-3">Approving Authority</th>
                      <th className="py-2 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-800">
                    {documents
                      .filter((d) => d.projectId === activeProject.id)
                      .map((doc) => (
                        <tr key={doc.id} className="hover:bg-stone-50">
                          <td className="py-2 px-3 font-mono font-semibold text-stone-900">{doc.docNumber}</td>
                          <td className="py-2 px-3 font-medium text-stone-900">{doc.title}</td>
                          <td className="py-2 px-3 text-stone-600 font-mono text-[11px]">{doc.discipline}</td>
                          <td className="py-2 px-3 text-stone-600 font-mono text-[11px]">{doc.revision}</td>
                          <td className="py-2 px-3 text-stone-600 text-[11px]">{doc.authorizingBody}</td>
                          <td className="py-2 px-3 text-center">
                            <span className="px-1.5 py-0.5 rounded-xs text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                              {doc.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: Visual Progress Intelligence */}
          {activeModuleTab === 'vision' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <h3 className="font-semibold text-stone-900">
                    Photographic Activity Log & Gemini Multimodal Evidence
                  </h3>
                  <p className="text-stone-500 text-[11px]">
                    Inspected site photographs verified with cryptographic SHA-256 digests
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onNavigate('upload', activeProject.id)}
                    className="px-3 py-1.5 text-xs font-medium bg-amber-700 hover:bg-amber-800 text-white rounded-sm transition-colors cursor-pointer"
                  >
                    + Inspect New Photo
                  </button>
                  <button
                    onClick={() => onNavigate('compare')}
                    className="px-3 py-1.5 text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-sm transition-colors cursor-pointer"
                  >
                    Compare Chronology
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {projectObservations.map((obs) => {
                  const stageObj = getStageById(obs.selectedCategory);
                  return (
                    <div
                      key={obs.id}
                      onClick={() => onSelectObservation(obs)}
                      className="p-2.5 border border-stone-200 rounded-sm bg-stone-50/50 hover:border-stone-400 transition-colors cursor-pointer group text-xs"
                    >
                      <img
                        src={obs.imageUrl}
                        alt={obs.fileName}
                        referrerPolicy="no-referrer"
                        className="w-full h-36 object-cover rounded-xs bg-stone-950 border border-stone-200"
                      />
                      <div className="mt-2 space-y-1">
                        <div className="font-semibold text-stone-900 truncate">{stageObj.name}</div>
                        <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono">
                          <span>{obs.observationDate}</span>
                          <span>{obs.locationTag || 'General Zone'}</span>
                        </div>
                        {obs.hasMismatchAlert && (
                          <div className="text-[10px] text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded-xs border border-amber-200">
                            Discrepancy Awaiting Review
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. 10-STAGE ACTIVITY RECOGNITION TAXONOMY (Clean, Compact, No Forced Uppercase) */}
      <section className="bg-white border border-stone-200 rounded-sm p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-sm font-semibold text-stone-900">
              Activity Distribution Across 10 Construction Stages
            </h2>
            <p className="text-stone-500 text-[11px]">
              Classified under Indian National Building Code (NBC 2016) and IS 456 standards
            </p>
          </div>
          <button
            onClick={() => onNavigate('academic')}
            className="text-xs text-stone-600 hover:text-stone-900 underline cursor-pointer self-start sm:self-auto"
          >
            Review Stage Definitions →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {CONSTRUCTION_STAGES.map((stage) => {
            const count = stageCounts[stage.id] || 0;
            return (
              <div key={stage.id} className="p-2.5 border border-stone-200 rounded-xs bg-stone-50/50 text-xs">
                <div className="text-[10px] font-mono font-semibold text-stone-500">{stage.code}</div>
                <div className="font-medium text-stone-900 truncate mt-0.5">{stage.name}</div>
                <div className="mt-1.5 flex items-baseline justify-between font-mono">
                  <span className="font-bold text-stone-900 text-sm tabular-nums">{count}</span>
                  <span className="text-[10px] text-stone-500">
                    {observations.length > 0 ? `${Math.round((count / observations.length) * 100)}%` : '0%'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. ALL PROJECTS DIRECTORY TABLE */}
      <section className="bg-white border border-stone-200 rounded-sm p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-stone-900">
              Active Project Portfolio
            </h2>
            <p className="text-stone-500 text-[11px]">
              Monitored building and infrastructure construction sites
            </p>
          </div>
          <button
            onClick={() => onNavigate('projects')}
            className="text-xs text-stone-600 hover:text-stone-900 underline cursor-pointer"
          >
            All Projects →
          </button>
        </div>

        <div className="overflow-x-auto border border-stone-200 rounded-xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-100 text-stone-700 font-medium border-b border-stone-200 font-mono text-[11px]">
              <tr>
                <th className="py-2 px-3">Site Code</th>
                <th className="py-2 px-3">Project Title & Location</th>
                <th className="py-2 px-3">EPC Contractor</th>
                <th className="py-2 px-3 text-right">Physical Progress</th>
                <th className="py-2 px-3 text-center">Status</th>
                <th className="py-2 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-800">
              {projects.map((proj) => (
                <tr key={proj.id} className="hover:bg-stone-50">
                  <td className="py-2.5 px-3 font-mono font-semibold text-stone-900">{proj.projectCode}</td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-stone-900 block">{proj.name}</span>
                    <span className="text-[11px] text-stone-500 block truncate">{proj.location}</span>
                  </td>
                  <td className="py-2.5 px-3 text-stone-600">{proj.contractorName}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium text-stone-900">
                    {proj.currentEstimatedProgress}%
                    <div className="w-20 bg-stone-100 h-1.5 rounded-xs overflow-hidden ml-auto mt-1 border border-stone-200">
                      <div
                        className="bg-amber-700 h-full"
                        style={{ width: `${proj.currentEstimatedProgress}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-1.5 py-0.5 rounded-xs text-[10px] font-mono bg-stone-100 text-stone-800 border border-stone-200">
                      {proj.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onNavigate('projects', proj.id)}
                      className="px-2.5 py-1 text-xs text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-sm cursor-pointer"
                    >
                      Open Site →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL 1: Add Daily Progress Report (DPR) */}
      {showAddDprModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4">
          <div className="bg-white rounded-md shadow-lg max-w-lg w-full p-5 border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-sm font-bold text-stone-900">
                Log Daily Progress Report (DPR)
              </h3>
              <button
                onClick={() => setShowAddDprModal(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddDpr} className="space-y-3.5 mt-3 text-xs">
              <div>
                <span className="text-stone-500 block text-[11px]">Site Context:</span>
                <span className="font-semibold text-stone-900">[{activeProject.projectCode}] {activeProject.name}</span>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">
                  Shift Progress Summary *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newDprSummary}
                  onChange={(e) => setNewDprSummary(e.target.value)}
                  placeholder="e.g. Completed Level 4 suspended slab pour. Discharged 85 m³ M35 RMC without segregation."
                  className="w-full p-2 border border-stone-300 rounded-sm text-xs text-stone-900 focus:outline-none focus:border-stone-500"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">
                  Specific Activities Completed (One per line)
                </label>
                <textarea
                  rows={3}
                  value={newDprActivities}
                  onChange={(e) => setNewDprActivities(e.target.value)}
                  placeholder="Took 6 cube specimens (IS 516)&#10;Fixed formwork props on grid C3-C8&#10;Laid AAC blocks on 2nd floor"
                  className="w-full p-2 border border-stone-300 rounded-sm text-xs text-stone-900 focus:outline-none focus:border-stone-500"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">
                  Delays or Site Constraints (Optional)
                </label>
                <input
                  type="text"
                  value={newDprDelays}
                  onChange={(e) => setNewDprDelays(e.target.value)}
                  placeholder="e.g. 30-min transit mixer delay due to city peak hour traffic"
                  className="w-full p-2 border border-stone-300 rounded-sm text-xs text-stone-900 focus:outline-none focus:border-stone-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddDprModal(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-medium bg-amber-700 hover:bg-amber-800 text-white rounded-sm cursor-pointer"
                >
                  Record DPR Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Record Material Delivery */}
      {showAddMaterialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4">
          <div className="bg-white rounded-md shadow-lg max-w-md w-full p-5 border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-sm font-bold text-stone-900">
                Record Inward Material Delivery
              </h3>
              <button
                onClick={() => setShowAddMaterialModal(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMaterialReceipt} className="space-y-3.5 mt-3 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">
                  Material Item
                </label>
                <select
                  value={newMatCode}
                  onChange={(e) => setNewMatCode(e.target.value)}
                  className="w-full p-2 border border-stone-300 rounded-sm text-xs text-stone-900 focus:outline-none focus:border-stone-500"
                >
                  <option value="TMT-FE500D">TMT High-Yield Rebar (Fe500D) - Metric Tonnes</option>
                  <option value="CEM-OPC53">Ordinary Portland Cement (OPC 53) - Bags</option>
                  <option value="RMC-M35">Ready-Mix Concrete Grade M35 - m³</option>
                  <option value="BLK-AAC-150">AAC Blocks (600x200x150mm) - Nos</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">
                  Quantity Received
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newMatQty}
                  onChange={(e) => setNewMatQty(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-stone-300 rounded-sm text-xs text-stone-900 font-mono focus:outline-none focus:border-stone-500"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">
                  Delivery Challan / Supplier Reference
                </label>
                <input
                  type="text"
                  value={newMatNotes}
                  onChange={(e) => setNewMatNotes(e.target.value)}
                  placeholder="e.g. Tata Tiscon Mill Delivery Challan #84920"
                  className="w-full p-2 border border-stone-300 rounded-sm text-xs text-stone-900 focus:outline-none focus:border-stone-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddMaterialModal(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-medium bg-stone-900 hover:bg-stone-800 text-white rounded-sm cursor-pointer"
                >
                  Update Yard Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Log HSE Safety Notice */}
      {showAddSafetyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4">
          <div className="bg-white rounded-md shadow-lg max-w-md w-full p-5 border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-sm font-bold text-stone-900">
                Log Safety Observation / Hazard
              </h3>
              <button
                onClick={() => setShowAddSafetyModal(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSafetyObservation} className="space-y-3.5 mt-3 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">
                  Severity Level
                </label>
                <select
                  value={newSafetySeverity}
                  onChange={(e) => setNewSafetySeverity(e.target.value as any)}
                  className="w-full p-2 border border-stone-300 rounded-sm text-xs text-stone-900 focus:outline-none focus:border-stone-500"
                >
                  <option value="INFO">Informational / Toolbox Briefing</option>
                  <option value="LOW">Low / Housekeeping Notice</option>
                  <option value="MEDIUM">Medium / PPE Adherence Issue</option>
                  <option value="HIGH">High / Working at Heights Risk</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">
                  Description of Hazard / Observation *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newSafetyDesc}
                  onChange={(e) => setNewSafetyDesc(e.target.value)}
                  placeholder="e.g. Scaffolding clamp loose on level 3 elevator shaft access."
                  className="w-full p-2 border border-stone-300 rounded-sm text-xs text-stone-900 focus:outline-none focus:border-stone-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddSafetyModal(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-medium bg-amber-700 hover:bg-amber-800 text-white rounded-sm cursor-pointer"
                >
                  Record Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
