import { MagnetInfo } from '../../types/magnet';
import { MagnetRule, RuleType } from '../../types/rule';
import { 
    checkFilenameContains, 
    checkFilenameSuffix, 
    checkFileExtension,
    checkFilenameRegex
} from './filename';
import { checkShareDate } from './date';
import { formatFileSize } from '../../components/rule/utils/rule-utils';

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
  matchedRules: Map<number, string>; // 规则序号 -> 匹配细节
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

  console.log(`[得分计算] 开始计算磁力链接得分 - 总数: ${magnets.length}, 启用规则数: ${enabledRules.length}`);

  return magnets.map(magnet => {
    console.log(`\n[得分计算] 处理磁力链接 - 文件名: ${magnet.fileName}, 大小: ${formatFileSize(magnet.fileSize)}`);
    
    // 初始评分系数为 1.0 score/byte
    let scoreMultiplier = 1.0;
    let shouldStop = false;
    const matchedRules = new Map<number, string>();

    // 依次应用所有规则
    for (const rule of enabledRules) {
      if (shouldStop) {
        console.log(`[得分计算] 由于上一个规则设置了stopOnMatch，停止后续规则匹配`);
        break;
      }

      console.log(`\n[得分计算] 应用规则 #${rule.order} - 类型: ${rule.type}`);

      const config = rule.config;
      let matches = false;
      let matchDetail = '';

      // 根据规则类型进行匹配
      switch (config.type) {
        case RuleType.FILE_SIZE: {
          matches = config.condition === 'greater' 
            ? magnet.fileSize > config.threshold
            : magnet.fileSize < config.threshold;
          if (matches) {
            const condition = config.condition === 'greater' ? '>' : '<';
            matchDetail = `体积[${formatFileSize(magnet.fileSize)}${condition}${formatFileSize(config.threshold)}]=>${config.scoreMultiplier * 100}%`;
          }
          console.log(`[得分计算] 文件大小规则 - 条件: ${config.condition}, 阈值: ${formatFileSize(config.threshold)}, 匹配结果: ${matches}`);
          break;
        }
        case RuleType.FILENAME_CONTAINS: {
          const result = checkFilenameContains(magnet.fileName, config.keywords);
          matches = result.matched;
          if (matches) {
            matchDetail = `关键字[${result.matchedKeyword}]=>${config.scoreMultiplier * 100}%`;
          }
          break;
        }
        case RuleType.FILENAME_SUFFIX: {
          const result = checkFilenameSuffix(magnet.fileName, config.suffixes);
          matches = result.matched;
          if (matches) {
            matchDetail = `后缀[${result.matchedSuffix}]=>${config.scoreMultiplier * 100}%`;
          }
          break;
        }
        case RuleType.FILE_EXTENSION: {
          const result = checkFileExtension(magnet.fileName, config.extensions);
          matches = result.matched;
          if (matches) {
            matchDetail = `扩展名[${result.matchedExtension}]=>${config.scoreMultiplier * 100}%`;
          }
          break;
        }
        case RuleType.FILENAME_REGEX: {
          const regexMatches = checkFilenameRegex(config.pattern, magnet.fileName);
          matches = regexMatches.matched;
          if (matches) {
            matchDetail = `正则[${config.pattern}]=>${(config.scoreMultiplier * 100).toFixed(0)}%`;
          }
          break;
        }
        case RuleType.SHARE_DATE: {
          matches = checkShareDate(magnet.date, config);
          console.log(`[得分计算] 分享日期规则 - 条件: ${config.condition}, 日期: ${config.date}, 匹配结果: ${matches}`);
          break;
        }
      }

      // 如果匹配成功，应用得分系数并记录匹配细节
      if (matches) {
        const oldScoreMultiplier = scoreMultiplier;
        scoreMultiplier *= config.scoreMultiplier;
        console.log(`[得分计算] 规则匹配成功 - 得分系数: ${oldScoreMultiplier} * ${config.scoreMultiplier} = ${scoreMultiplier}`);
        if (matchDetail) {
          matchedRules.set(rule.order, matchDetail);
          console.log(`[得分计算] 记录匹配细节: ${matchDetail}`);
        }
        shouldStop = config.stopOnMatch;
        if (shouldStop) {
          console.log(`[得分计算] 规则设置了stopOnMatch，将在下一轮停止匹配`);
        }
      } else {
        console.log(`[得分计算] 规则匹配失败 - 保持当前得分系数: ${scoreMultiplier}`);
      }
    }

    // 计算最终得分
    const defaultScore = magnet.fileSize;
    const finalScore = defaultScore * scoreMultiplier;
    console.log(`[得分计算] 计算最终得分 - 基础得分(文件大小): ${formatFileSize(defaultScore)}, 得分系数: ${scoreMultiplier}, 最终得分: ${formatFileSize(finalScore)}`);

    return { magnet, defaultScore, finalScore, matchedRules };
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
  
  console.log(`[磁力选择] 开始选择磁力链接 - 总数: ${magnets.length}, 目标数量: ${settings.targetCount}`);
  console.log(`[磁力选择] 阈值设置 - 必选: ${formatFileSize(settings.requiredThreshold)}, 优选: ${formatFileSize(settings.preferredThreshold)}`);
  
  const scoredMagnets = await calculateMagnetScores(magnets);
  
  // 按最终评分从大到小排序
  const sortedByScore = [...scoredMagnets].sort((a, b) => b.finalScore - a.finalScore);
  
  // 第一级筛选：最终评分 > 必选阈值
  const firstLevelMagnets = sortedByScore
    .filter(item => item.finalScore > settings.requiredThreshold)
    .map(item => item.magnet);
  
  console.log(`[磁力选择] 第一级筛选(必选阈值) - 通过数量: ${firstLevelMagnets.length}`);
  
  if (firstLevelMagnets.length >= settings.targetCount) {
    console.log(`[磁力选择] 第一级筛选已满足目标数量，返回结果`);
    return firstLevelMagnets.slice(0, settings.targetCount);
  }
  
  // 第二级筛选：最终评分 > 优选阈值
  const remainingMagnets = sortedByScore
    .filter(item => item.finalScore <= settings.requiredThreshold)
    .sort((a, b) => b.magnet.fileSize - a.magnet.fileSize);
  
  const secondLevelMagnets = remainingMagnets
    .filter(item => item.finalScore > settings.preferredThreshold)
    .map(item => item.magnet);
  
  console.log(`[磁力选择] 第二级筛选(优选阈值) - 通过数量: ${secondLevelMagnets.length}`);
  
  const combinedSecondLevel = [...firstLevelMagnets, ...secondLevelMagnets];
  
  if (combinedSecondLevel.length >= settings.targetCount) {
    console.log(`[磁力选择] 第二级筛选已满足目标数量，返回结果`);
    return combinedSecondLevel.slice(0, settings.targetCount);
  }
  
  // 第三级筛选：剩余磁力链接按体积排序
  const finalRemainingMagnets = remainingMagnets
    .filter(item => item.finalScore <= settings.preferredThreshold)
    .map(item => item.magnet);
  
  console.log(`[磁力选择] 第三级筛选(剩余按体积) - 可用数量: ${finalRemainingMagnets.length}`);
  const finalResult = [...combinedSecondLevel, ...finalRemainingMagnets].slice(0, settings.targetCount);
  console.log(`[磁力选择] 最终选择完成 - 结果数量: ${finalResult.length}`);
  
  return finalResult;
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