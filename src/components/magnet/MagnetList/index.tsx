import React, { useState } from 'react';
import { MagnetListProps, MagnetInfo } from '../../../types/magnet';
import { Pagination } from '../../Pagination';
import { MagnetListItem } from './MagnetListItem';
import { handleExportMagnets } from './MagnetListActions';

const isValidMagnet = (magnet: any): magnet is MagnetInfo => {
    return (
        magnet &&
        typeof magnet === 'object' &&
        typeof magnet.magnet_hash === 'string' &&
        typeof magnet.magnet_link === 'string'
    );
};

export const MagnetList: React.FC<MagnetListProps> = ({
    magnets,
    currentPage,
    itemsPerPage,
    onPageChange,
    onDeleteMagnet,
    onClearAll
}) => {
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    if (!Array.isArray(magnets)) {
        console.error('MagnetList received non-array magnets:', magnets);
        return <div className="text-red-500">数据加载错误</div>;
    }

    // 过滤掉无效的磁力链接数据
    const validMagnets = magnets.filter(isValidMagnet);
    console.log('Valid magnets:', validMagnets);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentMagnets = validMagnets.slice(startIndex, endIndex);
    const totalPages = Math.ceil(validMagnets.length / itemsPerPage);

    const handleClearClick = () => {
        setShowConfirmDialog(true);
    };

    const handleConfirmClear = () => {
        onClearAll();
        setShowConfirmDialog(false);
    };

    const handleCancelClear = () => {
        setShowConfirmDialog(false);
    };

    if (validMagnets.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                暂无保存的磁力链接
            </div>
        );
    }

    return (
        <div className="magnet-list">
            <div className="magnet-list-header">
                <h3>已保存的磁力链接 ({validMagnets.length})</h3>
                <div className="magnet-list-actions">
                    <button onClick={() => handleExportMagnets(validMagnets)}>导出</button>
                    <button onClick={handleClearClick}>清空</button>
                </div>
            </div>
            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                        <h4 className="text-lg font-medium mb-4">确认清空</h4>
                        <p className="text-gray-600 mb-6">确定要清空所有已保存的磁力链接吗？此操作无法撤销。</p>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={handleCancelClear}
                                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleConfirmClear}
                                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                            >
                                确认清空
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="magnet-list-content">
                {currentMagnets.map((magnet) => (
                    <MagnetListItem
                        key={magnet.magnet_hash}
                        magnet={magnet}
                        onDelete={onDeleteMagnet}
                    />
                ))}
            </div>
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                />
            )}
        </div>
    );
}; 