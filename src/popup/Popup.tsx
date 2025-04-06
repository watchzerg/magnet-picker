import React, { useEffect, useState } from 'react';
import { MagnetInfo } from '../types/magnet';
import { handleExportMagnets, handleExportAll } from '../components/magnet/MagnetList/MagnetListActions';

export const Popup: React.FC = () => {
  const [magnets, setMagnets] = useState<MagnetInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMagnets = async () => {
      try {
        const { magnets = {} } = await chrome.storage.local.get('magnets');
        const magnetArray = Array.isArray(magnets) ? magnets : Object.values(magnets);
        setMagnets(magnetArray);
      } catch (error) {
        console.error('加载磁力链接失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMagnets();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      {/* 标题和数量展示 */}
      <div className="mb-6 text-center">
        <h2 className="text-lg font-medium text-gray-900 mb-2">已保存的磁力链接</h2>
        <div className="flex items-center justify-center gap-1">
          <span className="text-3xl font-bold text-blue-600">{magnets.length}</span>
          <span className="text-gray-500 text-sm">个</span>
        </div>
      </div>

      {/* 按钮组 */}
      <div className="space-y-3">
        <button
          onClick={() => handleExportMagnets(magnets)}
          className="w-full px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg 
                     transition-colors duration-200 flex items-center justify-center gap-2 
                     shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          导出Magnet链接
        </button>

        <button
          onClick={() => handleExportAll(magnets)}
          className="w-full px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg 
                     transition-colors duration-200 flex items-center justify-center gap-2
                     shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          导出所有信息
        </button>
      </div>

      {/* 提示信息 */}
      {magnets.length === 0 && (
        <div className="mt-4 text-center text-gray-500 text-sm">
          还没有保存的磁力链接
        </div>
      )}
    </div>
  );
}; 