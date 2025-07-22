'use client';

import { motion } from 'framer-motion';
import { MessageCircle, FileText, Calendar, Shield, Users, Sparkles } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: MessageCircle,
    title: 'スマートメッセージ',
    description: '先生と保護者の個別連絡がスムーズに。既読確認で安心。',
    color: 'from-cyan-400 to-blue-500',
  },
  {
    icon: FileText,
    title: 'プリント管理',
    description: '大切なお知らせを見逃さない。PDFで整理整頓。',
    color: 'from-purple-400 to-pink-500',
  },
  {
    icon: Calendar,
    title: '行事カレンダー',
    description: '年間行事を一目で確認。リマインダーでうっかり防止。',
    color: 'from-green-400 to-emerald-500',
  },
  {
    icon: Shield,
    title: '安心セキュリティ',
    description: '大切な子どもの情報を安全に管理。',
    color: 'from-orange-400 to-red-500',
  },
  {
    icon: Users,
    title: '簡単操作',
    description: '誰でも使いやすい直感的なデザイン。',
    color: 'from-indigo-400 to-purple-500',
  },
  {
    icon: Sparkles,
    title: '美しいUI',
    description: '毎日使いたくなる、心地よい体験。',
    color: 'from-pink-400 to-rose-500',
  },
];

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
          FlowNote
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
          教育現場と家庭をつなぐ、新しいコミュニケーション
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-3 bg-gradient-to-r from-cyan-400 to-blue-600 text-white rounded-full font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            ログイン
          </Link>
          <Link
            href="/register"
            className="px-8 py-3 glass-effect rounded-full font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            新規登録
          </Link>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="glass-effect p-6 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
              <feature.icon className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold mb-4">子育ての毎日に、安心と余裕を</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          FlowNoteは、忙しい保護者の方々と教育現場をスムーズにつなぎます。
          大切なお知らせを見逃さず、必要な情報にすぐアクセス。
          美しいインターフェースで、毎日の確認が楽しくなります。
        </p>
      </motion.div>
    </div>
  );
}