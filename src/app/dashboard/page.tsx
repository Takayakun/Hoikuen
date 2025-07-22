'use client';

import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { MessageCircle, FileText, Calendar, Bell } from 'lucide-react';
import Link from 'next/link';
import NotificationSettings from '@/components/ui/NotificationSettings';

const quickActions = [
  {
    icon: MessageCircle,
    title: 'メッセージ',
    description: '新着メッセージを確認',
    href: '/messages',
    color: 'from-cyan-400 to-blue-500',
    count: 3,
  },
  {
    icon: FileText,
    title: 'プリント',
    description: '最新のお知らせ',
    href: '/prints',
    color: 'from-purple-400 to-pink-500',
    count: 5,
  },
  {
    icon: Calendar,
    title: 'イベント',
    description: '今週の予定',
    href: '/calendar',
    color: 'from-green-400 to-emerald-500',
    count: 2,
  },
  {
    icon: Bell,
    title: '通知',
    description: '未読の通知',
    href: '/notifications',
    color: 'from-orange-400 to-red-500',
    count: 8,
  },
];

export default function DashboardPage() {
  const { userProfile } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">
          こんにちは、{userProfile?.name || 'ユーザー'}さん
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          今日も素敵な一日をお過ごしください
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={action.href}>
                <div className="glass-effect p-4 sm:p-6 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative">
                  {action.count > 0 && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {action.count}
                    </div>
                  )}
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center mb-3 sm:mb-4`}>
                    <action.icon className="text-white" size={window.innerWidth < 640 ? 20 : 24} />
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base mb-1">{action.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    {action.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-effect p-6 rounded-2xl"
          >
            <h2 className="text-xl font-semibold mb-4">最近のアクティビティ</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">新しいプリントが配布されました</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    「12月の給食献立表」が追加されました
                  </p>
                  <p className="text-xs text-gray-500 mt-1">2時間前</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">山田先生からメッセージ</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    明日の持ち物についてお知らせがあります
                  </p>
                  <p className="text-xs text-gray-500 mt-1">5時間前</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">イベントリマインダー</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    「クリスマス会」まであと3日です
                  </p>
                  <p className="text-xs text-gray-500 mt-1">昨日</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-effect p-6 rounded-2xl"
          >
            <h2 className="text-xl font-semibold mb-4">今週の予定</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500">月</p>
                  <p className="text-lg font-bold">18</p>
                </div>
                <div className="flex-1">
                  <p className="font-medium">通常授業</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    8:30 - 14:30
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500">水</p>
                  <p className="text-lg font-bold">20</p>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-red-600">クリスマス会</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    10:00 - 12:00 体育館
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500">金</p>
                  <p className="text-lg font-bold">22</p>
                </div>
                <div className="flex-1">
                  <p className="font-medium">終業式</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    8:30 - 11:30 冬休み開始
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Notification Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <NotificationSettings />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}