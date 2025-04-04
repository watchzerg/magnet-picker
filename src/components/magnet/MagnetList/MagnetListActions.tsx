import { MagnetInfo } from '../../../types/magnet';
import { formatFileSize } from '../../../utils/magnet';

export const handleExportMagnets = (magnets: MagnetInfo[]) => {
    const content = magnets
        .map(magnet => `magnet:?xt=urn:btih:${magnet.magnet_hash}`)
        .join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'magnets.txt';
    a.click();
    URL.revokeObjectURL(url);
};

export const handleExportAll = (magnets: MagnetInfo[]) => {
    const csvContent = [
        ['文件名', '大小', 'Magnet链接', '发布日期', '保存时间', '来源页面', '番号'],
        ...magnets.map(magnet => [
            magnet.fileName,
            formatFileSize(magnet.fileSize),
            `magnet:?xt=urn:btih:${magnet.magnet_hash}`,
            magnet.date,
            new Date().toLocaleString('zh-CN'),
            magnet.source_url,
            magnet.catalog_number
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