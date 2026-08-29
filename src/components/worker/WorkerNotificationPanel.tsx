import React, { useState } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  X,
  AlertTriangle,
  Wrench,
  Clock,
  DollarSign,
  Info,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WorkerNotification } from '../../types';

interface WorkerNotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkerNotificationPanel: React.FC<WorkerNotificationPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    workerNotifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotification,
    clearAllNotifications,
    setActiveView,
    setActiveBookingById,
    t,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');

  if (!isOpen) return null;

  const filteredNotifications = workerNotifications.filter((n) =>
    activeFilter === 'unread' ? !n.isRead : true
  );

  const getNotificationIcon = (type: WorkerNotification['type']) => {
    switch (type) {
      case 'emergency_request':
        return (
          <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
        );
      case 'service_request':
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Wrench className="w-4 h-4" />
          </div>
        );
      case 'reminder':
        return (
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
        );
      case 'payment':
        return (
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4" />
          </div>
        );
    }
  };

  const handleNotificationClick = (notif: WorkerNotification) => {
    markNotificationAsRead(notif.id);
    if (notif.bookingId) {
      setActiveView('worker-dashboard');
    }
  };

  return (
    <div
      id="worker-notification-panel"
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
            <p className="text-[11px] text-slate-500">
              {unreadNotificationsCount > 0
                ? `${unreadNotificationsCount} unread request${unreadNotificationsCount > 1 ? 's' : ''}`
                : 'All caught up'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {unreadNotificationsCount > 0 && (
            <button
              id="mark-all-read-btn"
              onClick={markAllNotificationsAsRead}
              title="Mark all as read"
              className="p-1.5 text-xs text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1 font-medium cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mark all read</span>
            </button>
          )}
          <button
            id="close-notif-panel-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center px-4 py-2 border-b border-slate-100 bg-white gap-2 text-xs">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All ({workerNotifications.length})
        </button>
        <button
          onClick={() => setActiveFilter('unread')}
          className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
            activeFilter === 'unread'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Unread ({unreadNotificationsCount})
        </button>

        {workerNotifications.length > 0 && (
          <button
            id="clear-all-notifs-btn"
            onClick={clearAllNotifications}
            className="ml-auto text-[11px] text-slate-400 hover:text-red-600 flex items-center gap-1 font-medium cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear all</span>
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <Bell className="w-8 h-8 mx-auto text-slate-300 stroke-1" />
            <p className="text-xs font-semibold text-slate-600">No notifications found</p>
            <p className="text-[11px] text-slate-400">
              {activeFilter === 'unread'
                ? 'No unread notifications left.'
                : 'New service requests and booking alerts will appear here.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              id={`notif-item-${notif.id}`}
              onClick={() => handleNotificationClick(notif)}
              className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer relative group ${
                !notif.isRead ? 'bg-emerald-50/40' : ''
              }`}
            >
              {getNotificationIcon(notif.type)}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <h4
                      className={`text-xs ${
                        !notif.isRead
                          ? 'font-bold text-slate-900'
                          : 'font-semibold text-slate-700'
                      }`}
                    >
                      {notif.title}
                    </h4>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {notif.timestamp}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-snug line-clamp-2">
                  {notif.message}
                </p>

                {notif.bookingId && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 hover:text-emerald-800">
                      View booking request <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {!notif.isRead && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markNotificationAsRead(notif.id);
                    }}
                    title="Mark as read"
                    className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-emerald-700"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearNotification(notif.id);
                  }}
                  title="Clear"
                  className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-red-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
        <button
          onClick={() => {
            setActiveView('worker-dashboard');
            onClose();
          }}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
        >
          Go to Worker Dashboard
        </button>
      </div>
    </div>
  );
};
