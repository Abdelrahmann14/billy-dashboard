/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Member, ActivityItem } from '../types';
import { motion } from 'motion/react';
import { X, Calendar, Clock, Coffee, LogOut, BellOff, Info, Award, ListTodo } from 'lucide-react';
import { getActivityConfig } from './LiveActivityFeed';

interface MemberDetailDrawerProps {
  member: Member | null;
  activity: ActivityItem[];
  onClose: () => void;
  getCurrentTimeDiffString: (isoString: string) => string;
}

export function MemberDetailDrawer({ member, activity, onClose, getCurrentTimeDiffString }: MemberDetailDrawerProps) {
  if (!member) return null;

  // Filter global activity logs to just show things done by this member
  const memberActivity = activity.filter(act => act.name.toLowerCase() === member.name.toLowerCase());

  // Determine status display values
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'working':
        return { label: 'Working', color: 'bg-green-500', text: 'text-green-700 bg-green-50 border-green-100' };
      case 'break':
        return { label: 'On Break', color: 'bg-amber-500', text: 'text-amber-700 bg-amber-50 border-amber-100' };
      case 'logged_out':
        return { label: 'Logged Out', color: 'bg-slate-400', text: 'text-slate-500 bg-slate-50 border-slate-100' };
      default:
        return { label: 'Unknown', color: 'bg-slate-300', text: 'text-slate-600 bg-slate-50 border-slate-200' };
    }
  };

  const statusStyle = getStatusDisplay(member.status);

  return (
    <div id="member-drawer-overlay" className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Semi-transparent Backdrop with animate-fade-in */}
      <motion.div
        id="drawer-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container Panel */}
      <motion.div
        id="drawer-panel"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 24, stiffness: 220 }}
        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10"
      >
        {/* Header Drawer */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`h-3 w-3 rounded-full ${statusStyle.color} animate-ping absolute`} />
            <span className={`h-3 w-3 rounded-full ${statusStyle.color} relative`} />
            <div>
              <h3 className="text-base font-bold text-[#0B1F3A]">{member.name}</h3>
              <p className="text-xs text-slate-500">Trello Member Directory Info</p>
            </div>
          </div>
          <button
            id="close-drawer-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:outline-none transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Status Badge Strip */}
          <div className="flex flex-wrap gap-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusStyle.text}`}>
              Status: {statusStyle.label}
            </span>
            {member.hasMissingUpdate && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-100">
                🚨 Missing Update Alert
              </span>
            )}
            {member.onBreakTooLong && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                ⚠️ Long Break Alert
              </span>
            )}
          </div>

          {/* Missed Update KPI Bubble */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-slate-400" />
                Monthly Missed Alerts
              </span>
              <p className="text-xs text-slate-500 max-w-[200px]">
                Deficits where no Trello activity occurred during working shifts of 2h+.
              </p>
            </div>
            
            <div className="text-center bg-white border border-slate-200 shadow-sm rounded-lg px-4 py-2 shrink-0">
              <span className={`text-2xl font-bold ${member.missedCounter > 2 ? 'text-red-600' : 'text-slate-700'}`}>
                {member.missedCounter}
              </span>
              <span className="block text-[9px] uppercase tracking-wider font-semibold text-slate-400 mt-0.5">
                this month
              </span>
            </div>
          </div>

          {/* Shift & Time Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Timings & Days Off
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white border border-slate-100 rounded-xl">
                <span className="block text-[10px] text-slate-400 font-medium">Logged In At</span>
                <span className="text-xs font-semibold text-slate-800">{member.login || '—'}</span>
              </div>
              <div className="p-3 bg-white border border-slate-100 rounded-xl">
                <span className="block text-[10px] text-slate-400 font-medium">Logged Out At</span>
                <span className="text-xs font-semibold text-slate-800">{member.logout || '—'}</span>
              </div>
              <div className="p-3 bg-white border border-slate-100 rounded-xl">
                <span className="block text-[10px] text-slate-400 font-medium">Break Interval</span>
                <span className="text-xs font-semibold text-slate-800">
                  {member.breakStart ? `${member.breakStart} → ${member.back || '?'}` : '—'}
                </span>
              </div>
              <div className="p-3 bg-white border border-slate-100 rounded-xl">
                <span className="block text-[10px] text-slate-400 font-medium">Weekly Day Off</span>
                <span className="text-xs font-semibold capitalize text-slate-800">
                  {member.dayOff.join(', ') || 'None'}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Logs (Individual) */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ListTodo className="w-3.5 h-3.5" /> Recent Actions ({memberActivity.length})
            </h4>

            {memberActivity.length === 0 ? (
              <div className="p-4 rounded-xl text-center bg-slate-50 text-xs text-slate-400 flex items-center justify-center gap-2">
                <Info className="w-4 h-4 text-slate-300" />
                No logged updates found for this shift cycle.
              </div>
            ) : (
              <div className="space-y-3 pl-1">
                {memberActivity.map((act, index) => {
                  const conf = getActivityConfig(act.type);
                  return (
                    <div
                      key={act.id || index}
                      className="p-3 rounded-lg border border-slate-100 bg-white hover:border-slate-200 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.01)] space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold ${conf.bg} ${conf.text}`}>
                          <span>{conf.emoji}</span>
                          <span>{conf.label}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {getCurrentTimeDiffString(act.date)}
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-700 font-medium truncate" title={act.card}>
                        Card: {act.card}
                      </p>
                      
                      <p className="text-xs text-slate-500 font-normal leading-normal whitespace-pre-wrap word-break bg-slate-50/50 p-1.5 rounded text-[11px]">
                        {act.content}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[10px] text-slate-400">
            ID: {member.id}
          </span>
          <button
            id="drawer-ping-btn"
            onClick={() => alert(`A Slack/Trello reminder notification was simulated and pinged to ${member.name}.`)}
            className="text-xs font-medium px-3.5 py-1.5 bg-[#0B1F3A] hover:bg-[#1a3861] text-white rounded-lg transition-colors focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
          >
            Direct Ping / Alert
          </button>
        </div>
      </motion.div>
    </div>
  );
}
