import { MagnetInfo } from '../../types/magnet';
import { isValidMagnet } from './validator';

export const getMagnetsFromStorage = async (): Promise<MagnetInfo[]> => {
    try {
        console.log('Getting magnets from storage...');
        const result = await chrome.storage.local.get(null); // 获取所有存储的数据
        console.log('Full storage result:', result);

        // 如果数据是直接存储的数组
        if (Array.isArray(result.magnets)) {
            console.log('Found array of magnets:', result.magnets);
            console.log('First magnet before validation:', result.magnets[0]);
            const validMagnets = result.magnets.filter(magnet => {
                const isValid = isValidMagnet(magnet);
                if (!isValid) {
                    console.warn('Invalid magnet:', magnet);
                }
                return isValid;
            });
            console.log('Valid magnets from array:', validMagnets);
            console.log('First valid magnet:', validMagnets[0]);
            return validMagnets;
        }

        // 如果数据是以哈希为键的对象
        if (result.magnets && typeof result.magnets === 'object') {
            console.log('Found object of magnets:', result.magnets);
            const magnets = Object.values(result.magnets);
            console.log('First magnet before validation:', magnets[0]);
            const validMagnets = magnets.filter(magnet => {
                const isValid = isValidMagnet(magnet);
                if (!isValid) {
                    console.warn('Invalid magnet:', magnet);
                }
                return isValid;
            });
            console.log('Valid magnets from object:', validMagnets);
            console.log('First valid magnet:', validMagnets[0]);
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