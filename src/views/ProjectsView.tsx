import React, { useState } from 'react';
import { Project, ProjectStatus } from '../types';
import { createProject } from '../services/api';

interface ProjectsViewProps {
  projects: Project[];
  onSelectProject: (id: string) => void;
  onProjectCreated: (project: Project) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  onSelectProject,
  onProjectCreated,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ProjectStatus>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [newProject, setNewProject] = useState({
    name: '',
    projectCode: '',
    location: '',
    clientName: '',
    contractorName: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    expectedCompletionDate: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.projectCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newProject.name.trim() || !newProject.projectCode.trim() || !newProject.location.trim()) {
      setFormError('Please provide Project Code, Name, and Site Location.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createProject(newProject);
      onProjectCreated(created);
      setShowCreateModal(false);
      setNewProject({
        name: '',
        projectCode: '',
        location: '',
        clientName: '',
        contractorName: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        expectedCompletionDate: '',
      });
    } catch (err: any) {
      setFormError(err.message || 'Failed to register project in database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
            <span className="font-mono text-stone-600">IS 456 / NBC 2016</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span>Site Portfolio Register</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-stone-900 tracking-tight">
            Construction Projects
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-stone-600">
            Active building construction and civil infrastructure monitoring sites.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3.5 py-2 text-xs font-medium text-white bg-amber-700 hover:bg-amber-800 rounded-xs transition-colors cursor-pointer self-start sm:self-auto shrink-0 shadow-xs"
        >
          + Add New Project
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white p-3 rounded-xs border border-stone-200 shadow-xs">
        <div className="w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by project name, code, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-xs border border-stone-300 bg-stone-50 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-1 p-0.5 bg-stone-100 rounded-xs border border-stone-200 self-stretch sm:self-auto overflow-x-auto">
          {(['ALL', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 text-xs font-medium rounded-xs transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? 'bg-stone-900 text-stone-100 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {st === 'ALL' ? 'All Projects' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            onClick={() => onSelectProject(project.id)}
            className="bg-white rounded-xs border border-stone-200 overflow-hidden hover:border-stone-400 transition-colors cursor-pointer flex flex-col shadow-xs"
          >
            {project.coverImage && (
              <img
                src={project.coverImage}
                alt={project.name}
                referrerPolicy="no-referrer"
                className="h-44 w-full object-cover border-b border-stone-200"
              />
            )}

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-semibold text-amber-800">
                    {project.projectCode}
                  </span>
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-xs border ${
                      project.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : project.status === 'COMPLETED'
                        ? 'bg-sky-50 text-sky-800 border-sky-200'
                        : project.status === 'ON_HOLD'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    {project.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-stone-900 tracking-tight">
                  {project.name}
                </h3>
                <div className="text-xs text-stone-500 mt-1 flex items-center gap-1.5">
                  <span>{project.location}</span>
                  {project.contractorName && (
                    <>
                      <span aria-hidden="true" className="text-stone-300">·</span>
                      <span>Contractor: {project.contractorName}</span>
                    </>
                  )}
                </div>

                <p className="mt-3 text-xs text-stone-600 line-clamp-2 leading-relaxed">
                  {project.description}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-stone-500">Estimated Milestone Progress</span>
                  <span className="font-semibold text-stone-900 font-mono tabular-nums text-xs">
                    {project.currentEstimatedProgress}%
                  </span>
                </div>
                <div className="w-full bg-stone-100 h-1.5 rounded-none overflow-hidden border border-stone-200">
                  <div
                    className="bg-amber-700 h-full transition-all duration-300"
                    style={{ width: `${project.currentEstimatedProgress}%` }}
                  />
                </div>

                <div className="mt-3.5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span>Start: <span className="font-mono text-stone-700">{project.startDate}</span></span>
                  <span className="font-medium text-amber-800 hover:text-amber-950 transition-colors">
                    View Project Details →
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="p-12 text-center bg-white rounded-xs border border-stone-200">
          <div className="text-xs font-semibold text-stone-800">No Projects Found</div>
          <p className="text-xs text-stone-500 mt-1">
            Try adjusting your search query or filter settings.
          </p>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4">
          <div className="bg-white rounded-xs shadow-lg max-w-lg w-full p-6 border border-stone-200">
            <h3 className="text-base font-semibold text-stone-900 mb-1">
              Register New Construction Project
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Register a project site to record photographic inspections, track milestone sequence, and run audit comparisons.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {formError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xs">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Project Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BLR-T4-COMM"
                    value={newProject.projectCode}
                    onChange={(e) =>
                      setNewProject({ ...newProject, projectCode: e.target.value })
                    }
                    className="w-full text-xs px-2.5 py-1.5 rounded-xs border border-stone-300 font-mono text-stone-900 focus:outline-none focus:border-stone-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Whitefield Gateway Tower"
                    value={newProject.name}
                    onChange={(e) =>
                      setNewProject({ ...newProject, name: e.target.value })
                    }
                    className="w-full text-xs px-2.5 py-1.5 rounded-xs border border-stone-300 text-stone-900 focus:outline-none focus:border-stone-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Site Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Whitefield, Bengaluru, Karnataka"
                  value={newProject.location}
                  onChange={(e) =>
                    setNewProject({ ...newProject, location: e.target.value })
                  }
                  className="w-full text-xs px-2.5 py-1.5 rounded-xs border border-stone-300 text-stone-900 focus:outline-none focus:border-stone-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Brigade Infrastructure"
                    value={newProject.clientName}
                    onChange={(e) =>
                      setNewProject({ ...newProject, clientName: e.target.value })
                    }
                    className="w-full text-xs px-2.5 py-1.5 rounded-xs border border-stone-300 text-stone-900 focus:outline-none focus:border-stone-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    General Contractor
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Shapoorji Pallonji"
                    value={newProject.contractorName}
                    onChange={(e) =>
                      setNewProject({ ...newProject, contractorName: e.target.value })
                    }
                    className="w-full text-xs px-2.5 py-1.5 rounded-xs border border-stone-300 text-stone-900 focus:outline-none focus:border-stone-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Commencement Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newProject.startDate}
                    onChange={(e) =>
                      setNewProject({ ...newProject, startDate: e.target.value })
                    }
                    className="w-full text-xs px-2.5 py-1.5 rounded-xs border border-stone-300 font-mono text-stone-900 focus:outline-none focus:border-stone-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Target Completion Date
                  </label>
                  <input
                    type="date"
                    value={newProject.expectedCompletionDate}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        expectedCompletionDate: e.target.value,
                      })
                    }
                    className="w-full text-xs px-2.5 py-1.5 rounded-xs border border-stone-300 font-mono text-stone-900 focus:outline-none focus:border-stone-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Scope & Structural Specifications
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 18-story RCC commercial building with post-tensioned slabs and curtain wall facade..."
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({ ...newProject, description: e.target.value })
                  }
                  className="w-full text-xs px-2.5 py-1.5 rounded-xs border border-stone-300 text-stone-900 focus:outline-none focus:border-stone-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-amber-700 hover:bg-amber-800 rounded-xs transition-colors cursor-pointer"
                >
                  {isSubmitting ? 'Registering...' : 'Save Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
