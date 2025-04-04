import React from 'react';
import { MagnetInfo } from '../../../types/magnet';
import { formatFileSize } from '../../../utils/magnet';

interface MagnetListItemProps {
    magnet: MagnetInfo;
    onDelete: (hash: string) => void;
}

export const MagnetListItem: React.FC<MagnetListItemProps> = ({
    magnet,
    onDelete
}) => {
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

    return (
        <div className="magnet-item bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow">
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
                            <span className="font-mono text-gray-500" title={magnet.magnet_hash || ''}>
                                Hash: {(magnet.magnet_hash || '').slice(0, 12)}...
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <a
                                href={magnet.magnet_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                            >
                                复制链接
                            </a>
                            <button
                                onClick={() => onDelete(magnet.magnet_hash)}
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                            >
                                删除
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 