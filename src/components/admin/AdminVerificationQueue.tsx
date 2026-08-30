import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  AlertTriangle,
  Eye,
  Building2,
  Award,
  RefreshCw,
  Search,
  Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Worker } from '../../types';

export const AdminVerificationQueue: React.FC = () => {
  const { workers, approveWorkerVerification, rejectWorkerVerification, removeWorkerFromNetwork, t } = useApp();

  const [selectedWorkerDoc, setSelectedWorkerDoc] = useState<Worker | null>(null);
  const [workerToRemove, setWorkerToRemove] = useState<Worker | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'removed' | 'all'>('pending');
  const [searchFilter, setSearchFilter] = useState('');
  const [actionNotification, setActionNotification] = useState<{ message: string; type: 'success' | 'reject' | 'remove' } | null>(null);

  // Group workers by their 3 clean statuses
  const pendingWorkers = workers.filter(
    (w) =>
      !w.isVerified &&
      w.verificationStatus !== 'Rejected' &&
      w.verificationStatus !== 'rejected' &&
      w.verificationStatus !== 'Removed' &&
      w.verificationStatus !== 'Inactive' &&
      (w as any).status !== 'removed' &&
      (w as any).status !== 'inactive'
  );

  const approvedActiveWorkers = workers.filter(
    (w) =>
      w.isVerified &&
      (w.verificationStatus === 'Verified' || w.verificationStatus === 'approved') &&
      w.verificationStatus !== 'Removed' &&
      w.verificationStatus !== 'Inactive' &&
      (w as any).status !== 'removed' &&
      (w as any).status !== 'inactive'
  );

  const removedWorkers = workers.filter(
    (w) =>
      w.verificationStatus === 'Removed' ||
      w.verificationStatus === 'Inactive' ||
      w.verificationStatus === 'removed' ||
      w.verificationStatus === 'inactive' ||
      (w as any).status === 'removed' ||
      (w as any).status === 'inactive' ||
      w.verificationStatus === 'Rejected' ||
      w.verificationStatus === 'rejected'
  );

  const handleApprove = async (workerId: string, workerName: string) => {
    await approveWorkerVerification(workerId);
    if (selectedWorkerDoc?.id === workerId) setSelectedWorkerDoc(null);
    setActionNotification({
      message: `Verified and issued Sahaayak Trust Shield to ${workerName}. Worker is now Active and bookable.`,
      type: 'success',
    });
    setTimeout(() => setActionNotification(null), 4000);
  };

  const handleReject = async (workerId: string, workerName: string) => {
    await rejectWorkerVerification(workerId);
    if (selectedWorkerDoc?.id === workerId) setSelectedWorkerDoc(null);
    setActionNotification({
      message: `Rejected application for ${workerName} from the verification desk.`,
      type: 'reject',
    });
    setTimeout(() => setActionNotification(null), 4000);
  };

  const handleConfirmRemove = async () => {
    if (!workerToRemove) return;
    setIsRemoving(true);
    try {
      await removeWorkerFromNetwork(workerToRemove.id);
      setActionNotification({
        message: `Removed ${workerToRemove.name} from the Sahaayak network. Historical jobs and payments are preserved.`,
        type: 'remove',
      });
      setWorkerToRemove(null);
      setTimeout(() => setActionNotification(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Worker removal failed.');
    } finally {
      setIsRemoving(false);
    }
  };

  // Filter current displayed list
  const currentList =
    activeTab === 'pending'
      ? pendingWorkers
      : activeTab === 'approved'
      ? approvedActiveWorkers
      : activeTab === 'removed'
      ? removedWorkers
      : workers;

  const filteredList = currentList.filter((w) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      w.name.toLowerCase().includes(q) ||
      w.skill.toLowerCase().includes(q) ||
      w.cooperativeName.toLowerCase().includes(q) ||
      (w.phone && w.phone.includes(q))
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 mb-1">
          <span>{t('centralAdminDesk')}</span>
          <span>/</span>
          <span>{t('workerVerificationDesk')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Labour Cooperative Verification & Network Desk
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Verify new skilled tradespeople, authorize cooperative affiliations, and manage active network rosters.
        </p>
      </div>

      {/* Action Notification Alert */}
      {actionNotification && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-2 ${
            actionNotification.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : actionNotification.type === 'remove'
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-red-50 border-red-300 text-red-950'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionNotification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : actionNotification.type === 'remove' ? (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{actionNotification.message}</span>
          </div>
          <button
            onClick={() => setActionNotification(null)}
            className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Status Management Tabs */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Status Segmented Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'pending'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Pending Verification</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                {pendingWorkers.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('approved')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'approved'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Approved / Active</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                {approvedActiveWorkers.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('removed')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'removed'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <XCircle className="w-3.5 h-3.5 text-red-600" />
              <span>Removed / Inactive</span>
              <span className="px-1.5 py-0.2 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">
                {removedWorkers.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>All Records ({workers.length})</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[220px]">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search worker name, skill..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 pl-8 focus:outline-emerald-500 font-medium"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Table View */}
        {filteredList.length > 0 ? (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[750px]">
              <thead>
                <tr className="text-slate-400 font-bold uppercase tracking-wider text-[11px] pb-2">
                  <th className="pb-3">{t('workerCandidateCol')}</th>
                  <th className="pb-3">{t('tradeExpCol')}</th>
                  <th className="pb-3">{t('cooperativeCol')}</th>
                  <th className="pb-3">Network Status</th>
                  <th className="pb-3 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((worker) => {
                  const isApproved =
                    worker.isVerified &&
                    (worker.verificationStatus === 'Verified' || worker.verificationStatus === 'approved') &&
                    worker.verificationStatus !== 'Removed' &&
                    worker.verificationStatus !== 'Inactive' &&
                    (worker as any).status !== 'removed' &&
                    (worker as any).status !== 'inactive';

                  const isRemoved =
                    worker.verificationStatus === 'Removed' ||
                    worker.verificationStatus === 'Inactive' ||
                    worker.verificationStatus === 'removed' ||
                    worker.verificationStatus === 'inactive' ||
                    (worker as any).status === 'removed' ||
                    (worker as any).status === 'inactive' ||
                    worker.verificationStatus === 'Rejected' ||
                    worker.verificationStatus === 'rejected';

                  const isPending = !isApproved && !isRemoved;

                  return (
                    <tr key={worker.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={worker.avatar}
                            alt={worker.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{worker.name}</span>
                              {isApproved && (
                                <span className="text-[10px] text-emerald-700 font-bold">✓</span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {worker.location} • {worker.phone || 'No phone recorded'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4">
                        <div className="font-semibold text-slate-800">
                          {t(`service_${worker.skill.replace(/[\s&]+/g, '')}`) || worker.skill}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {worker.experienceYears} {t('yearsExp')} • ₹{worker.basePricePerHour}/hr
                        </div>
                      </td>

                      <td className="py-4">
                        <div className="font-semibold text-slate-800">{worker.cooperativeName}</div>
                        <div className="text-[10px] text-emerald-700 font-mono">
                          {worker.verificationDocType}
                        </div>
                      </td>

                      <td className="py-4">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            <span>Approved / Active</span>
                          </span>
                        ) : isRemoved ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-800 bg-red-100 px-2.5 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                            <span>Removed / Inactive</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                            <span>Pending Verification</span>
                          </span>
                        )}
                      </td>

                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedWorkerDoc(worker)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            title={t('inspectDossier')}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{t('inspect')}</span>
                          </button>

                          {isPending && (
                            <>
                              <button
                                onClick={() => handleApprove(worker.id, worker.name)}
                                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{t('approve')}</span>
                              </button>

                              <button
                                onClick={() => handleReject(worker.id, worker.name)}
                                className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                              >
                                {t('reject')}
                              </button>
                            </>
                          )}

                          {isApproved && (
                            <button
                              onClick={() => setWorkerToRemove(worker)}
                              className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                              title="Remove worker from active network"
                            >
                              <XCircle className="w-3.5 h-3.5 text-red-600" />
                              <span>Remove Worker</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 rounded-2xl bg-slate-50 text-center border border-slate-200 text-slate-500 space-y-2">
            <ShieldCheck className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">
              {activeTab === 'pending'
                ? 'No worker applications awaiting audit'
                : activeTab === 'approved'
                ? 'No active approved workers in directory'
                : 'No workers matching this filter'}
            </h4>
            <p className="text-xs text-slate-500">
              {activeTab === 'pending'
                ? 'All submitted applicant dossiers have been reviewed.'
                : 'New verified workers will appear here upon administrator approval.'}
            </p>
          </div>
        )}
      </div>

      {/* CONFIRMATION DIALOG FOR WORKER REMOVAL */}
      {workerToRemove && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 leading-tight">
                  Remove this worker from the Sahaayak network?
                </h3>
                <p className="text-xs text-slate-500 pt-0.5">
                  Existing completed jobs and payment records will be preserved.
                </p>
              </div>
            </div>

            {/* Target Worker Details Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
              <img
                src={workerToRemove.avatar}
                alt={workerToRemove.name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-300 shrink-0"
              />
              <div className="min-w-0">
                <div className="font-bold text-slate-900 text-xs truncate">{workerToRemove.name}</div>
                <p className="text-[11px] text-slate-500 truncate">
                  {workerToRemove.skill} • {workerToRemove.cooperativeName}
                </p>
                <div className="text-[10px] text-slate-400 font-mono">
                  ID: #{workerToRemove.applicationId || workerToRemove.id}
                </div>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
              <div className="font-bold">What happens upon removal:</div>
              <ul className="list-disc pl-4 space-y-0.5 text-amber-800">
                <li>Worker immediately stops appearing on customer Find Services / Available Workers page.</li>
                <li>Worker is no longer bookable for new service requests.</li>
                <li>Existing completed bookings, earnings, payments, and welfare records remain intact.</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setWorkerToRemove(null)}
                disabled={isRemoving}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                disabled={isRemoving}
                className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>{isRemoving ? 'Removing...' : 'Remove Worker'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dossier Modal */}
      {selectedWorkerDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {t('verificationDossierTitle', { name: selectedWorkerDoc.name })}
              </h3>
              <button
                onClick={() => setSelectedWorkerDoc(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs max-h-[70vh] overflow-y-auto pr-1">
              {/* Applicant Header in Dossier */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <img
                  src={selectedWorkerDoc.avatar}
                  alt={selectedWorkerDoc.name}
                  className="w-12 h-12 rounded-xl object-cover border border-emerald-500 shadow-xs"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">{selectedWorkerDoc.name}</h4>
                    <span className="text-[10px] font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                      {selectedWorkerDoc.applicationId || 'PENDING-APP'}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs">
                    {selectedWorkerDoc.skill} • {selectedWorkerDoc.experienceYears} Years Exp • {selectedWorkerDoc.location}
                  </p>
                </div>
              </div>

              {/* Cooperative Attestation */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('labourCoopAttestation')}</span>
                </div>
                <p className="text-slate-700 font-medium">{selectedWorkerDoc.cooperativeName}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 font-mono pt-1">
                  <span>Membership ID: {selectedWorkerDoc.membershipId || 'COOP-2026-REG'}</span>
                  <span>Aadhaar: {selectedWorkerDoc.maskedAadhaar || 'XXXX XXXX 7741'}</span>
                </div>
              </div>

              {/* Uploaded Documents Dossier */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Uploaded Credentials & Documents</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {selectedWorkerDoc.documents?.length || selectedWorkerDoc.certifications?.length || 3} Files
                  </span>
                </div>

                <div className="space-y-1.5">
                  {selectedWorkerDoc.documents && selectedWorkerDoc.documents.length > 0 ? (
                    selectedWorkerDoc.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 text-[11px]"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <div className="min-w-0">
                            <strong className="block text-slate-900 truncate">{doc.name}</strong>
                            <span className="text-[10px] text-slate-400 font-mono">{doc.type} • {doc.fileSize}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                          Verified Format
                        </span>
                      </div>
                    ))
                  ) : (
                    selectedWorkerDoc.certifications.map((c) => (
                      <div key={c.id} className="bg-white p-2.5 rounded-xl border border-slate-200 text-[11px] space-y-0.5">
                        <strong className="text-slate-900">{c.title}</strong>
                        <p className="text-slate-500 font-mono">{c.issuingBody} ({c.year}) • No. {c.certificateNumber}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Work Samples Portfolio (if present) */}
              {selectedWorkerDoc.workSamples && selectedWorkerDoc.workSamples.length > 0 && (
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      <span>Work Samples Portfolio</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {selectedWorkerDoc.workSamples.length} Photos
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {selectedWorkerDoc.workSamples.map((ws) => (
                      <div key={ws.id} className="bg-white rounded-xl overflow-hidden border border-slate-200">
                        <img src={ws.imageUrl} alt={ws.title} className="w-full h-20 object-cover" />
                        <div className="p-1.5">
                          <span className="text-[10px] font-bold text-slate-800 block truncate">{ws.title}</span>
                          <span className="text-[9px] text-slate-400 line-clamp-1">{ws.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Emergency & Welfare Summary */}
              {selectedWorkerDoc.emergencyContact && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] space-y-1">
                  <span className="font-bold text-slate-700 block">Emergency & Welfare Record</span>
                  <div className="text-slate-600">
                    Contact: <strong>{selectedWorkerDoc.emergencyContact.name}</strong> ({selectedWorkerDoc.emergencyContact.relation}) • Tel: <span className="font-mono">{selectedWorkerDoc.emergencyContact.phone}</span>
                  </div>
                  {selectedWorkerDoc.insuranceDetails?.membership && (
                    <div className="text-slate-500 text-[10px]">
                      Scheme: {selectedWorkerDoc.insuranceDetails.membership} (Card: {selectedWorkerDoc.insuranceDetails.policyNumber})
                    </div>
                  )}
                </div>
              )}

              {/* Compliance Guarantee */}
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-950 text-[11px]">
                {t('biometricAadhaarMatched')} <br />
                {t('policeNocValid')}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => handleReject(selectedWorkerDoc.id, selectedWorkerDoc.name)}
                className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                {t('reject')} Application
              </button>

              <button
                onClick={() => handleApprove(selectedWorkerDoc.id, selectedWorkerDoc.name)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t('approveAndIssueShield')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
