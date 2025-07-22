'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, MapPin, List, User, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event, User as UserType } from '@/types';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import Link from 'next/link';
import { eventService } from '@/services/eventService';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const { userProfile } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [creator, setCreator] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventDoc = await getDoc(doc(db, 'events', eventId));
        if (eventDoc.exists()) {
          const eventData = {
            ...eventDoc.data(),
            date: eventDoc.data().date.toDate(),
            createdAt: eventDoc.data().createdAt?.toDate() || new Date(),
            updatedAt: eventDoc.data().updatedAt?.toDate() || new Date(),
          } as Event;
          
          setEvent(eventData);

          // Fetch creator info
          if (eventData.createdBy) {
            const creatorDoc = await getDoc(doc(db, 'users', eventData.createdBy));
            if (creatorDoc.exists()) {
              setCreator(creatorDoc.data() as UserType);
            }
          }
        } else {
          router.push('/calendar');
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        router.push('/calendar');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId, router]);

  const handleDelete = async () => {
    if (!event || !window.confirm('このイベントを削除しますか？この操作は取り消せません。')) {
      return;
    }

    setDeleting(true);
    try {
      await eventService.deleteEvent(event.id);
      router.push('/calendar');
    } catch (error) {
      console.error('Delete error:', error);
      alert('削除に失敗しました。もう一度お試しください。');
    } finally {
      setDeleting(false);
    }
  };

  const canEdit = userProfile?.role === 'teacher' && userProfile?.id === event?.createdBy;

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

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">イベントが見つかりません</h1>
          <Link
            href="/calendar"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-600 text-white rounded-lg"
          >
            カレンダーに戻る
          </Link>
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
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/calendar"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-bold">イベント詳細</h1>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="glass-effect rounded-2xl p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                    <Calendar className="text-white" size={24} />
                  </div>
                </div>
                
                <h2 className="text-3xl font-bold mb-4">{event.title}</h2>
                
                {event.description && (
                  <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">
                    {event.description}
                  </p>
                )}
              </div>

              {canEdit && (
                <div className="flex items-center gap-2 ml-6">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* Event Details */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <Calendar className="text-cyan-500" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">日付</p>
                    <p className="font-semibold">
                      {format(event.date, 'yyyy年M月d日(E)', { locale: ja })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <Clock className="text-blue-500" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">時間</p>
                    <p className="font-semibold">
                      {format(event.date, 'HH:mm', { locale: ja })}
                    </p>
                  </div>
                </div>

                {event.location && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <MapPin className="text-green-500" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">場所</p>
                      <p className="font-semibold">{event.location}</p>
                    </div>
                  </div>
                )}

                {creator && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <User className="text-purple-500" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">作成者</p>
                      <p className="font-semibold">{creator.name}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Items */}
              {event.items && event.items.length > 0 && (
                <div className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <List className="text-cyan-600" size={20} />
                    <h3 className="text-lg font-semibold">持ち物・準備物</h3>
                  </div>
                  <ul className="space-y-2">
                    {event.items.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2"></div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Footer Info */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500">
                作成日: {format(event.createdAt, 'yyyy年M月d日 HH:mm', { locale: ja })}
                {event.updatedAt.getTime() !== event.createdAt.getTime() && (
                  <span className="ml-4">
                    更新日: {format(event.updatedAt, 'yyyy年M月d日 HH:mm', { locale: ja })}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}