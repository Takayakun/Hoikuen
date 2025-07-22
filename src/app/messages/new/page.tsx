'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { messageService } from '@/services/messageService';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from '@/types';
import Link from 'next/link';

export default function NewMessagePage() {
  const router = useRouter();
  const { currentUser, userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const searchUsers = async () => {
      setLoading(true);
      try {
        // Search by name (simple contains search)
        const q = query(
          collection(db, 'users'),
          where('name', '>=', searchQuery),
          where('name', '<=', searchQuery + '\uf8ff')
        );
        
        const snapshot = await getDocs(q);
        const users: User[] = [];
        
        snapshot.forEach((doc) => {
          const userData = doc.data() as User;
          // Don't include current user in results
          if (userData.id !== currentUser?.uid) {
            users.push(userData);
          }
        });
        
        setSearchResults(users);
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchUsers, 500);
    return () => clearTimeout(debounce);
  }, [searchQuery, currentUser]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedUser || !currentUser || !userProfile) return;

    setSending(true);
    try {
      // Get or create conversation
      const conversationId = await messageService.getOrCreateConversation([
        currentUser.uid,
        selectedUser.id,
      ]);

      // Send message
      await messageService.sendMessage(
        conversationId,
        currentUser.uid,
        userProfile.name,
        message
      );

      // Navigate to the conversation
      router.push(`/messages/${conversationId}`);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/messages"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-bold">新規メッセージ</h1>
        </div>

        <div className="glass-effect rounded-2xl p-6">
          {!selectedUser ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">送信先を選択</h2>
              
              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder="名前で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
              </div>

              {loading && (
                <div className="text-center py-4">
                  <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              )}

              {searchResults.length === 0 && searchQuery.trim().length >= 2 && !loading && (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-300">検索結果がありません</p>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className="w-full flex items-center gap-4 p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {user.role === 'teacher' ? '先生' : '保護者'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedUser.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg">{selectedUser.name}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {selectedUser.role === 'teacher' ? '先生' : '保護者'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  変更
                </button>
              </div>

              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    メッセージ
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="メッセージを入力してください..."
                    rows={6}
                    className="w-full p-4 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending || !message.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-400 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  <Send size={20} />
                  {sending ? '送信中...' : 'メッセージを送信'}
                </button>
              </form>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}