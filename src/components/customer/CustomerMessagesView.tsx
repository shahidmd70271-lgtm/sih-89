import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Phone,
  ShieldCheck,
  CheckCheck,
  User,
  Clock,
  MapPin,
  Inbox,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ServiceIcon } from '../common/ServiceIcon';

export const CustomerMessagesView: React.FC = () => {
  const {
    currentUser,
    bookings,
    activeBooking,
    setActiveBookingById,
    chatMessages,
    sendChatMessage,
    setIsCallModalOpen,
    t,
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    activeBooking?.id || (bookings.length > 0 ? bookings[0].id : null)
  );

  // Filter bookings for this customer
  const customerBookings = currentUser?.id
    ? bookings.filter((b) => !b.customer_id || b.customer_id === currentUser.id || b.customerName === currentUser.name)
    : bookings;

  const currentChatBooking =
    customerBookings.find((b) => b.id === selectedBookingId) ||
    activeBooking ||
    (customerBookings.length > 0 ? customerBookings[0] : null);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    sendChatMessage(inputMessage.trim(), 'customer');
    setInputMessage('');
  };

  const quickReplies = [
    t('quickReply1') || 'Please call me when you reach the main gate.',
    t('quickReply2') || 'I am sharing the exact apartment number.',
    t('quickReply3') || 'What is your current estimated arrival time?',
    t('quickReply4') || 'Service OTP is ready for verification.',
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 mb-1">
          <span>{t('customerPortalTitle')}</span>
          <span>/</span>
          <span>{t('navMessages')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Citizen & Labour Cooperative Messages
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Direct real-time communication channel with your assigned cooperative trade shramik.
        </p>
      </div>

      {customerBookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-xs text-center space-y-4 max-w-md mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <Inbox className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Active Service Chats</h3>
          <p className="text-xs text-slate-500">
            When you book a certified cooperative worker, a secure, direct communication channel will open here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden min-h-[580px]">
          {/* Left Column: Conversation List */}
          <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-200 p-4 space-y-3 bg-slate-50/50">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Service Conversations
              </span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                {customerBookings.length}
              </span>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[500px]">
              {customerBookings.map((b) => {
                const isSelected = currentChatBooking?.id === b.id;
                return (
                  <div
                    key={b.id}
                    onClick={() => {
                      setSelectedBookingId(b.id);
                      setActiveBookingById(b.id);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-300 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-emerald-200'
                    }`}
                  >
                    <img
                      src={
                        b.workerAvatar ||
                        'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80'
                      }
                      alt={b.workerName}
                      className="w-11 h-11 rounded-xl object-cover border border-emerald-400 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{b.workerName}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">#{b.id}</span>
                      </div>
                      <p className="text-[11px] text-emerald-700 font-semibold truncate">
                        {b.serviceType}
                      </p>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {b.status} • {b.date}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Chat Window */}
          <div className="lg:col-span-8 flex flex-col justify-between h-full bg-white">
            {currentChatBooking ? (
              <>
                {/* Chat Top Banner */}
                <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        currentChatBooking.workerAvatar ||
                        'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80'
                      }
                      alt={currentChatBooking.workerName}
                      className="w-10 h-10 rounded-full object-cover border border-emerald-400"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-white">{currentChatBooking.workerName}</h4>
                        <span className="text-[10px] text-emerald-400 font-bold">✓ Verified Shramik</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {currentChatBooking.serviceType} • {currentChatBooking.timeSlot} • Status: {currentChatBooking.status}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsCallModalOpen(true)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                      title="Call Worker"
                    >
                      <Phone className="w-4 h-4" />
                      <span className="hidden sm:inline">Call Worker</span>
                    </button>
                  </div>
                </div>

                {/* Message Thread */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 min-h-[320px] max-h-[380px]">
                  {/* System Welcome Message */}
                  <div className="text-center my-2">
                    <span className="inline-block bg-slate-200/80 text-slate-700 text-[10px] font-semibold px-3 py-1 rounded-full border border-slate-300">
                      🛡️ End-to-end verified channel with {currentChatBooking.workerName} (#{currentChatBooking.id})
                    </span>
                  </div>

                  {chatMessages.map((msg) => {
                    if (msg.sender === 'system') {
                      return (
                        <div key={msg.id} className="text-center my-2">
                          <span className="inline-block bg-slate-200 text-slate-600 text-[10px] font-medium px-3 py-1 rounded-full">
                            🛡️ {msg.text}
                          </span>
                        </div>
                      );
                    }

                    const isMe = msg.sender === 'customer';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                            isMe
                              ? 'bg-emerald-600 text-white rounded-br-xs'
                              : 'bg-white text-slate-800 border border-slate-200 shadow-xs rounded-bl-xs'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[9px] text-slate-400 px-1 mt-0.5">{msg.timestamp}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Replies */}
                <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                  {quickReplies.map((qr, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => sendChatMessage(qr, 'customer')}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 border border-slate-200 shrink-0 transition-colors cursor-pointer"
                    >
                      {qr}
                    </button>
                  ))}
                </div>

                {/* Chat Form */}
                <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message to the worker..."
                    className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-emerald-500 font-medium"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="p-12 text-center text-slate-400 space-y-2 m-auto">
                <MessageSquare className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs font-bold">Select a service booking on the left to start chatting.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
