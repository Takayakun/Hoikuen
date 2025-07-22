'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Download, X } from 'lucide-react';

interface PDFViewerProps {
  fileUrl: string;
  fileName: string;
  onClose: () => void;
}

export default function PDFViewer({ fileUrl, fileName, onClose }: PDFViewerProps) {
  const [zoom, setZoom] = useState(100);

  const handleDownload = async () => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black bg-opacity-75 flex flex-col"
    >
      {/* Header */}
      <div className="glass-effect p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold truncate">{fileName}</h2>
        
        <div className="flex items-center gap-4">
          {/* Zoom controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(Math.max(50, zoom - 25))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              disabled={zoom <= 50}
            >
              <ZoomOut size={20} />
            </button>
            <span className="text-sm font-medium w-12 text-center">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom(Math.min(200, zoom + 25))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              disabled={zoom >= 200}
            >
              <ZoomIn size={20} />
            </button>
          </div>

          {/* Download button */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Download size={16} />
            ダウンロード
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900">
        <div className="flex justify-center p-4">
          <iframe
            src={`${fileUrl}#zoom=${zoom}`}
            className="w-full max-w-4xl h-full min-h-[800px] border border-gray-300 dark:border-gray-700 rounded-lg"
            title={fileName}
          />
        </div>
      </div>
    </motion.div>
  );
}