import React, { useState } from 'react';
import {
  X,
  HardHat,
  Phone,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface WorkerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkerAuthModal: React.FC<WorkerAuthModalProps> = ({ isOpen, onClose }) => {
  const {
    loginAsWorker,
    setIsWorkerJoinModalOpen,
    setActiveView,
    setCurrentRole,
  } = useApp();

  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [workerStatusResult, setWorkerStatusResult] = useState<{
    status: 'Pending' | 'Verified' | 'Rejected' | 'NotFound';
    workerName?: string;
    applicationId?: string;
    cooperativeName?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleWorkerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const identifier = authMethod === 'email' ? emailInput.trim() : phoneInput.trim();

    if (!identifier) {
      setErrorMessage(
        authMethod === 'email'
          ? 'Please enter your registered worker email address'
          : 'Please enter your registered 10-digit mobile number'
      );
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Please enter your account password. Registration ID alone cannot be used to sign in.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setWorkerStatusResult(null);

    try {
      const result = await loginAsWorker({
        emailOrPhone: identifier,
        password: password.trim(),
      });

      if (result.status === 'Verified') {
        setCurrentRole('worker');
        setActiveView('worker-dashboard');
        onClose();
      } else {
        setWorkerStatusResult({
          status: result.status,
          workerName: result.worker?.name || result.user?.name || 'Worker Applicant',
          applicationId: result.worker?.applicationId || result.user?.applicationId || 'PENDING-APP',
          cooperativeName: result.worker?.cooperativeName || 'Labour Cooperative Society',
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Worker authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenRegistration = () => {
    onClose();
    setIsWorkerJoinModalOpen(true);
  };

  const handleReset = () => {
    setWorkerStatusResult(null);
    setErrorMessage('');
    setPassword('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
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
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
            <HardHat className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Worker Sign In
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Secure authentication for certified Labour Cooperative workers. Enter registered credentials to access your control desk.
          </p>
        </div>

        {/* Pending / Rejected Status Modal View */}
        {workerStatusResult && (
          <div className="space-y-4 animate-in fade-in">
            {workerStatusResult.status === 'Pending' ? (
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Your worker application is awaiting verification.</h4>
                    <span className="text-[11px] font-mono text-amber-800 font-bold">
                      Application ID: #{workerStatusResult.applicationId}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-amber-900 leading-relaxed">
                  Namaste <strong>{workerStatusResult.workerName}</strong>, your account has authenticated successfully. However, your dossier is currently under <strong>NLCF Cooperative Admin audit</strong>.
                </p>

                <div className="text-[11px] bg-white/80 p-3 rounded-xl border border-amber-200 space-y-1">
                  <div className="font-semibold text-slate-800">Verification Steps:</div>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <span>✓</span> <span>Account Created & Document Dossier Submitted</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-800 font-medium">
                    <span>⏳</span> <span>{workerStatusResult.cooperativeName} Society Verification Pending</span>
                  </div>
                </div>

                <p className="text-[11px] text-amber-800 italic">
                  Once approved by the Administrator, you will be granted access to the Worker Dashboard to receive and execute direct customer bookings.
                </p>
              </div>
            ) : workerStatusResult.status === 'Rejected' ? (
              <div className="p-5 rounded-2xl bg-red-50 border border-red-300 text-red-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-red-700">
                  <XCircle className="w-5 h-5 shrink-0" />
                  <span>Application Not Approved</span>
                </div>
                <p className="text-xs text-red-800">
                  Your submitted worker application could not be approved by {workerStatusResult.cooperativeName}. Please contact the society representative for document clarification.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
                <p className="font-semibold text-slate-800">
                  No registered worker account found matching these credentials.
                </p>
                <p>
                  If you are a new skilled tradesperson, please submit a worker application below.
                </p>
              </div>
            )}

            <button
              onClick={handleReset}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
            >
              Back to Sign In
            </button>
          </div>
        )}

        {/* Secure Sign In Form */}
        {!workerStatusResult && (
          <form onSubmit={handleWorkerLogin} className="space-y-4">
            {/* Method Tabs */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('email');
                  setErrorMessage('');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMethod === 'email'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-emerald-600" />
                <span>Email + Password</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('phone');
                  setErrorMessage('');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMethod === 'phone'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Phone + Password</span>
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Email or Phone Input */}
            {authMethod === 'email' ? (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Registered Worker Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="e.g. worker@coop.in"
                    required
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-medium text-slate-900 focus:bg-white focus:outline-emerald-500 pr-10"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Registered Mobile Number
                </label>
                <div className="flex rounded-xl border border-slate-300 overflow-hidden bg-slate-50 focus-within:bg-white focus-within:border-emerald-500">
                  <span className="px-3 py-2.5 bg-slate-200/70 text-slate-600 text-xs font-bold flex items-center">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    required
                    className="w-full text-xs bg-transparent px-3 py-2.5 font-medium text-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Account Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-mono text-slate-900 focus:bg-white focus:outline-emerald-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In to Worker Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Join as new worker promo */}
        <div className="pt-3 border-t border-slate-100 text-center space-y-2">
          <p className="text-xs text-slate-500 font-medium">
            Not yet registered with a Labour Cooperative Society?
          </p>
          <button
            type="button"
            onClick={handleOpenRegistration}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Join as a Worker / Apply for Verification</span>
          </button>
        </div>
      </div>
    </div>
  );
};
