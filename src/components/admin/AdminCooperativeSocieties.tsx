import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Users,
  ShieldCheck,
  Award,
  Phone,
  Search,
  ExternalLink,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminAffiliateCooperativeModal } from './AdminAffiliateCooperativeModal';

export const AdminCooperativeSocieties: React.FC = () => {
  const { cooperatives, t } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAffiliateModalOpen, setIsAffiliateModalOpen] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const filteredCooperatives = (cooperatives || []).filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.location && c.location.toLowerCase().includes(q)) ||
      (c.state && c.state.toLowerCase().includes(q)) ||
      (c.registrationNumber && c.registrationNumber.toLowerCase().includes(q)) ||
      (c.code && c.code.toLowerCase().includes(q))
    );
  });

  const handleAffiliateSuccess = (coopName: string) => {
    setSuccessNotice(`Successfully affiliated ${coopName} to the Sahaayak cooperative federation.`);
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 mb-1">
            <span>{t('centralAdminDesk')}</span>
            <span>/</span>
            <span>{t('cooperativeRegistry')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('affiliatedLabourCoops')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('affiliatedLabourCoopsSub')}
          </p>
        </div>

        <button
          id="btn-affiliate-new-coop"
          onClick={() => setIsAffiliateModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('affiliateNewCoop')}</span>
        </button>
      </div>

      {/* Success Notice Banner */}
      {successNotice && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center gap-2.5 text-xs text-emerald-950 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('searchCoopPlaceholder')}
          className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 pl-9 text-slate-900 focus:outline-emerald-500 font-medium shadow-xs"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
      </div>

      {/* Societies Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCooperatives.map((coop) => (
          <div
            key={coop.id}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{coop.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{coop.location || coop.district}, {coop.state}</span>
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                ✓ Verified
              </span>
            </div>

            {/* Registration Details */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>{t('govtRegNo')}:</span>
                <strong className="font-mono text-slate-900">{coop.registrationNumber}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{t('establishedYear')}:</span>
                <span className="font-medium text-slate-900">{coop.establishedYear}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{t('helplineOffice')}:</span>
                <span className="font-medium text-slate-900">{coop.contactPhone || coop.contactNumber}</span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <span className="text-[10px] text-emerald-800 uppercase font-bold block">
                  {t('enrolledShramiks')}
                </span>
                <span className="text-base font-black text-emerald-950">
                  {coop.membersCount || coop.memberCount || 50} {t('verified')}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">
                  {t('completedCitizenGigs')}
                </span>
                <span className="text-base font-black text-slate-900">
                  {(coop.completedJobsTotal || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t('centralRegistrarVerified')}</span>
              </span>
              <span className="font-mono text-[10px] font-bold text-slate-400">
                Code: {coop.code}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Affiliate Cooperative Modal */}
      <AdminAffiliateCooperativeModal
        isOpen={isAffiliateModalOpen}
        onClose={() => setIsAffiliateModalOpen(false)}
        onSuccess={handleAffiliateSuccess}
      />
    </div>
  );
};
