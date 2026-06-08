/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { ActivityItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  MessageSquare, 
  Clipboard, 
  CheckCircle, 
  PlusCircle, 
  Paperclip, 
  Tags, 
  FileText, 
  HelpCircle, 
  Filter, 
  User, 
  RotateCcw,
  RotateCw
} from 'lucide-react';

interface LiveActivityFeedProps {
  activity: ActivityItem[];
  getCurrentTimeDiffString: (isoString: string) => string;
}

// Map of activity types to exact emoji and visual styling labels
export function getActivityConfig(type: string): { emoji: string; label: string; bg: string; text: string; icon: any } {
  switch (type) {
    case 'commentCard':
      return { emoji: '💬', label: 'Comment Added', bg: 'bg-blue-50', text: 'text-blue-700', icon: MessageSquare };
    case 'updateCheckItemStateOnCard':
      return { emoji: '✅', label: 'Checklist Item', bg: 'bg-teal-50', text: 'text-teal-700', icon: Clipboard };
    case 'cardComplete':
      return { emoji: '🎉', label: 'Card Completed', bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle };
    case 'createCard':
      return { emoji: '🆕', label: 'Card Created', bg: 'bg-sky-50', text: 'text-sky-700', icon: PlusCircle };
    case 'addAttachmentToCard':
      return { emoji: '📎', label: 'Attachment Added', bg: 'bg-amber-50', text: 'text-amber-700', icon: Paperclip };
    case 'updateCard (labels)':
      return { emoji: '🏷️', label: 'Label Changed', bg: 'bg-purple-50', text: 'text-purple-700', icon: Tags };
    case 'updateCard (description)':
      return { emoji: '📝', label: 'Description Changed', bg: 'bg-pink-50', text: 'text-pink-700', icon: FileText };
    case 'updateCard':
      return { emoji: '🔄', label: 'Card Updated', bg: 'bg-indigo-50', text: 'text-indigo-700', icon: RotateCw };
    default:
      return { emoji: '⚡', label: 'Activity Logged', bg: 'bg-slate-50', text: 'text-slate-700', icon: HelpCircle };
  }
}

/**
 * Checks if a given Trello activity log represents a high-priority alert.
 */
export function isHighPriorityAlert(item: { type?: string; content?: string; card?: string }): boolean {
  if (!item) return false;
  const content = (item.content || '').toLowerCase();
  const card = (item.card || '').toLowerCase();
  return (
    content.includes('critical') ||
    content.includes('high priority') ||
    content.includes('security fix') ||
    content.includes('vulnerability') ||
    card.includes('vulnerability') ||
    card.includes('security')
  );
}

export function LiveActivityFeed({ activity, getCurrentTimeDiffString }: LiveActivityFeedProps) {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'timeline' | 'summary'>('timeline');

  // Dynamically extract all available types from the input list of activities
  const availableTypes = useMemo(() => {
    const typesSet = new Set<string>();
    activity.forEach(item => {
      if (item.type) typesSet.add(item.type);
    });
    return Array.from(typesSet);
  }, [activity]);

  // Dynamically extract all available member names from the input list of activities
  const availableMembers = useMemo(() => {
    const membersSet = new Set<string>();
    activity.forEach(item => {
      if (item.name) membersSet.add(item.name.trim());
    });
    return Array.from(membersSet).sort();
  }, [activity]);

  // Filter activities dynamically based on active filters
  const filteredActivity = useMemo(() => {
    return activity.filter(item => {
      const matchesType = selectedType === 'all' || item.type === selectedType;
      const matchesMember = selectedMember === 'all' || (item.name && item.name.trim() === selectedMember);
      return matchesType && matchesMember;
    });
  }, [activity, selectedType, selectedMember]);

  // Group activities dynamically by member based on currently filtered activity
  const groupedActivityByMember = useMemo(() => {
    const groups: { [memberName: string]: ActivityItem[] } = {};
    filteredActivity.forEach(item => {
      const name = item.name ? item.name.trim() : 'Unknown Member';
      if (!groups[name]) {
        groups[name] = [];
      }
      groups[name].push(item);
    });
    return groups;
  }, [filteredActivity]);

  const handleResetFilters = () => {
    setSelectedType('all');
    setSelectedMember('all');
  };

  const hasActiveFilters = selectedType !== 'all' || selectedMember !== 'all';

  return (
    <div id="activity-feed-card" className="bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-slate-50/20">
        <div>
          <h2 className="text-sm font-semibold text-[#0B1F3A] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            Live Activity Feed
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Real-time updates directly from Trello</p>
        </div>
        
        {/* Toggle + Count */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          {/* Segmented View Control */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50">
            <button
              id="view-timeline-btn"
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Full Timeline
            </button>
            <button
              id="view-summary-btn"
              type="button"
              onClick={() => setViewMode('summary')}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                viewMode === 'summary'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Daily Summary
            </button>
          </div>

          <span className="text-[10px] font-mono bg-slate-100 px-2 py-1 rounded text-slate-600 font-semibold uppercase tracking-wider">
            {activity.length} logs
          </span>
        </div>
      </div>

      {/* Styled Interactive Filters Bar */}
      <div className="px-4 py-3 bg-slate-50/40 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Team Member Filter Select */}
        <div className="flex items-center gap-2">
          <label htmlFor="member-filter-select" className="text-slate-500 font-semibold whitespace-nowrap flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-slate-400" />
            Member:
          </label>
          <select
            id="member-filter-select"
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="flex-1 bg-white border border-slate-200 rounded-lg py-1 px-2.5 text-[11px] font-medium text-slate-700 outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500 min-w-[100px] cursor-pointer"
          >
            <option value="all">All Members</option>
            {availableMembers.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        {/* Activity Type Filter Select */}
        <div className="flex items-center gap-2">
          <label htmlFor="type-filter-select" className="text-slate-500 font-semibold whitespace-nowrap flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            Type:
          </label>
          <select
            id="type-filter-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="flex-1 bg-white border border-slate-200 rounded-lg py-1 px-2.5 text-[11px] font-medium text-slate-700 outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500 min-w-[100px] cursor-pointer"
          >
            <option value="all">All Types</option>
            {availableTypes.map(type => {
              const conf = getActivityConfig(type);
              return (
                <option key={type} value={type}>
                  {conf.emoji} {conf.label}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Active filters summary label notification */}
      {hasActiveFilters && (
        <div className="px-4 py-2 bg-blue-50/50 border-b border-blue-100 flex items-center justify-between text-[11px] text-blue-800">
          <span className="font-semibold">
            Showing {filteredActivity.length} of {activity.length} today's activities matches
          </span>
          <button 
            type="button"
            onClick={handleResetFilters}
            className="flex items-center gap-1 hover:underline font-bold text-blue-600 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Clear
          </button>
        </div>
      )}

      {/* List / Summary Container */}
      <div className="p-4 flex-1 overflow-y-auto max-h-[500px] lg:max-h-[600px] space-y-4">
        {activity.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No activity logged yet. Updates will flow in live.
          </div>
        ) : filteredActivity.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <p className="text-slate-400 text-xs font-medium">
              No matching activity found for the selected filters.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset all filters
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {viewMode === 'timeline' ? (
              <motion.div
                key="timeline-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="relative border-l border-slate-100 pl-4 ml-2.5 space-y-5"
              >
                {filteredActivity.map((item, index) => {
                  const config = getActivityConfig(item.type);
                  const IconComponent = config.icon;

                  return (
                    <div
                      key={item.id || `${item.name}-${item.date}-${index}`}
                      className="relative"
                    >
                      {/* Node Dot icon on timeline */}
                      <div className={`absolute -left-[29px] top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white shadow-sm ${config.bg} ${config.text}`}>
                        <IconComponent className="w-3 h-3" />
                      </div>

                      <div className="space-y-1">
                        {/* Name + Activity + Time */}
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-[#0B1F3A] hover:underline cursor-pointer">
                              {item.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal">in</span>
                            <span className="text-xs text-slate-600 font-medium max-w-[120px] truncate hover:text-[#2563EB] cursor-pointer" title={item.card}>
                              {item.card}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono tracking-tight shrink-0">
                            {getCurrentTimeDiffString(item.date)}
                          </span>
                        </div>

                        {/* Content Detail and Badge */}
                        <div className="p-2.5 rounded-lg bg-slate-50/50 hover:bg-slate-50 transition-all border border-slate-50/30">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${config.bg} ${config.text}`}>
                              <IconComponent className="w-2.5 h-2.5" />
                              {config.label}
                            </span>
                            {isHighPriorityAlert(item) && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-50 border border-rose-100 text-[10px] font-bold text-rose-700 animate-pulse">
                                ⚠️ High Priority Alert
                              </span>
                            )}
                          </div>
                          {item.content ? (
                            <p className="text-xs text-slate-700 font-normal leading-relaxed break-words">
                              {item.content}
                            </p>
                          ) : (
                            <p className="text-xs text-slate-400 italic font-normal">
                              No additional text description provided
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="summary-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {(Object.entries(groupedActivityByMember) as [string, ActivityItem[]][]).map(([memberName, items]) => {
                  const hasAlert = items.some(item => isHighPriorityAlert(item));
                  
                  return (
                    <div 
                      key={memberName}
                      className={`p-3.5 rounded-xl border transition-all ${
                        hasAlert 
                          ? 'border-rose-100 bg-rose-50/15 shadow-[0_1px_3px_rgba(244,63,94,0.02)]' 
                          : 'border-slate-100 bg-slate-50/20 shadow-[0_1px_3px_rgba(0,0,0,0.01)]'
                      }`}
                    >
                      {/* Member Section Header */}
                      <div className="flex items-center justify-between border-b border-dashed border-slate-100 pb-2.5 mb-3">
                        <div className="flex items-center gap-2.5">
                          {/* Initial Avatar */}
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-sans ${
                            hasAlert 
                              ? 'bg-rose-100 text-rose-700 font-bold' 
                              : 'bg-slate-100 text-[#0B1F3A]'
                          }`}>
                            {memberName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-[#0B1F3A]">
                              {memberName}
                            </h3>
                            <p className="text-[10px] text-slate-400 font-medium">
                              Active updates across {new Set(items.map(i => i.card)).size} Trello cards
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {hasAlert && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-100 text-[9px] font-bold text-rose-700 animate-pulse">
                              ⚠️ Alert Active
                            </span>
                          )}
                          <span className="text-[10px] font-semibold text-slate-500 bg-white border border-slate-200/60 px-2 py-0.5 rounded-full">
                            {items.length} {items.length === 1 ? 'update' : 'updates'}
                          </span>
                        </div>
                      </div>

                      {/* Sub-timeline */}
                      <div className="space-y-2.5 pl-1.5">
                        {items.map((item, idx) => {
                          const config = getActivityConfig(item.type);
                          const IconComponent = config.icon;
                          const isAlert = isHighPriorityAlert(item);

                          return (
                            <div key={idx} className="relative pl-4 border-l border-slate-100 group">
                              {/* Inner timeline dot */}
                              <div className={`absolute -left-1 top-1.5 w-2 h-2 rounded-full border-2 border-white transition-colors ${
                                isAlert ? 'bg-rose-500' : 'bg-slate-300 group-hover:bg-blue-500'
                              }`} />

                              <div className="space-y-0.5">
                                {/* Type/Badge + Card selection */}
                                <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
                                  <div className="flex items-center gap-1 flex-wrap">
                                    <span className="text-[10px] font-medium text-slate-400 font-mono">
                                      {getCurrentTimeDiffString(item.date)}
                                    </span>
                                    <span className="text-[10px] text-slate-500">on</span>
                                    <span className="text-[10px] font-bold text-slate-700 hover:text-blue-600 cursor-pointer truncate max-w-[150px] sm:max-w-xs" title={item.card}>
                                      {item.card}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <span className={`inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[8px] font-bold uppercase tracking-tight ${config.bg} ${config.text}`}>
                                      <IconComponent className="w-2 h-2" />
                                      {config.label.split(' ')[0]}
                                    </span>
                                  </div>
                                </div>

                                {/* Content Details */}
                                {item.content ? (
                                  <p className={`text-[11px] font-normal leading-relaxed break-words pl-1.5 border-l border-slate-50 mt-1 ${
                                    isAlert ? 'text-rose-900 font-medium' : 'text-slate-600'
                                  }`}>
                                    {item.content}
                                  </p>
                                ) : (
                                  <p className="text-[10px] text-slate-450 italic font-normal pl-1.5 border-l border-slate-50 mt-1">
                                    No descriptive text detail
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

