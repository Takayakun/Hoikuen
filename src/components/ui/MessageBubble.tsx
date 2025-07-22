'use client';

import { motion } from 'framer-motion';
import { Image as ImageIcon, FileText } from 'lucide-react';
import { Message } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showSender?: boolean;
}

export default function MessageBubble({ 
  message, 
  isOwnMessage, 
  showSender = true 
}: MessageBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
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
          {!isOwnMessage && showSender && (
            <p className="text-xs font-medium mb-1 opacity-80">
              {message.senderName}
            </p>
          )}
          
          {message.content && (
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>
          )}
          
          {message.attachments && message.attachments.length > 0 && (
            <div className={`${message.content ? 'mt-2' : ''} space-y-2`}>
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
                  <span className="text-xs opacity-60">
                    {(attachment.size / 1024 / 1024).toFixed(1)}MB
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
        
        <div className={`flex items-center gap-2 mt-1 ${
          isOwnMessage ? 'justify-end' : 'justify-start'
        }`}>
          <p className="text-xs text-gray-500">
            {formatDistanceToNow(message.createdAt, {
              addSuffix: true,
              locale: ja,
            })}
          </p>
          {isOwnMessage && message.readBy.length > 1 && (
            <div className="text-xs text-gray-500">
              ✓ 既読
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}