/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Member } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Clock, 
  Coffee, 
  Users, 
  User,
  Briefcase,
  CheckCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface ShiftCalendarProps {
  member: Member;
  allMembers: Member[];
}

export function ShiftCalendar({ member, allMembers }: ShiftCalendarProps) {
  // Use current local time June 8, 2026 as initial anchor
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth()); // 0-indexed (0 = Jan, 5 = June...)
  const [selectedDay, setSelectedDay] = useState<number>(now.getDate());

  // Weekday definitions (Starting on Sunday for standard grid layout)
  const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Helper: Get number of days in the selected month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Helper: Get the first day of the month weekday index (0 = Sunday, 1 = Monday...)
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  // Handler: Prev Month
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
    // Set selected day to 1 or clamp it
    setSelectedDay(1);
  };

  // Handler: Next Month
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
    setSelectedDay(1);
  };

  // Helper: Get robust daily schedule details for a specific member
  const getDailySchedule = (checkDate: Date, m: Member) => {
    const dayOfWeekName = checkDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const isOff = m.dayOff.map(d => d.toLowerCase()).includes(dayOfWeekName);
    
    // Determine shift hours. If the member is logged in, use their actual timing.
    // If not, we default to standard shift hours (e.g. 10:00 to 18:00 or names)
    let timing = "10:00 - 18:00";
    if (m.login) {
      const [loginH, loginM] = m.login.split(':').map(Number);
      // Assume a standard 8-hour shift layout
      const startHourStr = m.login;
      const endHour = (loginH + 8) % 24;
      const endHourStr = `${endHour.toString().padStart(2, '0')}:${loginM.toString().padStart(2, '0')}`;
      timing = `${startHourStr} - ${endHourStr}`;
    } else {
      // Provide distinctive shifts for specific people to make calendars feel personalized and realistic!
      const defaults: Record<string, string> = {
        'abdelrahman': '09:00 - 17:00',
        'joe': '11:00 - 19:00',
        'mina': '10:00 - 18:00',
        'karim': '12:00 - 20:00',
        'shams': '13:00 - 21:00',
        'omar': '14:00 - 22:00',
        'yusuf': '12:30 - 20:30',
        'sarah': '08:30 - 16:30',
        'liam': '09:15 - 17:15',
        'marcus': '07:30 - 15:30',
        'elena': '10:00 - 18:00',
        'kenji': '11:00 - 19:00'
      };
      
      const key = m.name.toLowerCase();
      const matchedKey = Object.keys(defaults).find(k => key.includes(k) || k.includes(key));
      timing = matchedKey ? defaults[matchedKey] : "10:00 - 18:00";
    }

    return {
      isOff,
      timing,
      dayName: dayOfWeekName
    };
  };

  // Build the calendar matrix cells
  const cells: (Date | null)[] = [];
  // Add empty slots before the first day of the month
  for (let i = 0; i < firstDayIndex; i++) {
    cells.push(null);
  }
  // Add actual dates of the month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(currentYear, currentMonth, d));
  }

  // Selected date object
  const selectedDateObject = new Date(currentYear, currentMonth, selectedDay);
  const selectedDateSchedule = getDailySchedule(selectedDateObject, member);
  const isSelectedDateToday = 
    selectedDateObject.getDate() === now.getDate() &&
    selectedDateObject.getMonth() === now.getMonth() &&
    selectedDateObject.getFullYear() === now.getFullYear();

  // Highlight classes based on tomorrow, today, or past
  const getDateStatusLabel = (checkDate: Date, m: Member) => {
    const isToday = 
      checkDate.getDate() === now.getDate() &&
      checkDate.getMonth() === now.getMonth() &&
      checkDate.getFullYear() === now.getFullYear();

    const isPast = checkDate.getTime() < now.setHours(0,0,0,0);
    const sched = getDailySchedule(checkDate, m);

    if (sched.isOff) {
      return {
        label: "Day Off",
        bgLight: "bg-slate-50 border-slate-100",
        bgCell: "bg-slate-50/70 text-slate-400 hover:bg-slate-100/80",
        badge: "text-slate-500 bg-slate-100 border-slate-200"
      };
    }

    if (isToday) {
      return {
        label: "Active Today",
        bgLight: "bg-indigo-50/50 border-indigo-100",
        bgCell: "bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200 hover:bg-indigo-100/50",
        badge: "text-indigo-700 bg-indigo-100 border-indigo-250 animate-pulse"
      };
    }

    if (isPast) {
      return {
        label: "Shift Completed",
        bgLight: "bg-green-50/40 border-green-100",
        bgCell: "bg-emerald-50/40 text-emerald-800 hover:bg-emerald-50/80",
        badge: "text-emerald-700 bg-emerald-50 border-emerald-100"
      };
    }

    return {
      label: "Upcoming Shift",
      bgLight: "bg-sky-50/40 border-sky-100",
      bgCell: "bg-sky-50/60 text-sky-800 hover:bg-sky-100/50",
      badge: "text-sky-700 bg-sky-50 border-sky-100"
    };
  };

  return (
    <div id="shift-calendar-container" className="space-y-4 pt-1">
      
      {/* Container header card with nice gradient header */}
      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
        
        {/* Banner header title */}
        <div className="bg-slate-900 px-4 py-3 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sky-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Shift Roster & Calendar
            </h4>
          </div>
          <span className="text-[10px] bg-slate-800 text-sky-300 font-mono font-semibold px-2 py-0.5 rounded border border-slate-700">
            Current schedule
          </span>
        </div>

        {/* Calendar Controller Header */}
        <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="text-xs font-bold text-slate-700 font-sans tracking-tight">
            {MONTHS[currentMonth]} {currentYear}
          </span>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Days of week titles */}
        <div className="p-3">
          <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 border-b border-slate-50 pb-2">
            {WEEKDAYS.map(day => (
              <div key={day} className="py-0.5">
                {day}
              </div>
            ))}
          </div>

          {/* Grid of days */}
          <div className="grid grid-cols-7 gap-1 mt-2 text-xs">
            {cells.map((cellDate, idx) => {
              if (cellDate === null) {
                return <div key={`empty-${idx}`} className="h-9" />;
              }

              const dayVal = cellDate.getDate();
              const isSelected = selectedDay === dayVal;
              const dateInfo = getDateStatusLabel(cellDate, member);
              const sched = getDailySchedule(cellDate, member);

              return (
                <button
                  key={`day-${dayVal}`}
                  type="button"
                  onClick={() => setSelectedDay(dayVal)}
                  className={`h-9 flex flex-col items-center justify-center rounded-lg transition-all relative select-none group
                    ${isSelected 
                      ? 'bg-blue-600 text-white font-bold ring-2 ring-blue-300 ring-offset-1 z-10 hover:bg-blue-700' 
                      : dateInfo.bgCell
                    }
                  `}
                >
                  <span className="text-[11px]">{dayVal}</span>
                  
                  {/* Subtle lower dot indicators */}
                  {!isSelected && (
                    <span className={`w-1 h-1 rounded-full mt-0.5 ${sched.isOff ? 'bg-slate-300' : 'bg-emerald-400'}`} />
                  )}
                  {isSelected && (
                    <span className="w-1 h-1 rounded-full mt-0.5 bg-blue-200" />
                  )}

                  {/* Tiny hover tip showing timings */}
                  <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-all pointer-events-none capitalize z-30 shadow whitespace-nowrap">
                    {sched.isOff ? 'Day Off' : sched.timing}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Day Status Details Box */}
      <div className={`p-4 rounded-xl border border-dashed transition-all ${
        selectedDateSchedule.isOff 
          ? 'bg-slate-50/50 border-slate-200' 
          : isSelectedDateToday 
            ? 'bg-indigo-50/40 border-indigo-200/50' 
            : 'bg-emerald-50/20 border-emerald-200/50'
      }`}>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">
              Selected Day Schedule
            </span>
            <h5 className="text-xs font-bold text-[#0B1F3A]">
              {selectedDateObject.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              {isSelectedDateToday && (
                <span className="ml-1.5 inline-flex items-center text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded-full">
                  Today
                </span>
              )}
            </h5>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {selectedDateSchedule.isOff ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                <Coffee className="w-3 h-3" /> Off Day
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                <Clock className="w-3 h-3 text-emerald-600" /> {selectedDateSchedule.timing}
              </span>
            )}
          </div>
        </div>

        {/* Selected Day Core Summary details for the active Member */}
        <p className="text-xs text-slate-600 leading-normal mb-3">
          {selectedDateSchedule.isOff ? (
            <span><strong>{member.name}</strong> is scheduled for a regular weekly day off. No operations are expected.</span>
          ) : (
            <span>
              <strong>{member.name}</strong> is scheduled to work their active interval from <strong>{selectedDateSchedule.timing}</strong>. 
              {selectedDateObject < now && !selectedDateSchedule.isOff ? " Shift successfully logged." : " Shift assignment is upcoming."}
            </span>
          )}
        </p>

        {/* Team-wide Shift Coverage List: DISPLAYS ASSIGNMENTS FOR ALL MEMBERS! */}
        <div className="pt-3 border-t border-slate-100/80 mt-3 space-y-2">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-400" />
              Team Coverage on this Day
            </span>
            <span className="text-[9px] text-[#2563EB] font-bold">
              {allMembers.filter(m => !getDailySchedule(selectedDateObject, m).isOff).length} Active Workers
            </span>
          </div>

          {/* Scrolling sub-list of other members' scheduled status for that calendar day */}
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {allMembers.map(m => {
              const mSched = getDailySchedule(selectedDateObject, m);
              const mIsSelf = m.id === member.id;
              
              return (
                <div 
                  key={m.id}
                  className={`p-2 rounded-lg text-xs flex items-center justify-between border transition-all ${
                    mIsSelf 
                      ? 'bg-blue-50/50 border-blue-100 font-medium' 
                      : 'bg-white hover:bg-slate-50 border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${mSched.isOff ? 'bg-slate-300' : 'bg-green-500'}`} />
                    <span className={`text-[11px] ${mIsSelf ? 'text-blue-900 font-bold' : 'text-slate-700 font-medium'}`}>
                      {m.name} {mIsSelf && <span className="text-[9px] text-blue-500 font-normal">(Editing)</span>}
                    </span>
                  </div>

                  <span className={`text-[10px] leading-none font-mono ${
                    mSched.isOff 
                      ? 'text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100' 
                      : 'text-slate-600 font-semibold'
                  }`}>
                    {mSched.isOff ? 'Weekend/Day Off' : mSched.timing}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
