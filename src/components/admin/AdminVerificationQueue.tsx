import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  Eye,
  Building2,
  Award,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Worker } from '../../types';

export const AdminVerificationQueue: React.FC = () => {
  const { workers, approveWorkerVerification, rejectWorkerVerification, t } = useApp();

  const [selectedWorkerDoc, setSelectedWorkerDoc] = useState<Worker | null>(null);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [filterTrade, setFilterTrade] = useState('All');
  const [actionNotification, setActionNotification] = useState<{ message: string; type: 'success' | 'reject' } | null>(null);

  const pendingWorkers = workers.filter((w) => !w.isVerified && w.verificationStatus !== 'Rejected');
  const verifiedWorkers = workers.filter((w) => w.isVerified);

  const handleApprove = (workerId: string, workerName: string) => {
    approveWorkerVerification(workerId);
    if (selectedWorkerDoc?.id === workerId) setSelectedWorkerDoc(null);
    setActionNotification({
      message: `Verified and issued Sahaayak Trust Shield to ${workerName}.`,
      type: 'success',
    });
    setTimeout(() => setActionNotification(null), 4000);
  };

  const handleReject = (workerId: string, workerName: string) => {
    rejectWorkerVerification(workerId);
    if (selectedWorkerDoc?.id === workerId) setSelectedWorkerDoc(null);
    setActionNotification({
      message: `Rejected and removed application for ${workerName} from the verification desk.`,
      type: 'reject',
    });
    setTimeout(() => setActionNotification(null), 4000);
  };

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
          {t('labourVerificationDeskTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          {t('labourVerificationDeskSub')}
        </p>
      </div>

      {/* Action Notification Alert */}
      {actionNotification && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-2 ${
            actionNotification.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-red-50 border-red-300 text-red-950'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionNotification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
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

      {/* Pending Audits Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black text-slate-900">{t('pendingReviewApplications')}</h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
              {pendingWorkers.length} {t('pending')}
            </span>
          </div>

          <span className="text-xs text-slate-400">
            {t('clickInspectDossierSub')}
          </span>
        </div>

        {pendingWorkers.length > 0 ? (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead>
                <tr className="text-slate-400 font-bold uppercase tracking-wider text-[11px] pb-2">
                  <th className="pb-3">{t('workerCandidateCol')}</th>
                  <th className="pb-3">{t('tradeExpCol')}</th>
                  <th className="pb-3">{t('cooperativeCol')}</th>
                  <th className="pb-3">{t('submittedDocsCol')}</th>
                  <th className="pb-3 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingWorkers.map((worker) => (
                  <tr key={worker.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={worker.avatar}
                          alt={worker.name}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{worker.name}</div>
                          <div className="text-[11px] text-slate-400">{worker.location}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4">
                      <div className="font-semibold text-slate-800">
                        {t(`service_${worker.skill.replace(/[\s&]+/g, '')}`) || worker.skill}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {worker.experienceYears} {t('yearsExp')}
                      </div>
                    </td>

                    <td className="py-4">
                      <div className="font-semibold text-slate-800">{worker.cooperativeName}</div>
                      <div className="text-[10px] text-emerald-700 font-mono">
                        {worker.verificationDocType}
                      </div>
                    </td>

                    <td className="py-4">
                      <div className="flex flex-wrap gap-1">
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                          {t('aadhaarBadge')}
                        </span>
                        <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
                          {t('nsdcCertBadge')}
                        </span>
                        <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-medium">
                          {t('policeNocBadge')}
                        </span>
                      </div>
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-emerald-50 rounded-2xl p-8 text-center border border-emerald-200 text-emerald-950 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-bold">{t('allDossiersCleared')}</h4>
            <p className="text-xs text-emerald-800">
              {t('noWorkerAppsWaiting')}
            </p>
          </div>
        )}
      </div>

      {/* Verified Workers Master Roster */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              {t('activeVerifiedShramikDir', { count: verifiedWorkers.length })}
            </h3>
            <p className="text-xs text-slate-500">{t('liveInSearchCatalog')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {verifiedWorkers.map((w) => (
            <div
              key={w.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <img
                  src={w.avatar}
                  alt={w.name}
                  className="w-10 h-10 rounded-xl object-cover"
                />
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-900">{w.name}</span>
                    <span className="text-[10px] text-emerald-700 font-bold">✓</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {t(`service_${w.skill.replace(/[\s&]+/g, '')}`) || w.skill} • ⭐ {w.rating}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                {t('liveActiveBadge')}
              </span>
            </div>
          ))}
        </div>
      </div>

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
