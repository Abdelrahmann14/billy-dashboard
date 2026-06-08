/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Member } from '../types';
import { Search, Filter, AlertCircle, Clock, CheckCircle2, Coffee, Moon, ArrowRight, ArrowDown } from 'lucide-react';

interface MembersTableProps {
  members: Member[];
  onSelectMember: (member: Member) => void;
  getCurrentTimeDiffString: (isoString: string | null) => string;
}

type FilterStatus = 'all' | 'working' | 'break' | 'logged_out' | 'alerts';

export function MembersTable({ members, onSelectMember, getCurrentTimeDiffString }: MembersTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');

  // Filtering Logic
  const filteredMembers = members.filter(member => {
    // 1. Search filter
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 2. Status filter
    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'working') return matchesSearch && member.status === 'working';
    if (activeFilter === 'break') return matchesSearch && member.status === 'break';
    if (activeFilter === 'logged_out') return matchesSearch && member.status === 'logged_out';
    if (activeFilter === 'alerts') {
      const hasAlert = member.hasMissingUpdate || member.onBreakTooLong || member.notLoggedInBy4pm;
      return matchesSearch && hasAlert;
    }
    return matchesSearch;
  });

  return (
    <div id="members-table-wrapper" className="bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col overflow-hidden">
      
      {/* Control Bar: Search & Filter Tabs */}
      <div className="p-4 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/10">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            id="members-search-input"
            type="text"
            placeholder="Search team member..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium placeholder:text-slate-400 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:bg-white transition-colors"
          />
        </div>

        {/* Filters */}
        <div id="filter-tabs-container" className="flex flex-wrap items-center gap-1">
          {(['all', 'working', 'break', 'logged_out', 'alerts'] as FilterStatus[]).map(filter => {
            const count = members.filter(m => {
              if (filter === 'all') return true;
              if (filter === 'working') return m.status === 'working';
              if (filter === 'break') return m.status === 'break';
              if (filter === 'logged_out') return m.status === 'logged_out';
              if (filter === 'alerts') return m.hasMissingUpdate || m.onBreakTooLong || m.notLoggedInBy4pm;
              return true;
            }).length;

            return (
              <button
                id={`filter-btn-${filter}`}
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize tracking-tight transition-all cursor-pointer ${
                  activeFilter === filter
                    ? 'bg-[#0B1F3A] text-white'
                    : 'text-slate-600 hover:text-[#0B1F3A] bg-slate-50 hover:bg-slate-100'
                }`}
              >
                {filter === 'logged_out' ? 'Logged Out' : filter}
                <span className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeFilter === filter ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Desktop Table, and Mobile Cards */}
      <div id="grid-cards-wrapper" className="flex-1 w-full overflow-x-auto">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            No team members match the search query / active filters.
          </div>
        ) : (
          <>
            {/* Desktop Table: shown only on sm: and above */}
            <table className="hidden md:table w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Login</th>
                  <th className="py-3 px-2">Break timings</th>
                  <th className="py-3 px-4">Logout</th>
                  <th className="py-3 px-4 text-right">Latest Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredMembers.map(member => {
                  return (
                    <tr
                      id={`member-row-${member.id}`}
                      key={member.id}
                      onClick={() => onSelectMember(member)}
                      className="hover:bg-slate-50/65 cursor-pointer transition-colors"
                    >
                      {/* Name + dot */}
                      <td className="py-3.5 px-4 font-semibold text-[#0B1F3A] text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                            member.status === 'working' ? 'bg-[#16A34A]' :
                            member.status === 'break' ? 'bg-[#D97706]' : 'bg-[#94A3B8]'
                          }`} />
                          <span className="hover:underline">{member.name}</span>
                        </div>
                      </td>

                      {/* Status Badges */}
                      <td className="py-3.5 px-4 text-xs font-medium">
                        <div className="flex items-center gap-1.5">
                          {member.status === 'working' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-100">
                              <CheckCircle2 className="w-3 h-3 text-[#16A34A]" /> Working
                            </span>
                          )}
                          {member.status === 'break' && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              member.onBreakTooLong ? 'bg-amber-100 text-amber-900 animate-pulse' : 'bg-amber-50 text-amber-700 border border-amber-100'
                            }`}>
                              <Coffee className="w-3 h-3" /> Break
                            </span>
                          )}
                          {member.status === 'logged_out' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-100">
                              <Moon className="w-3 h-3" /> Offline
                            </span>
                          )}

                          {/* Missing update warning */}
                          {member.status === 'working' && member.hasMissingUpdate && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-100 animate-pulse">
                              <AlertCircle className="w-3 h-3" /> No Update (2h+)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Login */}
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-600 font-medium">
                        {member.login || '—'}
                      </td>

                      {/* Break Start -> Back */}
                      <td className="py-3.5 px-2 text-xs font-mono text-slate-600 font-medium">
                        {member.breakStart ? (
                          <div className="flex items-center gap-1 text-[11px]">
                            <span>{member.breakStart}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                            <span className={member.onBreakTooLong ? 'text-amber-600 font-bold' : ''}>
                              {member.back || '?'}
                            </span>
                          </div>
                        ) : '—'}
                      </td>

                      {/* Logout */}
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-600 font-medium">
                        {member.logout || '—'}
                      </td>

                      {/* Last updated content / timestamp */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-mono font-semibold text-slate-700">
                            {getCurrentTimeDiffString(member.lastUpdateAt)}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5 max-w-[130px] truncate block" title={member.lastUpdateContent || ''}>
                            {member.lastUpdateContent || '—'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile/Tablet Card View: shown only below md: */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:hidden gap-3.5 p-4">
              {filteredMembers.map(member => {
                return (
                  <div
                    key={member.id}
                    onClick={() => onSelectMember(member)}
                    className="p-4 bg-white hover:bg-slate-50/50 rounded-xl border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.01)] cursor-pointer transition-all space-y-3.5"
                  >
                    {/* Header: Name + Status badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${
                          member.status === 'working' ? 'bg-[#16A34A]' :
                          member.status === 'break' ? 'bg-[#D97706]' : 'bg-[#94A3B8]'
                        }`} />
                        <span className="text-sm font-bold text-[#0B1F3A] hover:underline">{member.name}</span>
                      </div>
                      <span className="text-[10px] font-bold font-mono text-slate-400">ID: {member.id.substring(7)}</span>
                    </div>

                    {/* Status badges row */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      {member.status === 'working' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-700 border border-green-100">
                          Working
                        </span>
                      )}
                      {member.status === 'break' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border border-amber-100">
                          Break
                        </span>
                      )}
                      {member.status === 'logged_out' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-50 text-slate-500 border border-slate-100">
                          Logged Out
                        </span>
                      )}

                      {member.status === 'working' && member.hasMissingUpdate && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-600 border border border-red-100">
                          🔴 No Update (2h+)
                        </span>
                      )}
                    </div>

                    {/* Meta info grid */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-medium pt-1 border-t border-slate-50">
                      <div>
                        <span className="text-slate-400 block">Login Time</span>
                        <span className="text-slate-700 font-mono font-semibold">{member.login || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Logout Time</span>
                        <span className="text-slate-700 font-mono font-semibold">{member.logout || '—'}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 block">Break Start → Est Return</span>
                        <span className="text-slate-700 font-mono font-semibold">
                          {member.breakStart ? `${member.breakStart} → ${member.back || '?'}` : 'No active break'}
                        </span>
                      </div>
                    </div>

                    {/* Last update block */}
                    <div className="bg-slate-50/50 hover:bg-slate-50 p-2 rounded-lg border border-slate-50/30 text-[11px]">
                      <div className="flex items-center justify-between gap-1 text-slate-400 mb-0.5 font-medium">
                        <span>Latest Update</span>
                        <span className="font-mono">{getCurrentTimeDiffString(member.lastUpdateAt)}</span>
                      </div>
                      <span className="text-slate-600 font-normal line-clamp-1 italic">
                        "{member.lastUpdateContent || 'None logged'}"
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
