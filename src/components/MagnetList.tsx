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
        typeof magnet.fileSize === 'string' &&
        typeof magnet.date === 'string' &&
        typeof magnet.url === 'string'
    );
};

export const MagnetList: React.FC<MagnetListProps> = ({
    magnets = [],
    currentPage = 1,
    itemsPerPage = 30,
    onPageChange,
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

    return (
        <div>
            <div className="magnet-list">
                {currentMagnets.map((magnet) => (
                    <div key={magnet.hash} className="magnet-item">
                        <div className="magnet-item-header">
                            <div className="magnet-item-title">
                                {magnet.fileName || '未知文件名'}
                            </div>
                            <div className="magnet-item-hash">
                                哈希值: {(magnet.hash || '').slice(0, 6)}...
                            </div>
                        </div>
                        <div className="magnet-item-details">
                            <span>大小: {formatFileSize(magnet.fileSize || '0')}</span>
                            <span>日期: {magnet.date || '未知'}</span>
                        </div>
                        <a
                            href={magnet.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-block text-blue-500 hover:text-blue-700"
                        >
                            复制磁力链接
                        </a>
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