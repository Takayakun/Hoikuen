'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Plus, Clock, MapPin, List } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { eventService } from '@/services/eventService';
import { Event } from '@/types';
import Calendar from '@/components/ui/Calendar';
import Link from 'next/link';
import { format, isSameDay } from 'date-fns';
import { ja } from 'date-fns/locale';

export default function CalendarPage() {
  const { userProfile } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile?.schoolId) return;

    const unsubscribe = eventService.subscribeToEventsForMonth(
      userProfile.schoolId,
      currentMonth,
      (updatedEvents) => {
        setEvents(updatedEvents);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userProfile?.schoolId, currentMonth]);

  const selectedDateEvents = events.filter(event => 
    isSameDay(event.date, selectedDate)
  );

  const upcomingEvents = events
    .filter(event => event.date >= new Date())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">カレンダー・行事予定</h1>
          {userProfile?.role === 'teacher' && (
            <Link
              href="/calendar/new"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              <Plus size={20} />
              新規イベント
            </Link>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Calendar
              events={events}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              onMonthChange={setCurrentMonth}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Date Events */}
            <div className="glass-effect rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">
                {format(selectedDate, 'M月d日(E)', { locale: ja })}の予定
              </h3>
              
              {selectedDateEvents.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-300 text-center py-4">
                  この日の予定はありません
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedDateEvents.map((event) => (
                    <Link key={event.id} href={`/calendar/${event.id}`}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg hover:shadow-md transition-all cursor-pointer"
                      >
                        <h4 className="font-medium mb-2">{event.title}</h4>
                        {event.location && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-1">
                            <MapPin size={14} />
                            {event.location}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <Clock size={14} />
                          {format(event.date, 'HH:mm', { locale: ja })}
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Events */}
            <div className="glass-effect rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <List size={20} />
                今後の予定
              </h3>
              
              {upcomingEvents.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-300 text-center py-4">
                  今後の予定はありません
                </p>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map((event, index) => (
                    <Link key={event.id} href={`/calendar/${event.id}`}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        className="p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium mb-1 text-sm">{event.title}</h4>
                            <div className="text-xs text-gray-600 dark:text-gray-300">
                              {format(event.date, 'M月d日(E) HH:mm', { locale: ja })}
                            </div>
                          </div>
                          <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full ml-2 mt-1"></div>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="glass-effect rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">今月の統計</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">総イベント数</span>
                  <span className="font-semibold text-cyan-600">{events.length}件</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">今後の予定</span>
                  <span className="font-semibold text-blue-600">{upcomingEvents.length}件</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}