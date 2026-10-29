import React, { useState } from 'react';
import { ReviewAlert } from '../types';
import { resolveAlert } from '../services/api';
import { getStageById } from '../constants/stages';

interface AlertsQueueViewProps {
  alerts: ReviewAlert[];
  onAlertUpdated: (alert: ReviewAlert) => void;
  onNavigateObservation?: (obsId: string) => void;
}

export const AlertsQueueView: React.FC<AlertsQueueViewProps> = ({
  alerts,
  onAlertUpdated,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('ALL');
  const [resolvingAlert, setResolvingAlert] = useState<ReviewAlert | null>(null);
  const [resolutionAction, setResolutionAction] = useState<string>('CONFIRMED_BY_ENGINEER');
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [resolvedBy, setResolvedBy] = useState<string>('Er. Vikram Menon (Chief Civil Engineer)');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'PENDING') return a.status === 'PENDING_REVIEW';
    if (filter === 'RESOLVED') return a.status !== 'PENDING_REVIEW';
    return true;
  });

  const handleOpenResolve = (alert: ReviewAlert) => {
    setResolvingAlert(alert);
    setResolutionAction('CONFIRMED_BY_ENGINEER');
    setResolutionNotes('');
  };

  const handleConfirmResolution = async () => {
    if (!resolvingAlert) return;
    setIsSubmitting(true);
    try {
      const updated = await resolveAlert(resolvingAlert.id, {
        status: resolutionAction,
        resolutionNotes: resolutionNotes || 'Civil engineering adjudication completed.',
        resolvedBy,
      });
      onAlertUpdated(updated);
      setResolvingAlert(null);
    } catch (err: any) {
      alert('Failed to resolve alert: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="border-b border-stone-200 pb-4">
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
          <span className="font-mono text-stone-600">IS 456 / Quality Control</span>
          <span aria-hidden="true" className="text-stone-300">·</span>
          <span>Discrepancy Adjudication</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-semibold text-stone-900 tracking-tight">
          Stage Discrepancy & Inspection Review Queue
        </h1>
        <p className="mt-0.5 text-xs sm:text-sm text-stone-600 max-w-3xl leading-relaxed">
          Discrepancies identified when claimed contractor milestones contradict visual structural evidence. Supervising engineers adjudicate billing holds, re-inspections, and stage adjustments.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-0.5 bg-stone-100 rounded-xs border border-stone-200 max-w-fit">
        {[
          { id: 'ALL', label: `All Alerts (${alerts.length})` },
          {
            id: 'PENDING',
            label: `Pending Review (${alerts.filter((a) => a.status === 'PENDING_REVIEW').length})`,
          },
          {
            id: 'RESOLVED',
            label: `Resolved (${alerts.filter((a) => a.status !== 'PENDING_REVIEW').length})`,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-3 py-1.5 text-xs font-medium rounded-xs transition-colors cursor-pointer ${
              filter === tab.id
                ? 'bg-stone-900 text-stone-100 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`bg-white rounded-xs border p-5 shadow-xs space-y-3.5 transition-colors ${
              alert.status === 'PENDING_REVIEW'
                ? 'border-amber-300'
                : 'border-stone-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
              <div>
                <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                  <span className="font-medium text-stone-800">
                    {alert.projectName}
                  </span>
                  <span aria-hidden="true" className="text-stone-300">·</span>
                  <span className="font-mono text-stone-500">{alert.createdAt.split('T')[0]}</span>
                </div>
                <h3 className="text-sm font-semibold text-stone-900">
                  {alert.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-xs font-medium border ${
                    alert.status === 'PENDING_REVIEW'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-stone-100 text-stone-700 border-stone-200'
                  }`}
                >
                  {alert.status.replace('_', ' ')}
                </span>

                {alert.status === 'PENDING_REVIEW' && (
                  <button
                    onClick={() => handleOpenResolve(alert)}
                    className="px-3 py-1 text-xs font-medium text-white bg-amber-700 hover:bg-amber-800 rounded-xs transition-colors cursor-pointer"
                  >
                    Adjudicate Discrepancy
                  </button>
                )}
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              {alert.description}
            </p>

            {/* Stages Comparative Clean Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-stone-50 p-3 rounded-xs border border-stone-200">
              <div>
                <span className="text-stone-500 block text-[11px] font-medium">
                  Claimed by Contractor / Field Staff
                </span>
                <span className="font-medium text-stone-900">
                  {getStageById(alert.selectedCategory).name}
                </span>
              </div>

              <div>
                <span className="text-stone-500 block text-[11px] font-medium">
                  Automated Stage Classification
                </span>
                <span className="font-semibold text-amber-900">
                  {getStageById(alert.predictedCategory).name}
                </span>
              </div>
            </div>

            {alert.status !== 'PENDING_REVIEW' && (
              <div className="text-xs bg-emerald-50/70 p-3 rounded-xs border border-emerald-200 text-emerald-900">
                <div className="font-medium mb-0.5">
                  Resolution Logged by {alert.resolvedBy} on{' '}
                  <span className="font-mono">{alert.resolvedAt?.split('T')[0]}</span>:
                </div>
                <div className="text-emerald-800">{alert.resolutionNotes}</div>
              </div>
            )}
          </div>
        ))}

        {filteredAlerts.length === 0 && (
          <div className="p-12 text-center bg-white rounded-xs border border-stone-200">
            <div className="text-xs font-semibold text-stone-900">
              All Category Alerts Cleared
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Zero pending discrepancies awaiting civil engineer review.
            </p>
          </div>
        )}
      </div>

      {/* Resolution Adjudication Modal */}
      {resolvingAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4">
          <div className="bg-white rounded-xs shadow-lg max-w-lg w-full p-5 border border-stone-200 space-y-3.5">
            <h3 className="text-base font-semibold text-stone-900">
              Civil Engineer Adjudication
            </h3>
            <p className="text-xs text-stone-500">
              Formal resolution for dispute between contractor claim ({resolvingAlert.selectedCategory}) and automated stage detection ({resolvingAlert.predictedCategory}).
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Determination Action *
                </label>
                <select
                  value={resolutionAction}
                  onChange={(e) => setResolutionAction(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-xs border border-stone-300 bg-white text-stone-900"
                >
                  <option value="CONFIRMED_BY_ENGINEER">
                    Confirm Inspection Finding (Hold Billing & Adjust Stage)
                  </option>
                  <option value="OVERRIDDEN_BY_ENGINEER">
                    Override with Justification (Accept Contractor Milestone)
                  </option>
                  <option value="DISMISSED">
                    Request Immediate Field Re-inspection
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Signatory Engineer Name *
                </label>
                <input
                  type="text"
                  value={resolvedBy}
                  onChange={(e) => setResolvedBy(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-xs border border-stone-300 bg-white text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Engineering Justification & Minutes *
                </label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="State technical basis: e.g. Physical site inspection confirmed blockwork in progress; facade mullions not delivered to site yet. Deduction applied to RA Bill #4."
                  className="w-full text-xs px-2.5 py-1.5 rounded-xs border border-stone-300 bg-white text-stone-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setResolvingAlert(null)}
                className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmResolution}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-amber-700 hover:bg-amber-800 rounded-xs transition-colors cursor-pointer"
              >
                {isSubmitting ? 'Recording...' : 'Commit Determination'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
