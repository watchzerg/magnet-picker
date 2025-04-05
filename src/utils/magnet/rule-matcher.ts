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

export const isRuleMatched = (rule: MagnetRule, magnet: MagnetInfo): boolean => {
  const { type, config } = rule;
  
  switch (type) {
    case RuleType.FILE_SIZE: {
      const fileSizeConfig = config as FileSizeRuleConfig;
      return fileSizeConfig.condition === 'greater' 
        ? magnet.fileSize > fileSizeConfig.threshold
        : magnet.fileSize < fileSizeConfig.threshold;
    }
    case RuleType.FILENAME_CONTAINS: {
      const containsConfig = config as FilenameContainsRuleConfig;
      return containsConfig.keywords.some(keyword => 
        magnet.fileName.toLowerCase().includes(keyword.toLowerCase())
      );
    }
    case RuleType.FILENAME_SUFFIX: {
      const suffixConfig = config as FilenameSuffixRuleConfig;
      return suffixConfig.suffixes.some(suffix => 
        magnet.fileName.toLowerCase().endsWith(suffix.toLowerCase())
      );
    }
    case RuleType.FILE_EXTENSION: {
      const extensionConfig = config as FileExtensionRuleConfig;
      const fileExt = magnet.fileName.split('.').pop()?.toLowerCase() || '';
      return extensionConfig.extensions.some(ext => 
        ext.toLowerCase() === fileExt
      );
    }
    case RuleType.FILENAME_REGEX: {
      const regexConfig = config as FilenameRegexRuleConfig;
      try {
        const regex = new RegExp(regexConfig.pattern);
        return regex.test(magnet.fileName);
      } catch {
        return false;
      }
    }
    case RuleType.SHARE_DATE: {
      const dateConfig = config as ShareDateRuleConfig;
      const magnetDate = new Date(magnet.date);
      const ruleDate = new Date(dateConfig.date);
      
      switch (dateConfig.condition) {
        case 'before':
          return magnetDate < ruleDate;
        case 'after':
          return magnetDate > ruleDate;
        case 'equal':
          return magnetDate.toDateString() === ruleDate.toDateString();
        default:
          return false;
      }
    }
    default:
      return false;
  }
}; 