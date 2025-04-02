import { MagnetInfo } from '../../types/magnet';

export const parseFileSize = (sizeStr: string): number => {
    try {
        // 移除所有空白字符
        sizeStr = sizeStr.trim();
        
        // 提取数字部分
        const match = sizeStr.match(/^([\d.]+)/);
        if (!match) {
            console.warn('Invalid file size format:', sizeStr);
            return 0;
        }
        
        const value = parseFloat(match[1]);
        if (isNaN(value)) {
            console.warn('Invalid file size number:', sizeStr);
            return 0;
        }

        // 提取单位部分（如果有）
        const unit = sizeStr.slice(match[0].length).trim().toUpperCase();
        
        // 根据单位转换
        switch (unit) {
            case 'K':
            case 'KB':
                return value * 1024;
            case 'M':
            case 'MB':
                return value * 1024 * 1024;
            case 'G':
            case 'GB':
                return value * 1024 * 1024 * 1024;
            case 'T':
            case 'TB':
                return value * 1024 * 1024 * 1024 * 1024;
            case 'B':
            case '':
                return value;
            default:
                console.warn('Unknown file size unit:', unit);
                return value;
        }
    } catch (error) {
        console.error('Error parsing file size:', error);
        return 0;
    }
};

export const formatFileSize = (bytes: number): string => {
    try {
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let value = bytes;
        let unitIndex = 0;

        while (value >= 1024 && unitIndex < units.length - 1) {
            value /= 1024;
            unitIndex++;
        }

        return `${value.toFixed(2)} ${units[unitIndex]}`;
    } catch (error) {
        console.error('Error formatting file size:', error);
        return '未知大小';
    }
};

export const sortMagnetsBySize = (magnets: MagnetInfo[]): MagnetInfo[] => {
    if (!Array.isArray(magnets)) {
        console.warn('sortMagnetsBySize received non-array input:', magnets);
        return [];
    }
    return [...magnets].sort((a, b) => b.fileSize - a.fileSize);
}; 