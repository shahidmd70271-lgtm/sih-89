import React, { useState } from 'react';
import {
  Building2,
  X,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  Hash,
  Users,
  Calendar,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AdminAffiliateCooperativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (coopName: string) => void;
}

export const AdminAffiliateCooperativeModal: React.FC<AdminAffiliateCooperativeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { addCooperative, t } = useApp();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [state, setState] = useState('Delhi NCR');
  const [district, setDistrict] = useState('');
  const [location, setLocation] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [establishedYear, setEstablishedYear] = useState<string>('2020');
  const [contactPhone, setContactPhone] = useState('');
  const [membersCount, setMembersCount] = useState<string>('120');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter the official Cooperative Society name.');
      return;
    }
    if (!registrationNumber.trim()) {
      setErrorMessage('Please enter the Government Registration Number.');
      return;
    }
    if (!contactPhone.trim()) {
      setErrorMessage('Please provide a contact phone or helpline number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const generatedCode = code.trim() || `COOP-${name.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-3)}`;
      const cleanLocation = location.trim() || `${district ? district + ', ' : ''}${state}`;

      await addCooperative({
        name: name.trim(),
        code: generatedCode,
        state: state.trim(),
        district: district.trim() || 'Central',
        location: cleanLocation,
        registrationNumber: registrationNumber.trim(),
        establishedYear: Number(establishedYear) || new Date().getFullYear(),
        contactPhone: contactPhone.trim(),
        contactNumber: contactPhone.trim(),
        membersCount: Number(membersCount) || 50,
        memberCount: Number(membersCount) || 50,
        verifiedWorkersCount: Math.round((Number(membersCount) || 50) * 0.85),
      });

      if (onSuccess) {
        onSuccess(name.trim());
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to affiliate cooperative society.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150 font-sans">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 relative overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Affiliate New Labour Cooperative Society
              </h3>
              <p className="text-xs text-slate-400">
                National Federation of Labour Cooperatives (NLCF) State Accreditation Desk
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-emerald-950">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Official Statutory Recognition</strong>
              <span className="text-emerald-800/90 leading-relaxed">
                Affiliated cooperatives gain immediate registration rights for their member shramiks, welfare cess distribution access, and verified trust badges across the Sahaayak network.
              </span>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <span>Cooperative Society Legal Name *</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rashtriya Shramik Labour Welfare Cooperative"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-emerald-500 font-medium"
              />
            </div>

            {/* Code */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span>Cooperative Code / Identifier</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. DL-LCS-094"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-emerald-500 font-medium font-mono"
              />
            </div>

            {/* Registration Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <span>Govt. Registration Number *</span>
              </label>
              <input
                type="text"
                required
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="e.g. MSCS/CR/2026/894"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-emerald-500 font-medium font-mono"
              />
            </div>

            {/* State */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>State / Union Territory *</span>
              </label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Delhi NCR, Maharashtra, Telangana"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-emerald-500 font-medium"
              />
            </div>

            {/* District */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">District / Region</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. South Delhi, Gurugram, Hyderabad"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-emerald-500 font-medium"
              />
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Headquarters Address / Area</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Hauz Khas, New Delhi"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-emerald-500 font-medium"
              />
            </div>

            {/* Contact Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Official Helpline / Phone *</span>
              </label>
              <input
                type="text"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="e.g. +91 11 2685 4120"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-emerald-500 font-medium"
              />
            </div>

            {/* Established Year */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Year Established</span>
              </label>
              <input
                type="number"
                value={establishedYear}
                onChange={(e) => setEstablishedYear(e.target.value)}
                placeholder="e.g. 2018"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-emerald-500 font-medium"
              />
            </div>

            {/* Member Count */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>Initial Enrolled Shramiks (Workers)</span>
              </label>
              <input
                type="number"
                value={membersCount}
                onChange={(e) => setMembersCount(e.target.value)}
                placeholder="e.g. 150"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-emerald-500 font-medium"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Affiliating Society...' : 'Affiliate Society'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
