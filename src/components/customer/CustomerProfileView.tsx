import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Save,
  CheckCircle2,
  CalendarCheck,
  CreditCard,
  HeartHandshake,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CustomerProfileView: React.FC = () => {
  const { currentUser, bookings, t } = useApp();

  const [name, setName] = useState(currentUser?.name || 'Citizen Customer');
  const [email, setEmail] = useState(currentUser?.email || 'citizen@gmail.com');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 98765 43210');
  const [address, setAddress] = useState('Sector 29, Leisure Valley, Gurugram, Delhi NCR');
  const [pincode, setPincode] = useState('122001');
  const [emergencyName, setEmergencyName] = useState('Family Emergency Contact');
  const [emergencyPhone, setEmergencyPhone] = useState('+91 98111 22334');
  const [isSaved, setIsSaved] = useState(false);

  // Calculate live statistics for this customer
  const customerBookings = currentUser?.id
    ? bookings.filter((b) => !b.customer_id || b.customer_id === currentUser.id || b.customerName === currentUser.name)
    : bookings;

  const totalBookingsCount = customerBookings.length;
  const completedBookings = customerBookings.filter((b) => b.status === 'completed' || b.status === 'paid');
  const totalWagesPaid = completedBookings.reduce((sum, b) => sum + (b.totalAmount || b.estimatedPrice || 0), 0);
  const totalWelfareCessContributed = completedBookings.reduce((sum, b) => sum + (b.welfareCess || 15), 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'CU';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 mb-1">
          <span>{t('customerPortalTitle')}</span>
          <span>/</span>
          <span>{t('navProfile')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Citizen Customer Profile & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage your verified account identity, service delivery addresses, emergency SOS contacts, and cooperative fair-wage ledger.
        </p>
      </div>

      {isSaved && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center gap-2 text-xs text-emerald-950 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile details and emergency preferences successfully updated!</span>
        </div>
      )}

      {/* Citizen Impact & Contribution Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Services Used
            </span>
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalBookingsCount}</p>
          <span className="text-[11px] text-slate-500 block">
            {completedBookings.length} completed & verified
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Direct Wages to Shramiks
            </span>
            <CreditCard className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">₹{totalWagesPaid}</p>
          <span className="text-[11px] text-emerald-700 font-semibold block">
            100% transparent zero-commission
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Welfare Cess Contributed
            </span>
            <HeartHandshake className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">₹{totalWelfareCessContributed}</p>
          <span className="text-[11px] text-slate-500 block">
            5% direct to NLCF health & insurance fund
          </span>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        {/* Top Avatar & Verification Status */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
          <div className="w-20 h-20 rounded-3xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-emerald-600/30 shrink-0">
            {initials}
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h3 className="text-xl font-black text-slate-900">{name}</h3>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Citizen Account</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-3 pt-0.5">
              <span>Auth: {currentUser?.authProvider === 'phone' ? 'Mobile OTP' : 'Google Identity'}</span>
              <span>•</span>
              <span className="font-mono text-slate-400">UID: #{currentUser?.id?.slice(0, 10) || 'usr-default'}</span>
            </p>
          </div>
        </div>

        {/* Personal Details Section */}
        <div className="space-y-4">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            1. Personal & Contact Information
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-emerald-500 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Mobile Number</span>
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-emerald-500 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-emerald-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Default Service Address */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            2. Default Service Delivery Address
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Street / Locality / Apartment</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-emerald-500 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Postal PIN Code</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-emerald-500 font-medium font-mono"
              />
            </div>
          </div>
        </div>

        {/* Emergency SOS Contact Preferences */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>3. Emergency SOS Broadcast Contacts</span>
            </h4>
            <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded">
              GPS Enabled
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-rose-50/40 p-4 rounded-2xl border border-rose-100">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Emergency Contact Person</label>
              <input
                type="text"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-rose-500 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Emergency Phone Number</label>
              <input
                type="text"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-rose-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
