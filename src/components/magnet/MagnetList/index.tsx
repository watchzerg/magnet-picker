import React from 'react';
import { MagnetListProps, MagnetInfo } from '../../../types/magnet';
import { Pagination } from '../../Pagination';
import { MagnetListHeader } from './MagnetListHeader';
import { MagnetListItem } from './MagnetListItem';
import { handleExportMagnets, handleExportAll } from './MagnetListActions';

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

    return (
        <div>
            <MagnetListHeader
                onExportMagnets={() => handleExportMagnets(validMagnets)}
                onExportAll={() => handleExportAll(validMagnets)}
                onClearAll={onClearAll}
            />
            <div className="magnet-list space-y-2">
                {currentMagnets.map((magnet) => (
                    <MagnetListItem
                        key={magnet.hash}
                        magnet={magnet}
                        onDeleteMagnet={onDeleteMagnet}
                    />
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