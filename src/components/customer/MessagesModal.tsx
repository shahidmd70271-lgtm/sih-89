import React, { useState } from 'react';
import { X, Send, User, ShieldCheck, Phone, CheckCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MessagesModal: React.FC = () => {
  const {
    activeBooking,
    isMessagesModalOpen,
    setIsMessagesModalOpen,
    chatMessages,
    sendChatMessage,
    setIsCallModalOpen,
    t,
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');

  if (!isMessagesModalOpen || !activeBooking) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    sendChatMessage(inputMessage.trim(), 'customer');
    setInputMessage('');
  };

  const quickReplies = [
    t('quickReply1'),
    t('quickReply2'),
    t('quickReply3'),
    t('quickReply4'),
  ];

  const translatedSkill = t(`service_${activeBooking.workerSkill.replace(/[\s&]+/g, '')}`) || activeBooking.workerSkill;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full h-[600px] flex flex-col shadow-2xl border border-slate-200 relative overflow-hidden">
        {/* Chat Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <img
              src={activeBooking.workerAvatar}
              alt={activeBooking.workerName}
              className="w-10 h-10 rounded-full object-cover border border-emerald-400"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-white">{activeBooking.workerName}</h4>
                <span className="text-[10px] text-emerald-400 font-medium">✓ {t('verified')}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {translatedSkill} • {t('timelineTravelling')} ({t('etaLabel')} {activeBooking.etaMinutes}m)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsMessagesModalOpen(false);
                setIsCallModalOpen(true);
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 transition-colors cursor-pointer"
              title={t('callWorker')}
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsMessagesModalOpen(false)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
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

        {/* Quick Suggestion Chips */}
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

        {/* Chat Input */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={t('chatPlaceholder')}
            className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-emerald-500 font-medium"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t('send')}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
