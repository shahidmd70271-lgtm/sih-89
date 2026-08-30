import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({ isOpen, onClose }) => {
  const { loginAsCustomer, setActiveView, setCurrentRole, t } = useApp();

  const [authMethod, setAuthMethod] = useState<'google' | 'phone'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      await loginAsCustomer({
        provider: 'google',
        name: customerName.trim() || 'Citizen Customer',
        email: emailAddress.trim() || 'citizen.customer@gmail.com',
      });
      setCurrentRole('customer');
      setActiveView('customer-dashboard');
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = phoneNumber.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return;
    }
    setErrorMessage('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setOtpStep(true);
      setOtpCode('5842'); // Pre-fill sample OTP for convenient testing
    }, 600);
  };

  const handleVerifyOtpAndLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 4) {
      setErrorMessage('Please enter the 4-digit or 6-digit OTP code');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    try {
      await loginAsCustomer({
        provider: 'phone',
        phone: phoneNumber.startsWith('+91') ? phoneNumber : `+91 ${phoneNumber}`,
        name: customerName.trim() || 'Citizen Customer',
        otp: otpCode,
      });
      setCurrentRole('customer');
      setActiveView('customer-dashboard');
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setOtpStep(false);
    setOtpCode('');
    setErrorMessage('');
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
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Customer Login
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Sign in to book certified Labour Cooperative workers with verified credentials & fair pricing.
          </p>
        </div>

        {/* Method Switcher Tabs */}
        {!otpStep && (
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('phone');
                handleReset();
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMethod === 'phone'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mobile OTP</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod('google');
                handleReset();
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMethod === 'google'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google Account</span>
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            {errorMessage}
          </div>
        )}

        {/* Content Body */}
        {authMethod === 'google' ? (
          <div className="space-y-4 pt-1">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-slate-600">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>One-Click Citizen Verification</span>
              </div>
              <p>
                Sign in securely with your Google profile to sync bookings, track dispatch status, and manage service receipts.
              </p>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoading ? 'Signing in...' : 'Continue with Google'}</span>
            </button>
          </div>
        ) : !otpStep ? (
          /* Phone Input Form */
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Your Full Name (Optional)
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-medium text-slate-900 focus:bg-white focus:outline-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                10-Digit Mobile Number
              </label>
              <div className="flex rounded-xl border border-slate-300 overflow-hidden bg-slate-50 focus-within:bg-white focus-within:border-emerald-500">
                <span className="px-3 py-2.5 bg-slate-200/70 text-slate-600 text-xs font-bold flex items-center">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="98765 43210"
                  required
                  className="w-full text-xs px-3 py-2.5 font-mono font-bold text-slate-900 focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isLoading ? 'Sending SMS OTP...' : 'Get OTP Verification Code'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* OTP Verification Form */
          <form onSubmit={handleVerifyOtpAndLogin} className="space-y-4 animate-in fade-in">
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
              <div>
                <span className="font-bold block">OTP Sent via SMS</span>
                <span className="text-slate-600 font-mono text-[11px]">+91 {phoneNumber}</span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-emerald-700 hover:underline font-bold text-[11px] cursor-pointer"
              >
                Change Number
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Enter 4-Digit Verification OTP
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="5842"
                required
                autoFocus
                className="w-full text-center tracking-widest text-lg font-mono font-black bg-slate-50 border border-slate-300 rounded-xl py-2.5 text-slate-900 focus:bg-white focus:outline-emerald-500"
              />
              <p className="text-[10px] text-slate-400 text-center">
                Demo code: <strong className="text-emerald-700 font-mono">5842</strong> or any 4 digits
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isLoading ? 'Verifying & Logging In...' : 'Verify OTP & Enter Customer Portal'}</span>
            </button>
          </form>
        )}

        {/* Trust Footer */}
        <div className="pt-2 border-t border-slate-100 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Sahaayak Citizen Protection • Zero Spam Guarantee</span>
        </div>
      </div>
    </div>
  );
};
