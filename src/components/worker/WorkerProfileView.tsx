import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Award,
  Clock,
  MapPin,
  FileText,
  Building,
  CheckCircle2,
  Save,
  Phone,
  CreditCard,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const WorkerProfileView: React.FC = () => {
  const { currentWorker, workers, t } = useApp();
  const worker = currentWorker;

  if (!worker) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs max-w-xl mx-auto my-12 space-y-4">
        <h3 className="text-lg font-bold text-slate-900">No Worker Profile Found</h3>
        <p className="text-xs text-slate-500">Please register or log in with your worker credentials.</p>
      </div>
    );
  }

  const [name, setName] = useState(worker.name || '');
  const [skill, setSkill] = useState(worker.skill || 'Plumbing');
  const [experienceYears, setExperienceYears] = useState(worker.experienceYears || 3);
  const [bio, setBio] = useState(worker.bio || '');
  const [workingHours, setWorkingHours] = useState(worker.workingHours || '9:00 AM - 7:00 PM');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 mb-1">
          <span>{t('workerPortalHeader')}</span>
          <span>/</span>
          <span>{t('shramikProfileDossier')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t('myProfessionalProfileTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          {t('myProfessionalProfileSub')}
        </p>
      </div>

      {isSaved && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center gap-2 text-xs text-emerald-950">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{t('profileSavedSuccess')}</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        {/* Top Avatar & Verification Status */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
          <div className="relative">
            <img
              src={worker.avatar}
              alt={worker.name}
              className="w-24 h-24 rounded-3xl object-cover border-4 border-emerald-500 shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h3 className="text-xl font-black text-slate-900">{name}</h3>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {t('cooperativeSocietyAttested')}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {t('cooperativeLabel')}: <strong>{worker.cooperativeName}</strong>
            </p>
            <p className="text-xs text-slate-400 font-mono">
              {t('govtCoopReg')}: {worker.verificationDocType} • {t('verified')}: {worker.verificationDate}
            </p>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">{t('fullLegalName')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-emerald-500 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">{t('primaryTradeSkill')}</label>
            <input
              type="text"
              value={skill}
              onChange={(e) => setSkill(e.target.value as any)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-emerald-500 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">{t('yearsExperience')}</label>
            <input
              type="number"
              value={experienceYears}
              onChange={(e) => setExperienceYears(Number(e.target.value))}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-emerald-500 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">{t('dailyWorkingHours')}</label>
            <input
              type="text"
              value={workingHours}
              onChange={(e) => setWorkingHours(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-emerald-500 font-medium"
            />
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">{t('professionalBioCitizens')}</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-emerald-500 font-medium"
          />
        </div>

        {/* Bank & Payment Settlement Account Details */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>{t('directWageBankAccount')}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
            <div>
              <span className="text-[10px] text-slate-400 block">{t('bankName')}</span>
              <strong className="text-slate-800">State Bank of India (SBI)</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">{t('accountNumber')}</span>
              <strong className="font-mono text-slate-800">XXXX-XXXX-4912</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">{t('ifscCode')}</span>
              <strong className="font-mono text-slate-800">SBIN0004921</strong>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{t('updateProfile')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
