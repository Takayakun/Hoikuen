'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Event } from '@/types';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday
} from 'date-fns';
import { ja } from 'date-fns/locale';

interface CalendarProps {
  events: Event[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onMonthChange: (date: Date) => void;
}

export default function Calendar({ 
  events, 
  selectedDate, 
  onDateSelect, 
  onMonthChange 
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const dateFormat = 'yyyy年M月';
  const rows = [];
  let days = [];
  let day = startDate;
  let formattedDate = '';

  const previousMonth = () => {
    const newMonth = subMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    onMonthChange(newMonth);
  };

  const nextMonth = () => {
    const newMonth = addMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    onMonthChange(newMonth);
  };

  const getEventsForDate = (date: Date): Event[] => {
    return events.filter(event => isSameDay(event.date, date));
  };

  // Create calendar days
  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, 'd');
      const cloneDay = day;
      const dayEvents = getEventsForDate(day);
      
      days.push(
        <motion.div
          key={day.toString()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onDateSelect(cloneDay)}
          className={`
            relative p-1 sm:p-2 cursor-pointer rounded-lg transition-all duration-200 min-h-[44px] flex flex-col justify-start
            ${!isSameMonth(day, monthStart) 
              ? 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800' 
              : 'hover:bg-cyan-50 dark:hover:bg-cyan-900/20'
            }
            ${isSameDay(day, selectedDate) 
              ? 'bg-cyan-500 text-white hover:bg-cyan-600' 
              : ''
            }
            ${isToday(day) && !isSameDay(day, selectedDate)
              ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 font-semibold'
              : ''
            }
          `}
        >
          <div className="text-sm font-medium mb-1">{formattedDate}</div>
          {dayEvents.length > 0 && (
            <div className="space-y-0.5">
              {dayEvents.slice(0, window.innerWidth < 640 ? 1 : 3).map((event, index) => (
                <div
                  key={event.id}
                  className={`text-[10px] sm:text-xs px-1 py-0.5 rounded truncate ${
                    isSameDay(day, selectedDate)
                      ? 'bg-white/20 text-white'
                      : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white'
                  }`}
                  title={event.title}
                >
                  {event.title.length > 8 ? event.title.substring(0, 8) + '...' : event.title}
                </div>
              ))}
              {dayEvents.length > (window.innerWidth < 640 ? 1 : 3) && (
                <div className={`text-[10px] sm:text-xs text-center ${
                  isSameDay(day, selectedDate)
                    ? 'text-white/80'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  +{dayEvents.length - (window.innerWidth < 640 ? 1 : 3)}
                </div>
              )}
            </div>
          )}
        </motion.div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div key={day.toString()} className="grid grid-cols-7 gap-1">
        {days}
      </div>
    );
    days = [];
  }

  return (
    <div className="glass-effect rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="text-cyan-500" size={24} />
          <h2 className="text-xl font-bold">
            {format(currentMonth, dateFormat, { locale: ja })}
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
          <div 
            key={day} 
            className={`p-2 text-center text-sm font-semibold ${
              index === 0 ? 'text-red-500' : 
              index === 6 ? 'text-blue-500' : 
              'text-gray-600 dark:text-gray-400'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMonth.toString()}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-1"
        >
          {rows}
        </motion.div>
      </AnimatePresence>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-100 dark:bg-cyan-900/30 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">今日</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">選択中</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">イベントあり</span>
          </div>
        </div>
      </div>
    </div>
  );
}