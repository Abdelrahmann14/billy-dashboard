/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Member } from '../types';
import { AlertCircle, ChevronDown, ChevronUp, Bell, Clock, LogOut, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AlertsSectionProps {
  members: Member[];
  onSelectMember: (member: Member) => void;
}

export function AlertsSection({ members, onSelectMember }: AlertsSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  // Compile active alerts
  const missingUpdates = members.filter(m => m.status === 'working' && m.hasMissingUpdate);
  const backTooLate = members.filter(m => m.status === 'break' && m.onBreakTooLong);
  const lateLogins = members.filter(m => m.status === 'logged_out' && m.notLoggedInBy4pm);

  const totalAlerts = missingUpdates.length + backTooLate.length + lateLogins.length;

  if (totalAlerts === 0) {
    return (
      <div id="alerts-empty" className="bg-white rounded-xl border border-slate-100 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-slate-700">
          <div className="p-1.5 bg-green-50 rounded-lg text-green-600">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-medium text-slate-800">All quiet</span>
            <span className="hidden sm:inline text-xs text-slate-500 ml-1.5">· No active team alerts or missing updates flagged at this moment.</span>
          </div>
        </div>
        <span className="text-xs bg-green-50 text-green-700 font-medium px-2 py-0.5 rounded-full">Healthy</span>
      </div>
    );
  }

  return (
    <div id="alerts-card" className="bg-white rounded-xl border border-rose-100 shadow-[0_1px_3px_rgba(0,0,0,0.01)] overflow-hidden">
      {/* Header */}
      <button
        id="alerts-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-rose-50/30 hover:bg-rose-50/50 transition-colors focus:outline-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-rose-100 text-rose-600 rounded-lg animate-pulse">
            <Bell className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="text-sm font-semibold text-rose-950">Active Team Alerts</span>
            <span className="ml-2 text-xs bg-rose-600 text-white font-medium px-2 py-0.5 rounded-full">
              {totalAlerts} Flagged
            </span>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-rose-700" />
        ) : (
          <ChevronDown className="w-4 h-4 text-rose-700" />
        )}
      </button>

      {/* Collapsible content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id="alerts-content"
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="border-t border-rose-100 overflow-hidden"
          >
            <div className="p-1 divide-y divide-rose-50">
              {/* Missing updates */}
              {missingUpdates.map(m => (
                <div
                  key={m.id}
                  onClick={() => onSelectMember(m)}
                  className="flex items-start sm:items-center justify-between p-3 ml-1 mr-1 my-1 hover:bg-rose-50/40 rounded-lg cursor-pointer transition-all"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-red-600 mt-1.5 sm:mt-0" />
                    <div>
                      <span className="text-sm font-medium text-[#0B1F3A] hover:underline">{m.name}</span>
                      <span className="text-xs text-rose-600 font-medium ml-2 bg-rose-50 border border-rose-100 px-1.5 py-0.2 rounded">
                        Missing Update
                      </span>
                      <p className="text-xs text-slate-500 mt-0.5 sm:mt-0 sm:inline sm:ml-2">
                        Working since {m.login || 'N/A'} but hasn't posted a Trello update in over 2 hours.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1 shrink-0 mt-1 sm:mt-0">
                    <Clock className="w-3 h-3 text-red-400" /> Overdue
                  </span>
                </div>
              ))}

              {/* Excess breaks */}
              {backTooLate.map(m => (
                <div
                  key={m.id}
                  onClick={() => onSelectMember(m)}
                  className="flex items-start sm:items-center justify-between p-3 ml-1 mr-1 my-1 hover:bg-rose-50/40 rounded-lg cursor-pointer transition-all"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 mt-1.5 sm:mt-0" />
                    <div>
                      <span className="text-sm font-medium text-[#0B1F3A] hover:underline">{m.name}</span>
                      <span className="text-xs text-amber-600 font-medium ml-2 bg-amber-50 border border-amber-100 px-1.5 py-0.2 rounded">
                        Over-break
                      </span>
                      <p className="text-xs text-slate-500 mt-0.5 sm:mt-0 sm:inline sm:ml-2">
                        On break since {m.breakStart || 'N/A'} (expected back at {m.back || 'N/A'}); break duration exceeds 2 hours limit.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1 shrink-0 mt-1 sm:mt-0">
                    <Clock className="w-3 h-3 text-amber-500" /> Exceeded limit
                  </span>
                </div>
              ))}

              {/* Late logins */}
              {lateLogins.map(m => (
                <div
                  key={m.id}
                  onClick={() => onSelectMember(m)}
                  className="flex items-start sm:items-center justify-between p-3 ml-1 mr-1 my-1 hover:bg-rose-50/40 rounded-lg cursor-pointer transition-all"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-slate-400 mt-1.5 sm:mt-0" />
                    <div>
                      <span className="text-sm font-medium text-[#0B1F3A] hover:underline">{m.name}</span>
                      <span className="text-xs text-slate-500 font-medium ml-2 bg-slate-50 border border-slate-100 px-1.5 py-0.2 rounded">
                        Late Log In
                      </span>
                      <p className="text-xs text-slate-500 mt-0.5 sm:mt-0 sm:inline sm:ml-2">
                        Unreported / not logged on by standard shift time (4:00 PM cutoff threshold).
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1 shrink-0 mt-1 sm:mt-0">
                    <LogOut className="w-3 h-3 text-slate-400" /> Missing Log
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
