'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, MessageCircle, FileText, Calendar, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  {
    icon: Home,
    label: 'ホーム',
    href: '/dashboard',
  },
  {
    icon: MessageCircle,
    label: 'メッセージ',
    href: '/messages',
  },
  {
    icon: FileText,
    label: 'プリント',
    href: '/prints',
  },
  {
    icon: Calendar,
    label: 'カレンダー',
    href: '/calendar',
  },
  {
    icon: User,
    label: 'プロフィール',
    href: '/profile',
  },
];

export default function MobileNav() {
  const { currentUser } = useAuth();
  const pathname = usePathname();

  if (!currentUser) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-area-inset-bottom">
      <div className="glass-effect border-t border-gray-200 dark:border-gray-700">
        <nav className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center p-2 min-w-0 flex-1 relative"
              >
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  className={`p-2 rounded-lg transition-colors ${
                    isActive 
                      ? 'text-cyan-500' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  <item.icon size={20} />
                </motion.div>
                <span 
                  className={`text-xs font-medium transition-colors ${
                    isActive 
                      ? 'text-cyan-500' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {item.label}
                </span>
                
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}