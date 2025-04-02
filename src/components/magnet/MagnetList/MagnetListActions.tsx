import { MagnetInfo } from '../../../types/magnet';
import { formatFileSize } from '../../../utils/magnet';

export const handleExportMagnets = (magnets: MagnetInfo[]) => {
    const magnetContent = magnets
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

export const handleExportAll = (magnets: MagnetInfo[]) => {
    const csvContent = [
        ['文件名', '大小', 'Magnet链接', '发布日期', '保存时间'],
        ...magnets.map(magnet => [
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