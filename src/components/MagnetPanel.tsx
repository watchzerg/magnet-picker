import React from 'react';
import { MagnetInfo } from '../types/magnet';

interface MagnetPanelProps {
  magnets: MagnetInfo[];
  onClose: () => void;
}

export const MagnetPanel: React.FC<MagnetPanelProps> = ({ magnets, onClose }) => {
  console.log('MagnetPanel: 渲染面板，磁力链接数量:', magnets.length);
  
  // 按文件大小排序（从大到小）
  const sortedMagnets = [...magnets].sort((a, b) => {
    const sizeA = parseFloat(a.fileSize.replace(/[^0-9.]/g, ''));
    const sizeB = parseFloat(b.fileSize.replace(/[^0-9.]/g, ''));
    return sizeB - sizeA;
  });

  console.log('MagnetPanel: 排序后的磁力链接:', sortedMagnets);

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full"
      onClick={(e) => {
        e.stopPropagation();
        console.log('MagnetPanel: 点击面板内部');
      }}
    >
      <div className="flex justify-between items-center mb-2 border-b border-gray-200 dark:border-gray-700 pb-2">
        <h3 className="text-base font-medium text-gray-900 dark:text-white">
          磁力链接 ({magnets.length})
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            console.log('MagnetPanel: 点击关闭按钮');
            onClose();
          }}
          className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
        {sortedMagnets.map((magnet) => (
          <div 
            key={magnet.hash}
            className="p-2 rounded bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-sm"
          >
            <div className="flex justify-between items-center gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {magnet.fileName}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{magnet.fileSize}</span>
                  <span>•</span>
                  <span>Hash: {magnet.hash.slice(0, 6)}</span>
                </div>
              </div>
              <a
                href={magnet.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  console.log('MagnetPanel: 点击下载链接:', magnet.fileName);
                }}
                className="shrink-0 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-xs font-medium"
                title="下载"
              >
                下载
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 