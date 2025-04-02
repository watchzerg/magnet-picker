import { MagnetInfo } from '../../types/magnet';
import { formatFileSize } from './size';

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