import { MagnetInfo } from '../../types/magnet';
import { MagnetRule, RuleType } from '../../types/rule';

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

interface MagnetSettings {
  requiredThreshold: number;
  preferredThreshold: number;
  targetCount: number;
}

export const calculateMagnetScores = async (magnets: MagnetInfo[]): Promise<MagnetScore[]> => {
  // 从存储中获取规则配置
  const result = await chrome.storage.local.get(['magnetRules']);
  const rules: MagnetRule[] = result.magnetRules || [];
  
  // 只获取启用的文件大小规则，并按order排序
  const fileSizeRules = rules
    .filter(rule => rule.enabled && rule.type === RuleType.FILE_SIZE)
    .sort((a, b) => a.order - b.order);

  return magnets.map(magnet => {
    // 初始评分系数为 1.0 score/byte
    let scoreMultiplier = 1.0;

    // 应用文件大小规则
    for (const rule of fileSizeRules) {
      const config = rule.config;
      if (config.type === RuleType.FILE_SIZE) {
        const matches = config.condition === 'greater' 
          ? magnet.fileSize > config.threshold
          : magnet.fileSize < config.threshold;
        
        if (matches) {
          scoreMultiplier *= config.scoreMultiplier;
        }
      }
    }

    // 计算最终得分
    const defaultScore = magnet.fileSize;
    const finalScore = defaultScore * scoreMultiplier;

    return { magnet, defaultScore, finalScore };
  });
};

export const selectMagnetsByScore = async (magnets: MagnetInfo[]): Promise<MagnetInfo[]> => {
  // 从存储中获取设置
  const result = await chrome.storage.local.get(['magnetSettings']);
  const settings: MagnetSettings = result.magnetSettings || {
    requiredThreshold: 10 * 1024 * 1024 * 1024, // 默认10G-score
    preferredThreshold: 5 * 1024 * 1024 * 1024, // 默认5G-score
    targetCount: 5 // 默认5个
  };
  
  const scoredMagnets = await calculateMagnetScores(magnets);
  
  // 按最终评分从大到小排序
  const sortedByScore = [...scoredMagnets].sort((a, b) => b.finalScore - a.finalScore);
  
  // 第一级筛选：最终评分 > 必选阈值
  const firstLevelMagnets = sortedByScore
    .filter(item => item.finalScore > settings.requiredThreshold)
    .map(item => item.magnet);
  
  if (firstLevelMagnets.length >= settings.targetCount) {
    return firstLevelMagnets.slice(0, settings.targetCount);
  }
  
  // 第二级筛选：最终评分 > 优选阈值
  const remainingMagnets = sortedByScore
    .filter(item => item.finalScore <= settings.requiredThreshold)
    .sort((a, b) => b.magnet.fileSize - a.magnet.fileSize);
  
  const secondLevelMagnets = remainingMagnets
    .filter(item => item.finalScore > settings.preferredThreshold)
    .map(item => item.magnet);
  
  const combinedSecondLevel = [...firstLevelMagnets, ...secondLevelMagnets];
  
  if (combinedSecondLevel.length >= settings.targetCount) {
    return combinedSecondLevel.slice(0, settings.targetCount);
  }
  
  // 第三级筛选：剩余磁力链接按体积排序
  const finalRemainingMagnets = remainingMagnets
    .filter(item => item.finalScore <= settings.preferredThreshold)
    .map(item => item.magnet);
  
  return [...combinedSecondLevel, ...finalRemainingMagnets].slice(0, settings.targetCount);
};

export const sortMagnetsByScore = async (magnets: MagnetInfo[]): Promise<MagnetInfo[]> => {
  if (!Array.isArray(magnets)) {
    console.warn('sortMagnetsByScore received non-array input:', magnets);
    return [];
  }
  
  const scoredMagnets = await calculateMagnetScores(magnets);
  const sortedMagnets = [...magnets];
  
  sortedMagnets.sort((a, b) => {
    const scoreA = scoredMagnets.find(s => s.magnet.magnet_hash === a.magnet_hash)?.finalScore || 0;
    const scoreB = scoredMagnets.find(s => s.magnet.magnet_hash === b.magnet_hash)?.finalScore || 0;
    return scoreB - scoreA;
  });
  
  return sortedMagnets;
}; 