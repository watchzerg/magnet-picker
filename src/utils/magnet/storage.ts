import { MagnetInfo, MagnetStorage } from '../../types/magnet';
import { isValidMagnet } from './validation';

export const getMagnetsFromStorage = async (): Promise<MagnetInfo[]> => {
    try {
        console.log('Getting magnets from storage...');
        const result = await chrome.storage.local.get('magnets');
        console.log('Full storage result:', result);

        // 如果数据是以哈希为键的对象
        if (result.magnets && typeof result.magnets === 'object') {
            console.log('Found object of magnets:', result.magnets);
            const magnets = Object.values(result.magnets as MagnetStorage);
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

        // 如果是旧的数组格式，转换为新格式
        if (Array.isArray(result.magnets)) {
            console.log('Found array of magnets, converting to object format:', result.magnets);
            const magnetObject = result.magnets.reduce((acc, magnet) => {
                if (isValidMagnet(magnet)) {
                    acc[magnet.hash] = magnet;
                }
                return acc;
            }, {} as MagnetStorage);
            
            // 保存转换后的格式
            await chrome.storage.local.set({ magnets: magnetObject });
            
            return Object.values(magnetObject);
        }

        console.log('No valid magnets found in storage');
        return [];
    } catch (error) {
        console.error('Error getting magnets from storage:', error);
        return [];
    }
}; 