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
    
    // 处理 fileSize
    if (typeof magnet.fileSize === 'string') {
        // 如果是字符串，尝试解析
        magnet.fileSize = parseFileSize(magnet.fileSize);
    } else if (typeof magnet.fileSize !== 'number') {
        // 如果既不是字符串也不是数字，设为0
        magnet.fileSize = 0;
    }
    
    magnet.date = magnet.date || new Date().toISOString().split('T')[0];

    return true;
};

export const extractHashFromMagnet = (magnetUrl: string): string => {
    const match = magnetUrl.match(/btih:([a-fA-F0-9]{40})/);
    return match ? match[1].toUpperCase() : '';
};

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

// 评分相关的常量
const SCORE_THRESHOLD_10GB = 10 * 1024 * 1024 * 1024;
const SCORE_THRESHOLD_5GB = 5 * 1024 * 1024 * 1024;
const MIN_MAGNETS_FIRST = 3;
const MIN_MAGNETS_SECOND = 5;
const MIN_MAGNETS_FINAL = 3;

interface MagnetScore {
  magnet: MagnetInfo;
  defaultScore: number;
  finalScore: number;
}

export const calculateMagnetScores = (magnets: MagnetInfo[]): MagnetScore[] => {
  console.log('开始计算磁力链接评分...');
  return magnets.map(magnet => {
    const defaultScore = magnet.fileSize;
    const finalScore = defaultScore * 1.0; // 目前只有一个基础修正规则
    console.log(`磁力链接 ${magnet.fileName} 评分:`, {
      defaultScore: formatFileSize(defaultScore),
      finalScore: formatFileSize(finalScore)
    });
    return { magnet, defaultScore, finalScore };
  });
};

export const selectMagnetsByScore = (magnets: MagnetInfo[]): MagnetInfo[] => {
  console.log('开始选择磁力链接...');
  const scoredMagnets = calculateMagnetScores(magnets);
  
  // 按最终评分从大到小排序
  const sortedByScore = [...scoredMagnets].sort((a, b) => b.finalScore - a.finalScore);
  
  // 第一级筛选：最终评分 > 10GB
  const firstLevelMagnets = sortedByScore
    .filter(item => item.finalScore > SCORE_THRESHOLD_10GB)
    .map(item => item.magnet);
  
  console.log(`第一级筛选结果: ${firstLevelMagnets.length} 个磁力链接`);
  
  if (firstLevelMagnets.length >= MIN_MAGNETS_FIRST) {
    console.log('第一级筛选已满足最小数量要求');
    return firstLevelMagnets;
  }
  
  // 第二级筛选：最终评分 > 5GB
  const remainingMagnets = sortedByScore
    .filter(item => item.finalScore <= SCORE_THRESHOLD_10GB)
    .sort((a, b) => b.magnet.fileSize - a.magnet.fileSize);
  
  const secondLevelMagnets = remainingMagnets
    .filter(item => item.finalScore > SCORE_THRESHOLD_5GB)
    .map(item => item.magnet);
  
  const combinedSecondLevel = [...firstLevelMagnets, ...secondLevelMagnets];
  console.log(`第二级筛选结果: ${combinedSecondLevel.length} 个磁力链接`);
  
  if (combinedSecondLevel.length >= MIN_MAGNETS_SECOND) {
    console.log('第二级筛选已满足最小数量要求');
    return combinedSecondLevel.slice(0, MIN_MAGNETS_SECOND);
  }
  
  // 第三级筛选：剩余磁力链接按体积排序
  const finalRemainingMagnets = remainingMagnets
    .filter(item => item.finalScore <= SCORE_THRESHOLD_5GB)
    .map(item => item.magnet);
  
  const finalMagnets = [...combinedSecondLevel, ...finalRemainingMagnets].slice(0, MIN_MAGNETS_FINAL);
  console.log(`最终筛选结果: ${finalMagnets.length} 个磁力链接`);
  
  return finalMagnets;
};

export const sortMagnetsByScore = (magnets: MagnetInfo[]): MagnetInfo[] => {
  if (!Array.isArray(magnets)) {
    console.warn('sortMagnetsByScore received non-array input:', magnets);
    return [];
  }
  
  const scoredMagnets = calculateMagnetScores(magnets);
  const sortedMagnets = [...magnets];
  
  // 按最终评分从大到小排序
  sortedMagnets.sort((a, b) => {
    const scoreA = scoredMagnets.find(item => item.magnet.hash === a.hash)?.finalScore || 0;
    const scoreB = scoredMagnets.find(item => item.magnet.hash === b.hash)?.finalScore || 0;
    return scoreB - scoreA;
  });
  
  return sortedMagnets;
}; 