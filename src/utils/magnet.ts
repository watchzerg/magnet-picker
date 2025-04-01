import { MagnetInfo } from '../types/magnet';

const isValidMagnet = (magnet: any): magnet is MagnetInfo => {
    if (!magnet || typeof magnet !== 'object') {
        console.warn('Invalid magnet format:', magnet);
        return false;
    }

    // 检查必需字段
    const requiredFields = ['url'];
    const missingFields = requiredFields.filter(field => !magnet[field]);
    if (missingFields.length > 0) {
        console.warn(`Missing required fields: ${missingFields.join(', ')}`, magnet);
        return false;
    }

    // 尝试从 URL 中提取哈希值
    if (!magnet.hash && magnet.url) {
        magnet.hash = extractHashFromMagnet(magnet.url);
    }

    // 设置默认值
    magnet.fileName = magnet.fileName || '未知文件名';
    magnet.fileSize = magnet.fileSize || '0';
    magnet.date = magnet.date || new Date().toISOString().split('T')[0];

    return true;
};

export const extractHashFromMagnet = (magnetUrl: string): string => {
    const match = magnetUrl.match(/btih:([a-fA-F0-9]{40})/);
    return match ? match[1].toUpperCase() : '';
};

export const formatFileSize = (size: string): string => {
    try {
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let value = parseFloat(size);
        if (isNaN(value)) {
            console.warn('Invalid file size:', size);
            return '未知大小';
        }
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
    return [...magnets].sort((a, b) => {
        try {
            const sizeA = parseFloat(a.fileSize.replace(/[^0-9.]/g, ''));
            const sizeB = parseFloat(b.fileSize.replace(/[^0-9.]/g, ''));
            if (isNaN(sizeA) || isNaN(sizeB)) {
                return 0;
            }
            return sizeB - sizeA;
        } catch (error) {
            console.error('Error comparing magnet sizes:', error);
            return 0;
        }
    });
};

export const getMagnetsFromStorage = async (): Promise<MagnetInfo[]> => {
    try {
        console.log('Getting magnets from storage...');
        const result = await chrome.storage.local.get(null); // 获取所有存储的数据
        console.log('Full storage result:', result);

        // 如果数据是直接存储的数组
        if (Array.isArray(result.magnets)) {
            console.log('Found array of magnets:', result.magnets);
            const validMagnets = result.magnets.filter(isValidMagnet);
            console.log('Valid magnets from array:', validMagnets);
            return validMagnets;
        }

        // 如果数据是以哈希为键的对象
        if (result.magnets && typeof result.magnets === 'object') {
            console.log('Found object of magnets:', result.magnets);
            const magnets = Object.values(result.magnets);
            const validMagnets = magnets.filter(isValidMagnet);
            console.log('Valid magnets from object:', validMagnets);
            return validMagnets;
        }

        // 遍历所有存储的键，查找可能的磁力链接数据
        const allMagnets: MagnetInfo[] = [];
        for (const key in result) {
            const value = result[key];
            if (Array.isArray(value)) {
                console.log(`Found array in key "${key}":`, value);
                const validMagnets = value.filter(isValidMagnet);
                console.log(`Valid magnets from key "${key}":`, validMagnets);
                allMagnets.push(...validMagnets);
            } else if (typeof value === 'object' && value !== null) {
                console.log(`Found object in key "${key}":`, value);
                if (isValidMagnet(value)) {
                    allMagnets.push(value);
                } else if ('data' in value && Array.isArray(value.data)) {
                    // 处理 {type: 'SAVE_MAGNETS', data: Array(n)} 格式
                    console.log(`Found data array in key "${key}":`, value.data);
                    const validMagnets = value.data.filter(isValidMagnet);
                    console.log(`Valid magnets from key "${key}" data:`, validMagnets);
                    allMagnets.push(...validMagnets);
                }
            }
        }

        console.log('All found magnets:', allMagnets);
        return allMagnets;
    } catch (error) {
        console.error('Error getting magnets from storage:', error);
        return [];
    }
}; 