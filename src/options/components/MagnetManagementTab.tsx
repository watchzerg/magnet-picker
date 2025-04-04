import React, { useState } from 'react';
import { MagnetList } from '../../components/magnet/MagnetList';
import { useMagnets } from '../hooks/useMagnets';

const ITEMS_PER_PAGE = 20;

export const MagnetManagementTab: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const { magnets, loading, autoRefresh, setAutoRefresh } = useMagnets();

    if (loading) {
        return (
            <div className="text-center py-8">加载中...</div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">磁力链接管理</h2>
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            className="form-checkbox h-5 w-5 text-blue-600"
                        />
                        <span>自动刷新</span>
                    </label>
                </div>
            </div>
            <MagnetList
                magnets={magnets}
                currentPage={currentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
                onDeleteMagnet={async (hash) => {
                    try {
                        const updatedMagnets = magnets.filter(m => m.magnet_hash !== hash);
                        await chrome.storage.local.set({ magnets: updatedMagnets });
                    } catch (error) {
                        console.error('删除磁力链接失败:', error);
                    }
                }}
                onClearAll={async () => {
                    try {
                        await chrome.storage.local.set({ magnets: [] });
                    } catch (error) {
                        console.error('清空磁力链接失败:', error);
                    }
                }}
            />
        </div>
    );
}; 