import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Building2,
  FileText,
  Clock,
  Banknote,
  Receipt,
  HeartHandshake,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PaymentMode } from '../../types';
import { ServiceIcon } from '../common/ServiceIcon';

export const CustomerPaymentsView: React.FC = () => {
  const { currentUser, bookings, recordPaymentAndCompleteJob, t } = useApp();

  const [payingBookingId, setPayingBookingId] = useState<string | null>(null);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<PaymentMode>('Online');
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<string | null>(null);

  // Filter bookings for this customer
  const customerBookings = currentUser?.id
    ? bookings.filter((b) => !b.customer_id || b.customer_id === currentUser.id || b.customerName === currentUser.name)
    : bookings;

  const paidBookings = customerBookings.filter((b) => b.paymentStatus === 'paid' || b.status === 'paid');
  const pendingPaymentBookings = customerBookings.filter(
    (b) => (b.status === 'completed' || b.status === 'in_progress') && b.paymentStatus !== 'paid' && b.status !== 'paid'
  );

  const totalDirectWages = paidBookings.reduce((sum, b) => sum + (b.estimatedPrice || b.totalAmount || 0), 0);
  const totalWelfareCess = paidBookings.reduce((sum, b) => sum + (b.welfareCess || 15), 0);
  const totalPaidAmount = paidBookings.reduce((sum, b) => sum + (b.totalAmount || (b.estimatedPrice || 0) + 30), 0);

  const handlePayNow = async (bookingId: string) => {
    try {
      await recordPaymentAndCompleteJob(bookingId, selectedPaymentMode, 0);
      setPayingBookingId(null);
      setPaymentSuccessMessage(`Payment of ₹${customerBookings.find(b => b.id === bookingId)?.totalAmount || 329} processed successfully! 100% transparently settled to worker.`);
      setTimeout(() => setPaymentSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Payment processing failed.');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 mb-1">
          <span>{t('customerPortalTitle')}</span>
          <span>/</span>
          <span>{t('navFairPayments')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Fair Price Guarantee & Payment Receipts
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Transparent multi-state labour cooperative wage model. 90% direct to worker bank account + 5% social security welfare cess.
        </p>
      </div>

      {paymentSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center gap-2 text-xs text-emerald-950 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{paymentSuccessMessage}</span>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Direct Wages Paid
            </span>
            <Banknote className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">₹{totalDirectWages}</p>
          <span className="text-[10px] text-emerald-700 font-semibold block">
            Directly to shramik bank accounts
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Welfare Cess (5%)
            </span>
            <HeartHandshake className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">₹{totalWelfareCess}</p>
          <span className="text-[10px] text-slate-500 block">
            NLCF accident & health corpus
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Settled Invoices
            </span>
            <Receipt className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{paidBookings.length}</p>
          <span className="text-[10px] text-slate-500 block">
            GST exempt statutory services
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Pending Payments
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-900">{pendingPaymentBookings.length}</p>
          <span className="text-[10px] text-amber-800 font-semibold block">
            Awaiting completion settlement
          </span>
        </div>
      </div>

      {/* Fair Price Formula Explanation Card */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          <span>Statutory Cooperative Fair Wage Formula</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black">Zero Middleman Cut. Guaranteed Transparent Pricing.</h2>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          Under the Multi-State Cooperative Societies Act & NLCF guidelines, all citizen payments are split mathematically without surge pricing or platform commission deductions:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-xs">
            <span className="text-xs font-bold text-emerald-400 block mb-1">1. Direct Shramik Wage (90%)</span>
            <p className="text-[11px] text-slate-300">Base hourly rate set by registered trade guild, transferred directly to the worker.</p>
          </div>

          <div className="p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-xs">
            <span className="text-xs font-bold text-emerald-400 block mb-1">2. Worker Welfare Cess (5%)</span>
            <p className="text-[11px] text-slate-300">Statutory deposit into NLCF Shramik Health, Accident & Pension welfare fund.</p>
          </div>

          <div className="p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-xs">
            <span className="text-xs font-bold text-emerald-400 block mb-1">3. Cooperative Society Fee (₹15)</span>
            <p className="text-[11px] text-slate-300">Fixed statutory operations fee covering verification, tooling maintenance, and insurance.</p>
          </div>
        </div>
      </div>

      {/* Invoices & Bookings Ledger Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Service Invoices & Payment Ledger</h3>
            <p className="text-xs text-slate-400">Real-time receipts for all citizen booking requests</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
            {customerBookings.length} total entries
          </span>
        </div>

        {customerBookings.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Receipt className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-xs font-bold">No payment history yet.</p>
            <p className="text-[11px] text-slate-400">Bookings and invoices will be listed here automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Booking / Invoice</th>
                  <th className="py-3 px-4">Worker & Trade</th>
                  <th className="py-3 px-4">Date & Slot</th>
                  <th className="py-3 px-4 text-right">Base Wage</th>
                  <th className="py-3 px-4 text-right">Welfare Cess</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {customerBookings.map((b) => {
                  const isPaid = b.paymentStatus === 'paid' || b.status === 'paid';
                  const isCompletedAwaitingPay = b.status === 'completed' && !isPaid;

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 block">#{b.id}</span>
                        <span className="text-[10px] text-slate-400">{b.createdAt || 'Today'}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              b.workerAvatar ||
                              'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80'
                            }
                            alt={b.workerName}
                            className="w-7 h-7 rounded-lg object-cover border border-emerald-400"
                          />
                          <div>
                            <span className="font-bold text-slate-800 block">{b.workerName}</span>
                            <span className="text-[10px] text-emerald-700">{b.serviceType}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <span>{b.date}</span>
                        <span className="text-[10px] text-slate-400 block">{b.timeSlot}</span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                        ₹{b.estimatedPrice}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                        ₹{b.welfareCess || 15}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                        ₹{b.totalAmount || (b.estimatedPrice + 30)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800'
                              : isCompletedAwaitingPay
                              ? 'bg-amber-100 text-amber-900 animate-pulse'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isPaid ? 'Paid ✓' : isCompletedAwaitingPay ? 'Payment Due' : b.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {isCompletedAwaitingPay ? (
                          <button
                            onClick={() => setPayingBookingId(b.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1"
                          >
                            <span>Pay Now</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : isPaid ? (
                          <span className="text-[11px] text-emerald-700 font-semibold">
                            Receipt Available
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">On Completion</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pay Now Modal */}
      {payingBookingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <span>Complete Fair Wage Payment</span>
              </h3>
              <button
                onClick={() => setPayingBookingId(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Booking Reference:</span>
                <strong className="font-mono text-slate-900">#{payingBookingId}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Direct Shramik Wage:</span>
                <span className="font-bold text-slate-900">
                  ₹{customerBookings.find(b => b.id === payingBookingId)?.estimatedPrice || 299}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>NLCF Welfare Cess (5%):</span>
                <span>₹15</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Cooperative Platform Fee:</span>
                <span>₹15</span>
              </div>
              <div className="flex justify-between text-sm font-black text-emerald-800 pt-2 border-t border-slate-200">
                <span>Total Amount Due:</span>
                <span>₹{customerBookings.find(b => b.id === payingBookingId)?.totalAmount || 329}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Select Payment Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMode('Online')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    selectedPaymentMode === 'Online'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>UPI / Online</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPaymentMode('Cash')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    selectedPaymentMode === 'Cash'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span>Cash on Hand</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPayingBookingId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handlePayNow(payingBookingId)}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Pay</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
