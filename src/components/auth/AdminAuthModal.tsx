import React, { useState } from 'react';
import {
  X,
  Building2,
  Lock,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({ isOpen, onClose }) => {
  const { loginAsAdmin, setActiveView, setCurrentRole } = useApp();

  const [adminEmail, setAdminEmail] = useState('demo.admin@gmail.com');
  const [passcode, setPasscode] = useState('demo1234');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim() || !passcode.trim()) {
      setErrorMessage('Please enter administrator email and password');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    try {
      await loginAsAdmin(adminEmail, passcode);
      setCurrentRole('admin');
      setActiveView('admin-verification');
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Administrative verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoFill = () => {
    setAdminEmail('demo.admin@gmail.com');
    setPasscode('demo1234');
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-slate-200 shadow-2xl relative space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center mx-auto shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3 h-3" />
            <span>Restricted Governance Portal</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Cooperative Admin Login
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Access reserved for National Labour Cooperative Federation (NLCF) verification officers and society administrators.
          </p>
        </div>

        {/* Notice Box */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Official Authentication Required</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Admin accounts are strictly pre-provisioned. Public user self-registration is disabled for the governance desk.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Admin Form */}
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Official Administrator Email
            </label>
            <input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="admin@sahaayak.gov.in"
              required
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-medium text-slate-900 focus:bg-white focus:outline-slate-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Administrative Passcode
            </label>
            <div className="relative">
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-mono text-slate-900 focus:bg-white focus:outline-slate-900 pr-10"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Quick Demo Pre-fill Pill */}
          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-slate-400">Hackathon Evaluation:</span>
            <button
              type="button"
              onClick={handleQuickDemoFill}
              className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline cursor-pointer"
            >
              Fill Demo Credentials
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-lg shadow-slate-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{isLoading ? 'Verifying Credentials...' : 'Access Admin Verification Desk'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 text-center text-[11px] text-slate-400">
          <span>Protected under NLCF Cooperative Oversight Protocol</span>
        </div>
      </div>
    </div>
  );
};
