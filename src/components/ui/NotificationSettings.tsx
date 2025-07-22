'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, Check, X } from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import { useAuth } from '@/contexts/AuthContext';

export default function NotificationSettings() {
  const { currentUser } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);

  useEffect(() => {
    setIsSupported(notificationService.isSupported());
    setPermission(notificationService.getPermissionStatus());
  }, []);

  const handleEnableNotifications = async () => {
    if (!currentUser) return;
    
    setIsEnabling(true);
    try {
      const token = await notificationService.requestPermission();
      if (token) {
        await notificationService.saveFCMToken(currentUser.uid, token);
        setPermission('granted');
        
        // Show test notification
        notificationService.showNotification({
          title: 'FlowNote',
          body: '通知が有効になりました！',
          icon: '/icon-192x192.png'
        });
      } else {
        setPermission('denied');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
    } finally {
      setIsEnabling(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <BellOff className="text-gray-500" size={24} />
          <h3 className="text-lg font-semibold">通知設定</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          このブラウザは通知機能をサポートしていません。
        </p>
      </div>
    );
  }

  return (
    <div className="glass-effect rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Bell className="text-cyan-500" size={24} />
        <h3 className="text-lg font-semibold">通知設定</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">プッシュ通知</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              新しいメッセージやお知らせを受信します
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {permission === 'granted' && (
              <div className="flex items-center gap-2 text-green-600">
                <Check size={16} />
                <span className="text-sm">有効</span>
              </div>
            )}
            
            {permission === 'denied' && (
              <div className="flex items-center gap-2 text-red-600">
                <X size={16} />
                <span className="text-sm">無効</span>
              </div>
            )}
            
            {permission === 'default' && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleEnableNotifications}
                disabled={isEnabling}
                className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isEnabling ? '設定中...' : '有効にする'}
              </motion.button>
            )}
          </div>
        </div>

        {permission === 'denied' && (
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              通知が無効になっています。ブラウザの設定から通知を許可してください。
            </p>
          </div>
        )}

        {permission === 'granted' && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300">
              通知が有効になっています。重要なお知らせをリアルタイムで受信できます。
            </p>
          </div>
        )}

        <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-sm">通知の種類</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>新しいメッセージ</span>
              <div className="w-4 h-4 bg-cyan-500 rounded"></div>
            </div>
            <div className="flex items-center justify-between">
              <span>プリント・お知らせ</span>
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
            </div>
            <div className="flex items-center justify-between">
              <span>行事・イベント</span>
              <div className="w-4 h-4 bg-green-500 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}