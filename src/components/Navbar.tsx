import React, { useState, useEffect } from 'react';
import { getActiveBackendMode, setActiveBackendMode, checkBackendStatus } from '../services/api';
import { BackendStatus, Project } from '../types';

interface NavbarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  openMismatchesCount: number;
  projects?: Project[];
  selectedProjectId?: string | null;
  onSelectProject?: (projectId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  openMismatchesCount,
  projects = [],
  selectedProjectId,
  onSelectProject,
}) => {
  const [backendStatus, setBackendStatus] = useState<BackendStatus>({
    activeMode: getActiveBackendMode(),
    isSpringAvailable: false,
    springEndpoint: 'http://localhost:8080/api/v1',
    geminiModel: 'gemini-3.8-flash',
  });
  const [showBackendModal, setShowBackendModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkBackendStatus().then(setBackendStatus).catch(() => {});
    const interval = setInterval(() => {
      checkBackendStatus().then(setBackendStatus).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'projects', label: 'Projects' },
    { id: 'upload', label: 'Site Inspection' },
    { id: 'compare', label: 'Comparison' },
    {
      id: 'alerts',
      label: openMismatchesCount > 0 ? `Alerts (${openMismatchesCount})` : 'Alerts',
      hasAlert: openMismatchesCount > 0,
    },
    { id: 'reports', label: 'Reports' },
    { id: 'evaluation', label: 'Evaluation' },
    { id: 'academic', label: 'Architecture & Java' },
  ];

  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  return (
    <>
      {/* 1. Compact Operational Status Strip (Understated, informative, no blinking dots) */}
      <div className="bg-stone-100 border-b border-stone-200 text-stone-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px]">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-stone-800">
              BUILDSIGHT FIELD SYSTEM
            </span>
            <span className="text-stone-300">|</span>
            <span className="text-stone-600 hidden sm:inline">
              IS 456 / NBC 2016 Inspection Framework
            </span>
          </div>

          <div className="flex items-center gap-4 text-stone-500">
            <span className="hidden md:inline">
              Safety Record: <span className="text-stone-800 font-medium">482,500 LTI-Free Hours</span>
            </span>
            <span className="text-stone-300 hidden md:inline">|</span>
            <span>
              Shift: <span className="text-stone-800 font-medium">Day (07:00–18:00)</span>
            </span>
            <span className="text-stone-300 hidden sm:inline">|</span>
            <span className="hidden sm:inline">
              Weather: <span className="text-stone-800 font-medium">28°C Clear</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-4">
            {/* Left: Clean, Understated Wordmark */}
            <div className="flex items-center gap-6 shrink-0">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onSelectView('dashboard');
                }}
                className="flex items-center gap-2.5 text-stone-900 group"
              >
                <div className="w-7 h-7 rounded-sm bg-stone-900 flex items-center justify-center text-amber-500">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="3" width="18" height="18" rx="1" />
                    <path d="M3 9h18M9 21V9" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold tracking-tight text-stone-900">
                    BUILDSIGHT
                  </div>
                  <div className="text-[10px] text-stone-500 font-normal leading-none -mt-0.5">
                    Civil Progress & Quality
                  </div>
                </div>
              </a>

              {/* Site Quick Selector (Cleanly aligned, proportionate) */}
              {projects.length > 0 && onSelectProject && (
                <div className="hidden xl:flex items-center gap-1.5 pl-4 border-l border-stone-200 text-xs">
                  <span className="text-stone-500 font-medium">Site:</span>
                  <select
                    value={currentProject?.id || ''}
                    onChange={(e) => onSelectProject(e.target.value)}
                    className="h-8 px-2.5 bg-stone-50 border border-stone-300 rounded-sm text-xs font-medium text-stone-900 focus:outline-none focus:border-stone-500 cursor-pointer max-w-[260px] truncate"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        [{p.projectCode}] {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Middle: Clear Navigation Menu */}
            <nav className="hidden lg:flex items-center gap-1 h-full">
              {navLinks.map((link) => {
                const isActive = currentView === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => onSelectView(link.id)}
                    className={`h-full px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'border-amber-700 text-stone-950 font-semibold'
                        : 'border-transparent text-stone-600 hover:text-stone-950 hover:border-stone-300'
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.hasAlert && !isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right: Proportionate Controls */}
            <div className="flex items-center gap-2.5 shrink-0">
              {/* Backend Mode Switcher Button */}
              <button
                onClick={() => setShowBackendModal(true)}
                title="Backend Architecture Connection"
                className="h-8 px-2.5 text-xs text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-sm transition-colors cursor-pointer flex items-center gap-1.5 font-mono text-[11px]"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    backendStatus.activeMode === 'local-springboot'
                      ? backendStatus.isSpringAvailable
                        ? 'bg-emerald-600'
                        : 'bg-rose-600'
                      : 'bg-emerald-600'
                  }`}
                />
                <span className="hidden sm:inline">
                  {backendStatus.activeMode === 'local-springboot'
                    ? 'Spring Boot: 8080'
                    : 'Express API (Live)'}
                </span>
              </button>

              {/* Primary Action Button (Proportionate, no oversized orange glow) */}
              <button
                onClick={() => onSelectView('upload')}
                className="h-8 px-3 text-xs font-medium text-white bg-amber-700 hover:bg-amber-800 active:bg-amber-900 rounded-sm transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span>Log Observation</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 text-stone-600 hover:text-stone-900 border border-stone-300 rounded-sm"
                aria-label="Toggle Navigation Menu"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {mobileMenuOpen ? (
                    <path d="M18 6 6 18M6 6l12 12" />
                  ) : (
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-200 bg-stone-50 p-4 space-y-3">
            {projects.length > 0 && onSelectProject && (
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Active Site:
                </label>
                <select
                  value={currentProject?.id || ''}
                  onChange={(e) => {
                    onSelectProject(e.target.value);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full h-9 px-2.5 bg-white border border-stone-300 rounded-sm text-xs font-medium text-stone-900"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.projectCode}] {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    onSelectView(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-2 text-left text-xs font-medium rounded-sm border transition-colors ${
                    currentView === link.id
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Backend Architecture Switcher Modal */}
      {showBackendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4">
          <div className="bg-white rounded-md shadow-lg max-w-md w-full p-6 border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-sm font-bold text-stone-900">
                Backend Service Configuration
              </h3>
              <button
                onClick={() => setShowBackendModal(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600 mt-3 leading-relaxed">
              Select between the live Node.js Express API (with native SQLite and Gemini 3.8 Flash) and the academic Java 17 Spring Boot service.
            </p>

            <div className="space-y-2.5 mt-4">
              <label
                onClick={() => {
                  setActiveBackendMode('cloud-express');
                  setBackendStatus({ ...backendStatus, activeMode: 'cloud-express' });
                }}
                className={`block p-3 rounded-sm border cursor-pointer transition-all ${
                  backendStatus.activeMode === 'cloud-express'
                    ? 'border-amber-700 bg-amber-50/40 ring-1 ring-amber-700'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-stone-900">
                    Live Express API + SQLite Database
                  </span>
                  <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded font-semibold">
                    CONNECTED
                  </span>
                </div>
                <div className="text-[11px] text-stone-600 mt-1">
                  Node 22 native <code className="font-mono text-stone-800">buildsight_academic.db</code> with persistent tables and direct Gemini vision pipeline.
                </div>
              </label>

              <label
                onClick={() => {
                  setActiveBackendMode('local-springboot');
                  setBackendStatus({ ...backendStatus, activeMode: 'local-springboot' });
                }}
                className={`block p-3 rounded-sm border cursor-pointer transition-all ${
                  backendStatus.activeMode === 'local-springboot'
                    ? 'border-amber-700 bg-amber-50/40 ring-1 ring-amber-700'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-stone-900">
                    Local Java 17 / Spring Boot Service
                  </span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                      backendStatus.isSpringAvailable
                        ? 'text-emerald-800 bg-emerald-100'
                        : 'text-stone-600 bg-stone-100'
                    }`}
                  >
                    {backendStatus.isSpringAvailable ? 'PORT 8080' : 'STANDBY'}
                  </span>
                </div>
                <div className="text-[11px] text-stone-600 mt-1">
                  Connects to Spring Boot at <code className="font-mono text-stone-800">http://localhost:8080/api/v1</code>.
                </div>
              </label>
            </div>

            <div className="mt-5 pt-3 border-t border-stone-200 flex items-center justify-between">
              <span className="text-[11px] font-mono text-stone-500">
                Vision Model: {backendStatus.geminiModel}
              </span>
              <button
                onClick={() => setShowBackendModal(false)}
                className="px-4 py-1.5 text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white rounded-sm transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
