'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, Bell, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  return (
    <header className="glass-effect sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href={currentUser ? "/dashboard" : "/"} className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <span className="text-xl font-bold">FlowNote</span>
          </Link>

          {currentUser && (
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/messages" className="hover:text-cyan-500 transition-colors">
                メッセージ
              </Link>
              <Link href="/prints" className="hover:text-cyan-500 transition-colors">
                プリント
              </Link>
              <Link href="/calendar" className="hover:text-cyan-500 transition-colors">
                カレンダー
              </Link>
            </nav>
          )}

          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <Bell size={20} />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <User size={20} />
                </button>
                <button
                  className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium hover:text-cyan-500 transition-colors"
                >
                  ログイン
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                >
                  新規登録
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && currentUser && (
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden glass-effect absolute top-full left-0 right-0 p-4"
          >
            <div className="flex flex-col space-y-4">
              <Link
                href="/messages"
                className="hover:text-cyan-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                メッセージ
              </Link>
              <Link
                href="/prints"
                className="hover:text-cyan-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                プリント
              </Link>
              <Link
                href="/calendar"
                className="hover:text-cyan-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                カレンダー
              </Link>
              <hr className="border-gray-200 dark:border-gray-700" />
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 text-red-500 hover:text-red-600"
              >
                <LogOut size={16} />
                <span>ログアウト</span>
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}