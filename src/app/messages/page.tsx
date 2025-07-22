'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Search, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { messageService } from '@/services/messageService';
import { Conversation } from '@/types';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

export default function MessagesPage() {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = messageService.subscribeToConversations(
      currentUser.uid,
      (updatedConversations) => {
        setConversations(updatedConversations);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const filteredConversations = conversations.filter((conversation) => {
    const otherParticipant = conversation.participantDetails.find(
      (p) => p.id !== currentUser?.uid
    );
    return otherParticipant?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

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
          <h1 className="text-3xl font-bold">メッセージ</h1>
          <Link
            href="/messages/new"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            <Plus size={20} />
            新規メッセージ
          </Link>
        </div>

        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="メッセージを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
          </div>
        </div>

        {filteredConversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600 dark:text-gray-300">
              {searchQuery ? '検索結果がありません' : 'メッセージはまだありません'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredConversations.map((conversation, index) => {
              const otherParticipant = conversation.participantDetails.find(
                (p) => p.id !== currentUser?.uid
              );
              const isUnread = conversation.unreadCount > 0;

              return (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link href={`/messages/${conversation.id}`}>
                    <div className={`glass-effect p-6 rounded-2xl hover:shadow-xl transition-all duration-300 ${
                      isUnread ? 'ring-2 ring-cyan-400' : ''
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {otherParticipant?.name.charAt(0) || '?'}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {otherParticipant?.name || '不明なユーザー'}
                            </h3>
                            {conversation.lastMessage && (
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                {conversation.lastMessage.senderId === currentUser?.uid && (
                                  <span className="text-gray-500">あなた: </span>
                                )}
                                {conversation.lastMessage.content}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(conversation.lastMessageAt, {
                              addSuffix: true,
                              locale: ja,
                            })}
                          </p>
                          {isUnread && (
                            <div className="mt-2 inline-flex items-center justify-center w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold">
                              {conversation.unreadCount}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}