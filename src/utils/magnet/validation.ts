import { MagnetInfo } from '../../types/magnet';
import { extractHashFromMagnet } from './hash';
import { parseFileSize } from './size';

export const isValidMagnet = (magnet: any): magnet is MagnetInfo => {
    if (!magnet || typeof magnet !== 'object') {
        console.warn('Invalid magnet format:', magnet);
        return false;
    }

    // 检查必需字段
    const requiredFields = ['magnet_link'];
    const missingFields = requiredFields.filter(field => !magnet[field]);
    if (missingFields.length > 0) {
        console.warn(`Missing required fields: ${missingFields.join(', ')}`, magnet);
        return false;
    }

    // 尝试从 URL 中提取哈希值
    if (!magnet.magnet_hash && magnet.magnet_link) {
        magnet.magnet_hash = extractHashFromMagnet(magnet.magnet_link);
    }

    // 设置默认值
    magnet.fileName = magnet.fileName || '未知文件名';
    magnet.source_url = magnet.source_url || '';
    magnet.catalog_number = magnet.catalog_number || '';
    
    // 处理 fileSize
    if (typeof magnet.fileSize === 'string') {
        // 如果是字符串，尝试解析
        magnet.fileSize = parseFileSize(magnet.fileSize);
    } else if (typeof magnet.fileSize !== 'number') {
        // 如果既不是字符串也不是数字，设为0
        magnet.fileSize = 0;
    }
    
    magnet.date = magnet.date || new Date().toISOString().split('T')[0];

    // 处理字段重命名的兼容性
    if (magnet.url && !magnet.magnet_link) {
        magnet.magnet_link = magnet.url;
        delete magnet.url;
    }
    if (magnet.hash && !magnet.magnet_hash) {
        magnet.magnet_hash = magnet.hash;
        delete magnet.hash;
    }

    return true;
}; 