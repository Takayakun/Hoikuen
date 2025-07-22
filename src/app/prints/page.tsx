'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Filter, Upload, Download, Eye, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { printService } from '@/services/printService';
import { Print } from '@/types';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

const defaultCategories = [
  'すべて',
  'お知らせ',
  '給食',
  '行事',
  '保健',
  '学習',
  '重要',
  'その他'
];

export default function PrintsPage() {
  const { userProfile } = useAuth();
  const [prints, setPrints] = useState<Print[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('すべて');
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile?.schoolId) return;

    // Load categories
    printService.getCategories(userProfile.schoolId).then((fetchedCategories) => {
      const allCategories = ['すべて', ...fetchedCategories];
      setCategories(allCategories);
    });

    // Subscribe to prints
    const unsubscribe = printService.subscribeToPrints(
      userProfile.schoolId,
      (updatedPrints) => {
        setPrints(updatedPrints);
        setLoading(false);
      },
      selectedCategory === 'すべて' ? undefined : selectedCategory
    );

    return () => unsubscribe();
  }, [userProfile?.schoolId, selectedCategory]);

  const filteredPrints = prints.filter((print) => {
    if (!searchQuery) return true;
    const lowercaseQuery = searchQuery.toLowerCase();
    return (
      print.title.toLowerCase().includes(lowercaseQuery) ||
      (print.description && print.description.toLowerCase().includes(lowercaseQuery))
    );
  });

  const handleDownload = async (print: Print) => {
    try {
      const response = await fetch(print.fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${print.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

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
          <h1 className="text-3xl font-bold">プリント・お知らせ</h1>
          {userProfile?.role === 'teacher' && (
            <Link
              href="/prints/upload"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              <Upload size={20} />
              新規アップロード
            </Link>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="プリントを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="text-gray-400" size={20} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredPrints.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600 dark:text-gray-300">
              {searchQuery ? '検索結果がありません' : 'プリントはまだありません'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrints.map((print, index) => (
              <motion.div
                key={print.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="glass-effect rounded-2xl p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                      <FileText className="text-white" size={24} />
                    </div>
                    <div>
                      <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                        {print.category}
                      </span>
                    </div>
                  </div>
                </div>

                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                  {print.title}
                </h3>

                {print.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {print.description}
                  </p>
                )}

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <Calendar size={12} />
                  {formatDistanceToNow(print.createdAt, {
                    addSuffix: true,
                    locale: ja,
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.open(print.fileUrl, '_blank')}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Eye size={16} />
                    プレビュー
                  </button>
                  <button
                    onClick={() => handleDownload(print)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-cyan-400 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    <Download size={16} />
                    ダウンロード
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}