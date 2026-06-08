/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Stats } from '../types';
import { 
  Users, 
  Play, 
  Coffee, 
  LogOut, 
  Clock, 
  AlertTriangle, 
  AlertCircle 
} from 'lucide-react';

interface StatsStripProps {
  stats: Stats;
}

export function StatsStrip({ stats }: StatsStripProps) {
  const cards = [
    {
      id: 'total',
      label: 'Total Members',
      value: stats.total,
      icon: Users,
      colorClass: 'text-slate-700 bg-slate-50 border-slate-100',
      iconColor: 'text-slate-500'
    },
    {
      id: 'working',
      label: 'Working',
      value: stats.working,
      icon: Play,
      colorClass: 'text-green-700 bg-green-50/50 border-green-100',
      iconColor: 'text-green-600'
    },
    {
      id: 'break',
      label: 'On Break',
      value: stats.onBreak,
      icon: Coffee,
      colorClass: 'text-amber-700 bg-amber-50/50 border-amber-100',
      iconColor: 'text-amber-600'
    },
    {
      id: 'logged_out',
      label: 'Logged Out',
      value: stats.loggedOut,
      icon: LogOut,
      colorClass: 'text-slate-500 bg-slate-50 border-slate-100',
      iconColor: 'text-slate-400'
    },
    {
      id: 'updated_last_2h',
      label: 'Posted Update (Today)',
      value: stats.updatedLast2h,
      icon: Clock,
      colorClass: 'text-blue-700 bg-blue-50/50 border-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      id: 'missing_update',
      label: 'Missing Update',
      value: stats.missingUpdate,
      icon: AlertTriangle,
      colorClass: 'text-red-700 bg-red-50/50 border-red-100',
      iconColor: 'text-red-600'
    },
    {
      id: 'not_logged_in_by_4pm',
      label: 'No Login by 4 PM',
      value: stats.notLoggedInBy4pm,
      icon: AlertCircle,
      colorClass: 'text-rose-700 bg-rose-50/50 border-rose-100',
      iconColor: 'text-rose-600'
    }
  ];

  return (
    <div id="stats-strip-container" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
      {cards.map(card => {
        const IconComponent = card.icon;
        return (
          <div
            id={`stat-card-${card.id}`}
            key={card.id}
            className={`flex flex-col justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 line-clamp-1">
                {card.label}
              </span>
              <div className={`p-1 rounded-md text-xs ${card.colorClass.split(' ')[1]}`}>
                <IconComponent className={`w-3.5 h-3.5 ${card.iconColor}`} />
              </div>
            </div>
            
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-semibold tracking-tight text-[#0B1F3A]">
                {card.value}
              </span>
              <span className="text-xs text-slate-400 font-normal">/ {stats.total}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
