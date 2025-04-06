import React from 'react';

interface MagnetListHeaderProps {
    onExportMagnets: () => void;
    onExportAll: () => void;
    onClearAll: () => void;
}

export const MagnetListHeader: React.FC<MagnetListHeaderProps> = ({
    onExportMagnets,
    onExportAll,
    onClearAll
}) => {
    return (
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">磁力链接列表</h2>
            <div className="flex items-center gap-4">
                <button
                    onClick={onExportMagnets}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                    导出Magnet链接
                </button>
                <button
                    onClick={onExportAll}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    导出所有信息
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
    );
}; 