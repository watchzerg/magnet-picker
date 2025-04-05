import { MagnetInfo } from '../../types/magnet';
import { MagnetRule, RuleType } from '../../types/rule';
import { 
    checkFilenameContains, 
    checkFilenameSuffix, 
    checkFileExtension 
} from './filename';
import { checkShareDate } from './date';

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
  
  // 获取所有启用的规则，并按order排序
  const enabledRules = rules
    .filter(rule => rule.enabled)
    .sort((a, b) => a.order - b.order);

  return magnets.map(magnet => {
    // 初始评分系数为 1.0 score/byte
    let scoreMultiplier = 1.0;
    let shouldStop = false;

    // 依次应用所有规则
    for (const rule of enabledRules) {
      if (shouldStop) break;

      const config = rule.config;
      let matches = false;

      // 根据规则类型进行匹配
      switch (config.type) {
        case RuleType.FILE_SIZE:
          matches = config.condition === 'greater' 
            ? magnet.fileSize > config.threshold
            : magnet.fileSize < config.threshold;
          break;
        case RuleType.FILENAME_CONTAINS:
          matches = checkFilenameContains(magnet.fileName, config.keywords);
          break;
        case RuleType.FILENAME_SUFFIX:
          matches = checkFilenameSuffix(magnet.fileName, config.suffixes);
          break;
        case RuleType.FILE_EXTENSION:
          matches = checkFileExtension(magnet.fileName, config.extensions);
          break;
        case RuleType.FILENAME_REGEX:
          try {
            const regex = new RegExp(config.pattern);
            matches = regex.test(magnet.fileName);
          } catch (e) {
            console.error('Invalid regex pattern:', config.pattern);
            matches = false;
          }
          break;
        case RuleType.SHARE_DATE:
          matches = checkShareDate(magnet.date, config);
          break;
      }

      // 如果匹配成功，应用得分系数
      if (matches) {
        scoreMultiplier *= config.scoreMultiplier;
        shouldStop = config.stopOnMatch;
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