'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, ArrowLeft, Image as ImageIcon, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { messageService } from '@/services/messageService';
import { Message, Conversation } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import Link from 'next/link';

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as string;
  const { currentUser, userProfile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!currentUser || !conversationId) return;

    // Subscribe to messages
    const unsubscribeMessages = messageService.subscribeToMessages(
      conversationId,
      (updatedMessages) => {
        setMessages(updatedMessages);
        scrollToBottom();
      }
    );

    // Subscribe to conversation details
    const unsubscribeConversation = messageService.subscribeToConversations(
      currentUser.uid,
      (conversations) => {
        const currentConversation = conversations.find(c => c.id === conversationId);
        if (currentConversation) {
          setConversation(currentConversation);
        }
      }
    );

    // Mark messages as read
    messageService.markMessagesAsRead(conversationId, currentUser.uid);

    return () => {
      unsubscribeMessages();
      unsubscribeConversation();
    };
  }, [currentUser, conversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && attachments.length === 0) return;
    if (!currentUser || !userProfile) return;

    setSending(true);
    try {
      await messageService.sendMessage(
        conversationId,
        currentUser.uid,
        userProfile.name,
        newMessage,
        attachments
      );
      setNewMessage('');
      setAttachments([]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const otherParticipant = conversation?.participantDetails.find(
    (p) => p.id !== currentUser?.uid
  );

  return (
    <div className="container mx-auto px-4 py-4 h-[calc(100vh-80px)] flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect p-4 rounded-2xl mb-4"
      >
        <div className="flex items-center gap-4">
          <Link
            href="/messages"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {otherParticipant?.name.charAt(0) || '?'}
            </div>
            <div>
              <h2 className="font-semibold">{otherParticipant?.name || '不明なユーザー'}</h2>
              <p className="text-xs text-gray-500">
                {otherParticipant?.role === 'teacher' ? '先生' : '保護者'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex-1 glass-effect rounded-2xl p-4 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          <AnimatePresence>
            {messages.map((message, index) => {
              const isOwnMessage = message.senderId === currentUser?.uid;
              
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        isOwnMessage
                          ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                    >
                      {!isOwnMessage && (
                        <p className="text-xs font-medium mb-1 opacity-80">
                          {message.senderName}
                        </p>
                      )}
                      <p className="text-sm">{message.content}</p>
                      
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {message.attachments.map((attachment) => (
                            <a
                              key={attachment.id}
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center gap-2 p-2 rounded-lg ${
                                isOwnMessage
                                  ? 'bg-white/20 hover:bg-white/30'
                                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                              } transition-colors`}
                            >
                              {attachment.type.startsWith('image/') ? (
                                <ImageIcon size={16} />
                              ) : (
                                <FileText size={16} />
                              )}
                              <span className="text-xs truncate">{attachment.name}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                      {formatDistanceToNow(message.createdAt, {
                        addSuffix: true,
                        locale: ja,
                      })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            className="hidden"
          />
          
          <div className="flex-1 flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-full px-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <Paperclip size={20} />
            </button>
            
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="メッセージを入力..."
              className="flex-1 py-3 bg-transparent focus:outline-none"
              disabled={sending}
            />
            
            {attachments.length > 0 && (
              <span className="text-xs text-gray-500">
                {attachments.length}個のファイル
              </span>
            )}
          </div>
          
          <button
            type="submit"
            disabled={sending || (!newMessage.trim() && attachments.length === 0)}
            className="p-3 bg-gradient-to-r from-cyan-400 to-blue-600 text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}