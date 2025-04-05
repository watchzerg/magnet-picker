import { MagnetRule, RuleType } from '../../types/rule';
import { MagnetInfo } from '../../types/magnet';
import { 
  FileSizeRuleConfig,
  FilenameContainsRuleConfig,
  FilenameSuffixRuleConfig,
  FileExtensionRuleConfig,
  FilenameRegexRuleConfig,
  ShareDateRuleConfig
} from '../../types/rule';
import { formatFileSize } from './size';

export const isRuleMatched = (rule: MagnetRule, magnet: MagnetInfo): boolean => {
  switch (rule.type) {
    case RuleType.FILE_SIZE:
      return isFileSizeMatched(rule.config as FileSizeRuleConfig, magnet);
    case RuleType.FILENAME_CONTAINS:
      return isFilenameContainsMatched(rule.config as FilenameContainsRuleConfig, magnet);
    case RuleType.FILENAME_SUFFIX:
      return isFilenameSuffixMatched(rule.config as FilenameSuffixRuleConfig, magnet);
    case RuleType.FILE_EXTENSION:
      return isFileExtensionMatched(rule.config as FileExtensionRuleConfig, magnet);
    case RuleType.FILENAME_REGEX:
      return isFilenameRegexMatched(rule.config as FilenameRegexRuleConfig, magnet);
    case RuleType.SHARE_DATE:
      return isShareDateMatched(rule.config as ShareDateRuleConfig, magnet);
    default:
      return false;
  }
};

export const generateRuleDetail = (rule: MagnetRule, magnet: MagnetInfo): string => {
  switch (rule.type) {
    case RuleType.FILE_SIZE: {
      const config = rule.config as FileSizeRuleConfig;
      const condition = config.condition === 'greater' ? '大于' : '小于';
      const scoreChange = Number(((config.scoreMultiplier - 1) * 100).toFixed(0));
      const scoreText = `<span class="score-${scoreChange > 0 ? 'positive' : scoreChange < 0 ? 'negative' : 'neutral'}">${scoreChange > 0 ? '+' : ''}${scoreChange}%</span>`;
      return `文件体积${condition} <span class="match-value">${formatFileSize(config.threshold)}</span>
评分修正：${scoreText}${config.stopOnMatch ? '\n⚡ 匹配后中止后续规则' : ''}`;
    }
    case RuleType.FILENAME_CONTAINS: {
      const config = rule.config as FilenameContainsRuleConfig;
      const matchedKeyword = config.keywords.find((keyword: string) => 
        magnet.fileName.toLowerCase().includes(keyword.toLowerCase())
      );
      if (matchedKeyword) {
        const scoreChange = Number(((config.scoreMultiplier - 1) * 100).toFixed(0));
        const scoreText = `<span class="score-${scoreChange > 0 ? 'positive' : scoreChange < 0 ? 'negative' : 'neutral'}">${scoreChange > 0 ? '+' : ''}${scoreChange}%</span>`;
        return `文件名包含关键字：<span class="match-value">${matchedKeyword}</span>
评分修正：${scoreText}${config.stopOnMatch ? '\n⚡ 匹配后中止后续规则' : ''}`;
      }
      return '';
    }
    case RuleType.FILENAME_SUFFIX: {
      const config = rule.config as FilenameSuffixRuleConfig;
      const matchedSuffix = config.suffixes.find((suffix: string) => 
        magnet.fileName.toLowerCase().endsWith(suffix.toLowerCase())
      );
      if (matchedSuffix) {
        const scoreChange = Number(((config.scoreMultiplier - 1) * 100).toFixed(0));
        const scoreText = `<span class="score-${scoreChange > 0 ? 'positive' : scoreChange < 0 ? 'negative' : 'neutral'}">${scoreChange > 0 ? '+' : ''}${scoreChange}%</span>`;
        return `文件名以后缀结尾：<span class="match-value">${matchedSuffix}</span>
评分修正：${scoreText}${config.stopOnMatch ? '\n⚡ 匹配后中止后续规则' : ''}`;
      }
      return '';
    }
    case RuleType.FILE_EXTENSION: {
      const config = rule.config as FileExtensionRuleConfig;
      const fileExt = magnet.fileName.split('.').pop()?.toLowerCase() || '';
      const matchedExtension = config.extensions.find((ext: string) => 
        ext.toLowerCase() === fileExt
      );
      if (matchedExtension) {
        const scoreChange = Number(((config.scoreMultiplier - 1) * 100).toFixed(0));
        const scoreText = `<span class="score-${scoreChange > 0 ? 'positive' : scoreChange < 0 ? 'negative' : 'neutral'}">${scoreChange > 0 ? '+' : ''}${scoreChange}%</span>`;
        return `文件扩展名：<span class="match-value">${matchedExtension}</span>
评分修正：${scoreText}${config.stopOnMatch ? '\n⚡ 匹配后中止后续规则' : ''}`;
      }
      return '';
    }
    case RuleType.FILENAME_REGEX: {
      const config = rule.config as FilenameRegexRuleConfig;
      try {
        const regex = new RegExp(config.pattern);
        if (regex.test(magnet.fileName)) {
          const scoreChange = Number(((config.scoreMultiplier - 1) * 100).toFixed(0));
          const scoreText = `<span class="score-${scoreChange > 0 ? 'positive' : scoreChange < 0 ? 'negative' : 'neutral'}">${scoreChange > 0 ? '+' : ''}${scoreChange}%</span>`;
          return `文件名匹配正则：<span class="match-value">${config.pattern}</span>
评分修正：${scoreText}${config.stopOnMatch ? '\n⚡ 匹配后中止后续规则' : ''}`;
        }
      } catch {
        // 忽略无效的正则表达式
      }
      return '';
    }
    case RuleType.SHARE_DATE: {
      const config = rule.config as ShareDateRuleConfig;
      const condition = config.condition === 'after' ? '晚于' : 
                       config.condition === 'before' ? '早于' : '等于';
      const scoreChange = Number(((config.scoreMultiplier - 1) * 100).toFixed(0));
      const scoreText = `<span class="score-${scoreChange > 0 ? 'positive' : scoreChange < 0 ? 'negative' : 'neutral'}">${scoreChange > 0 ? '+' : ''}${scoreChange}%</span>`;
      return `分享日期${condition} <span class="match-value">${config.date}</span>
评分修正：${scoreText}${config.stopOnMatch ? '\n⚡ 匹配后中止后续规则' : ''}`;
    }
    default:
      return '';
  }
};

// 辅助函数
const isFileSizeMatched = (config: FileSizeRuleConfig, magnet: MagnetInfo): boolean => {
  const fileSize = magnet.fileSize;
  if (config.condition === 'greater') {
    return fileSize > config.threshold;
  } else {
    return fileSize < config.threshold;
  }
};

const isFilenameContainsMatched = (config: FilenameContainsRuleConfig, magnet: MagnetInfo): boolean => {
  return config.keywords.some((keyword: string) => 
    magnet.fileName.toLowerCase().includes(keyword.toLowerCase())
  );
};

const isFilenameSuffixMatched = (config: FilenameSuffixRuleConfig, magnet: MagnetInfo): boolean => {
  return config.suffixes.some((suffix: string) => 
    magnet.fileName.toLowerCase().endsWith(suffix.toLowerCase())
  );
};

const isFileExtensionMatched = (config: FileExtensionRuleConfig, magnet: MagnetInfo): boolean => {
  const fileExt = magnet.fileName.split('.').pop()?.toLowerCase() || '';
  return config.extensions.some((ext: string) => 
    ext.toLowerCase() === fileExt
  );
};

const isFilenameRegexMatched = (config: FilenameRegexRuleConfig, magnet: MagnetInfo): boolean => {
  try {
    const regex = new RegExp(config.pattern);
    return regex.test(magnet.fileName);
  } catch {
    return false;
  }
};

const isShareDateMatched = (config: ShareDateRuleConfig, magnet: MagnetInfo): boolean => {
  const shareDate = new Date(magnet.date);
  const targetDate = new Date(config.date);
  
  switch (config.condition) {
    case 'after':
      return shareDate > targetDate;
    case 'before':
      return shareDate < targetDate;
    case 'equal':
      return shareDate.getTime() === targetDate.getTime();
    default:
      return false;
  }
}; 