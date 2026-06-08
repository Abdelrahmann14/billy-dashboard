/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ActivityItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MessageSquare, Clipboard, CheckCircle, PlusCircle, Paperclip, Tags, FileText, HelpCircle } from 'lucide-react';

interface LiveActivityFeedProps {
  activity: ActivityItem[];
  getCurrentTimeDiffString: (isoString: string) => string;
}

// Map of activity types to exact emoji and visual styling labels
export function getActivityConfig(type: string): { emoji: string; label: string; bg: string; text: string; icon: any } {
  switch (type) {
    case 'commentCard':
      return { emoji: '💬', label: 'Comment', bg: 'bg-blue-50', text: 'text-blue-700', icon: MessageSquare };
    case 'updateCheckItemStateOnCard':
      return { emoji: '✅', label: 'Checklist item', bg: 'bg-teal-50', text: 'text-teal-700', icon: Clipboard };
    case 'cardComplete':
      return { emoji: '🎉', label: 'Card completed', bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle };
    case 'createCard':
      return { emoji: '🆕', label: 'Card created', bg: 'bg-sky-50', text: 'text-sky-700', icon: PlusCircle };
    case 'addAttachmentToCard':
      return { emoji: '📎', label: 'Attachment', bg: 'bg-amber-50', text: 'text-amber-700', icon: Paperclip };
    case 'updateCard (labels)':
      return { emoji: '🏷️', label: 'Label changed', bg: 'bg-purple-50', text: 'text-purple-700', icon: Tags };
    case 'updateCard (description)':
      return { emoji: '📝', label: 'Description changed', bg: 'bg-pink-50', text: 'text-pink-700', icon: FileText };
    default:
      return { emoji: '⚡', label: 'Activity', bg: 'bg-slate-50', text: 'text-slate-700', icon: HelpCircle };
  }
}

export function LiveActivityFeed({ activity, getCurrentTimeDiffString }: LiveActivityFeedProps) {
  return (
    <div id="activity-feed-card" className="bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
        <div>
          <h2 className="text-sm font-semibold text-[#0B1F3A] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            Live Activity Feed
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Real-time updates directly from Trello</p>
        </div>
        <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-semibold uppercase tracking-wider">
          {activity.length} logs
        </span>
      </div>

      {/* Timeline item list */}
      <div className="p-4 flex-1 overflow-y-auto max-h-[500px] lg:max-h-[600px] space-y-4">
        {activity.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No activity logged yet. Updates will flow in live.
          </div>
        ) : (
          <div className="relative border-l border-slate-100 pl-4 ml-2.5 space-y-5">
            <AnimatePresence initial={false}>
              {activity.map((item, index) => {
                const config = getActivityConfig(item.type);
                const IconComponent = config.icon;

                return (
                  <motion.div
                    key={item.id || `${item.name}-${item.date}-${index}`}
                    initial={{ opacity: 0, x: 20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    className="relative"
                  >
                    {/* Node Dot icon on timeline */}
                    <div className="absolute -left-[27px] top-1 flex h-5 w-5 items-center justify-between rounded-full border border-white bg-white shadow-sm font-sans text-xs">
                      <span className="m-auto text-[10px]">{config.emoji}</span>
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
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${config.bg} ${config.text}`}>
                            <IconComponent className="w-2.5 h-2.5" />
                            {config.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-normal leading-relaxed break-words">
                          {item.content}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
