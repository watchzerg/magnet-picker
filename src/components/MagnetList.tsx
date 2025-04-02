import React from 'react';
import { MagnetListProps, MagnetInfo } from '../types/magnet';
import { formatFileSize } from '../utils/magnet';
import { Pagination } from './Pagination';

const isValidMagnet = (magnet: any): magnet is MagnetInfo => {
    return (
        magnet &&
        typeof magnet === 'object' &&
        typeof magnet.hash === 'string' &&
        typeof magnet.fileName === 'string' &&
        typeof magnet.fileSize === 'number' &&
        typeof magnet.date === 'string' &&
        typeof magnet.url === 'string'
    );
};

export const MagnetList: React.FC<MagnetListProps> = ({
    magnets = [],
    currentPage = 1,
    itemsPerPage = 30,
    onPageChange,
    onDeleteMagnet,
    onClearAll
}) => {
    if (!Array.isArray(magnets)) {
        console.error('MagnetList received non-array magnets:', magnets);
        return <div className="text-red-500">数据加载错误</div>;
    }

    // 过滤掉无效的磁力链接数据
    const validMagnets = magnets.filter(isValidMagnet);
    console.log('Valid magnets:', validMagnets);

    const totalPages = Math.max(1, Math.ceil(validMagnets.length / itemsPerPage));
    const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
    const startIndex = (safeCurrentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentMagnets = validMagnets.slice(startIndex, endIndex);

    if (validMagnets.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                暂无保存的磁力链接
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const handleExportMagnets = () => {
        const magnetContent = validMagnets
            .map(magnet => `magnet:?xt=urn:btih:${magnet.hash}`)
            .join('\n');
        
        const blob = new Blob([magnetContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `magnets_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleExportAll = () => {
        const csvContent = [
            ['文件名', '大小', 'Magnet链接', '发布日期', '保存时间'],
            ...validMagnets.map(magnet => [
                magnet.fileName,
                formatFileSize(magnet.fileSize),
                `magnet:?xt=urn:btih:${magnet.hash}`,
                magnet.date,
                new Date().toLocaleString('zh-CN')
            ])
        ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `magnets_full_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">磁力链接列表</h2>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleExportMagnets}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                        导出Magnet
                    </button>
                    <button
                        onClick={handleExportAll}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        导出所有列
                    </button>
                    <button
                        onClick={() => {
                            if (window.confirm('确定要清空所有磁力链接吗？此操作不可恢复。')) {
                                onClearAll();
                            }
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                        清空所有
                    </button>
                </div>
            </div>
            <div className="magnet-list space-y-2">
                {currentMagnets.map((magnet) => (
                    <div key={magnet.hash} className="magnet-item bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col">
                            <div className="flex-1 min-w-0">
                                <div className="mb-1">
                                    <span className="font-medium block" title={magnet.fileName || '未知文件名'}>
                                        {(magnet.fileName || '未知文件名').slice(0, 30)}{(magnet.fileName || '').length > 30 ? '...' : ''}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span>大小: {formatFileSize(magnet.fileSize)}</span>
                                        <span>发布日期: {magnet.date || '未知'}</span>
                                        <span>保存时间: {formatDate(magnet.saveTime || new Date().toISOString())}</span>
                                        <span className="font-mono text-gray-500" title={magnet.hash || ''}>
                                            Hash: {(magnet.hash || '').slice(0, 12)}...
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={magnet.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                                        >
                                            复制链接
                                        </a>
                                        <button
                                            onClick={() => onDeleteMagnet(magnet.hash)}
                                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                                        >
                                            删除
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {validMagnets.length > itemsPerPage && (
                <Pagination
                    currentPage={safeCurrentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                />
            )}
        </div>
    );
}; 