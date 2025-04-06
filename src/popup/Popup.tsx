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
      <div className="flex items-center justify-center h-[200px]">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* 标题和数量展示 */}
      <div className="mb-4">
        <h2 className="text-base font-medium text-gray-900">已保存的磁力链接</h2>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xl font-bold text-blue-600">{magnets.length}</span>
          <span className="text-gray-500">个</span>
        </div>
      </div>

      {/* 按钮组 */}
      <div className="space-y-2">
        <button
          onClick={() => handleExportMagnets(magnets)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          导出Magnet链接
        </button>

        <button
          onClick={() => handleExportAll(magnets)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5l5 5v11a2 2 0 01-2 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          导出所有信息
        </button>
      </div>

      {/* 提示信息 */}
      {magnets.length === 0 && (
        <div className="mt-3 text-center text-gray-500 text-sm">
          还没有保存的磁力链接
        </div>
      )}
    </div>
  );
}; 