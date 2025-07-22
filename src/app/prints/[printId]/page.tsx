'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Download, Eye, Calendar, User, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Print, User as UserType } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import Link from 'next/link';
import PDFViewer from '@/components/ui/PDFViewer';
import { printService } from '@/services/printService';

export default function PrintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const printId = params.printId as string;
  const { userProfile } = useAuth();
  const [print, setPrint] = useState<Print | null>(null);
  const [uploader, setUploader] = useState<UserType | null>(null);
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchPrint = async () => {
      try {
        const printDoc = await getDoc(doc(db, 'prints', printId));
        if (printDoc.exists()) {
          const printData = {
            ...printDoc.data(),
            createdAt: printDoc.data().createdAt?.toDate() || new Date(),
            updatedAt: printDoc.data().updatedAt?.toDate() || new Date(),
          } as Print;
          
          setPrint(printData);

          // Fetch uploader info
          if (printData.uploadedBy) {
            const uploaderDoc = await getDoc(doc(db, 'users', printData.uploadedBy));
            if (uploaderDoc.exists()) {
              setUploader(uploaderDoc.data() as UserType);
            }
          }
        } else {
          router.push('/prints');
        }
      } catch (error) {
        console.error('Error fetching print:', error);
        router.push('/prints');
      } finally {
        setLoading(false);
      }
    };

    if (printId) {
      fetchPrint();
    }
  }, [printId, router]);

  const handleDownload = async () => {
    if (!print) return;
    
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

  const handleDelete = async () => {
    if (!print || !window.confirm('このプリントを削除しますか？この操作は取り消せません。')) {
      return;
    }

    setDeleting(true);
    try {
      await printService.deletePrint(print);
      router.push('/prints');
    } catch (error) {
      console.error('Delete error:', error);
      alert('削除に失敗しました。もう一度お試しください。');
    } finally {
      setDeleting(false);
    }
  };

  const canEdit = userProfile?.role === 'teacher' && userProfile?.id === print?.uploadedBy;

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

  if (!print) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">プリントが見つかりません</h1>
          <Link
            href="/prints"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-600 text-white rounded-lg"
          >
            プリント一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/prints"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-3xl font-bold">プリント詳細</h1>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="glass-effect rounded-2xl p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                      <Eye className="text-white" size={24} />
                    </div>
                    <span className="text-sm px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                      {print.category}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-4">{print.title}</h2>
                  
                  {print.description && (
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {print.description}
                    </p>
                  )}
                </div>

                {canEdit && (
                  <div className="flex items-center gap-2 ml-4">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="grid md:grid-cols-2 gap-4 mb-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={16} className="text-gray-500" />
                  <span>
                    {formatDistanceToNow(print.createdAt, {
                      addSuffix: true,
                      locale: ja,
                    })}
                  </span>
                </div>
                {uploader && (
                  <div className="flex items-center gap-2 text-sm">
                    <User size={16} className="text-gray-500" />
                    <span>アップロード者: {uploader.name}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setShowPDFViewer(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Eye size={20} />
                  プレビュー
                </button>
                <button
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-400 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <Download size={20} />
                  ダウンロード
                </button>
              </div>

              {/* PDF Embed */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">プレビュー</h3>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <iframe
                    src={print.fileUrl}
                    className="w-full h-96"
                    title={print.title}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* PDF Viewer Modal */}
      <AnimatePresence>
        {showPDFViewer && (
          <PDFViewer
            fileUrl={print.fileUrl}
            fileName={print.title}
            onClose={() => setShowPDFViewer(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}