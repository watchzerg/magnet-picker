import { MagnetInfo } from '../../types/magnet';
import { formatFileSize } from './size';
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
  console.log('开始计算磁力链接评分...');

  // 从存储中获取规则配置
  const result = await chrome.storage.local.get(['magnetRules']);
  const rules: MagnetRule[] = result.magnetRules || [];
  
  // 只获取启用的文件大小规则，并按order排序
  const fileSizeRules = rules
    .filter(rule => rule.enabled && rule.type === RuleType.FILE_SIZE)
    .sort((a, b) => a.order - b.order);

  console.log('启用的文件大小规则:', fileSizeRules.length);

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
          console.log(`[规则匹配] ${magnet.fileName}: 规则 ${rule.id} 匹配成功，得分系数变为 ${scoreMultiplier}`);
        }
      }
    }

    // 计算最终得分
    const defaultScore = magnet.fileSize;
    const finalScore = defaultScore * scoreMultiplier;

    console.log(`[评分] ${magnet.fileName}:`, {
      defaultScore: `${formatFileSize(defaultScore)} (${defaultScore} Bytes)`,
      finalScore: `${formatFileSize(finalScore)} (${finalScore} score)`,
      scoreMultiplier: scoreMultiplier
    });

    return { magnet, defaultScore, finalScore };
  });
};

export const selectMagnetsByScore = async (magnets: MagnetInfo[]): Promise<MagnetInfo[]> => {
  console.log('开始选择磁力链接...');

  // 从存储中获取设置
  const result = await chrome.storage.local.get(['magnetSettings']);
  const settings: MagnetSettings = result.magnetSettings || {
    requiredThreshold: 10 * 1024 * 1024 * 1024, // 默认10G-score
    preferredThreshold: 5 * 1024 * 1024 * 1024, // 默认5G-score
    targetCount: 5 // 默认5个
  };

  console.log('[配置] 当前选择配置:', {
    必选阈值: `${formatFileSize(settings.requiredThreshold)} (${settings.requiredThreshold} score)`,
    优选阈值: `${formatFileSize(settings.preferredThreshold)} (${settings.preferredThreshold} score)`,
    目标数量: settings.targetCount
  });
  
  const scoredMagnets = await calculateMagnetScores(magnets);
  
  // 按最终评分从大到小排序
  const sortedByScore = [...scoredMagnets].sort((a, b) => b.finalScore - a.finalScore);
  
  // 第一级筛选：最终评分 > 必选阈值
  const firstLevelMagnets = sortedByScore
    .filter(item => item.finalScore > settings.requiredThreshold)
    .map(item => item.magnet);
  
  console.log(`[筛选] 第一级筛选(评分 > ${formatFileSize(settings.requiredThreshold)}):`, {
    匹配数量: firstLevelMagnets.length,
    匹配项: firstLevelMagnets.map(m => ({
      文件名: m.fileName,
      大小: formatFileSize(m.fileSize)
    }))
  });
  
  if (firstLevelMagnets.length >= settings.targetCount) {
    const selected = firstLevelMagnets.slice(0, settings.targetCount);
    console.log('[结果] 第一级筛选已满足目标数量要求，选择结果:', {
      目标数量: settings.targetCount,
      实际选择: selected.length,
      选中项: selected.map(m => ({
        文件名: m.fileName,
        大小: formatFileSize(m.fileSize)
      }))
    });
    return selected;
  }
  
  // 第二级筛选：最终评分 > 优选阈值
  const remainingMagnets = sortedByScore
    .filter(item => item.finalScore <= settings.requiredThreshold)
    .sort((a, b) => b.magnet.fileSize - a.magnet.fileSize);
  
  const secondLevelMagnets = remainingMagnets
    .filter(item => item.finalScore > settings.preferredThreshold)
    .map(item => item.magnet);
  
  const combinedSecondLevel = [...firstLevelMagnets, ...secondLevelMagnets];
  console.log(`[筛选] 第二级筛选(评分 > ${formatFileSize(settings.preferredThreshold)}):`, {
    新增数量: secondLevelMagnets.length,
    总数量: combinedSecondLevel.length,
    新增项: secondLevelMagnets.map(m => ({
      文件名: m.fileName,
      大小: formatFileSize(m.fileSize)
    }))
  });
  
  if (combinedSecondLevel.length >= settings.targetCount) {
    const selected = combinedSecondLevel.slice(0, settings.targetCount);
    console.log('[结果] 第二级筛选已满足目标数量要求，选择结果:', {
      目标数量: settings.targetCount,
      实际选择: selected.length,
      选中项: selected.map(m => ({
        文件名: m.fileName,
        大小: formatFileSize(m.fileSize)
      }))
    });
    return selected;
  }
  
  // 第三级筛选：剩余磁力链接按体积排序
  const finalRemainingMagnets = remainingMagnets
    .filter(item => item.finalScore <= settings.preferredThreshold)
    .map(item => item.magnet);
  
  const finalMagnets = [...combinedSecondLevel, ...finalRemainingMagnets].slice(0, settings.targetCount);
  console.log('[结果] 第三级筛选(所有剩余链接)，最终选择结果:', {
    目标数量: settings.targetCount,
    实际选择: finalMagnets.length,
    选中项: finalMagnets.map(m => ({
      文件名: m.fileName,
      大小: formatFileSize(m.fileSize)
    }))
  });
  
  return finalMagnets;
};

export const sortMagnetsByScore = async (magnets: MagnetInfo[]): Promise<MagnetInfo[]> => {
  if (!Array.isArray(magnets)) {
    console.warn('sortMagnetsByScore received non-array input:', magnets);
    return [];
  }
  
  const scoredMagnets = await calculateMagnetScores(magnets);
  const sortedMagnets = [...magnets];
  
  // 按最终评分从大到小排序
  sortedMagnets.sort((a, b) => {
    const scoreA = scoredMagnets.find(item => item.magnet.hash === a.hash)?.finalScore || 0;
    const scoreB = scoredMagnets.find(item => item.magnet.hash === b.hash)?.finalScore || 0;
    return scoreB - scoreA;
  });
  
  return sortedMagnets;
}; 