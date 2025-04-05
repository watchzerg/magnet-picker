import { MagnetRule, RuleType } from '../types/rule';

// 默认规则配置
export const DEFAULT_RULES: MagnetRule[] = [
  {
    id: 'default-extension-3',
    type: RuleType.FILE_EXTENSION,
    enabled: true,
    order: 0,
    config: {
      type: RuleType.FILE_EXTENSION,
      extensions: ['iso', 'zip', 'rar', '7z'],
      scoreMultiplier: 0,
      stopOnMatch: true
    }
  },
  {
    id: 'default-keywords-1',
    type: RuleType.FILENAME_CONTAINS,
    enabled: true,
    order: 1,
    config: {
      type: RuleType.FILENAME_CONTAINS,
      keywords: ['[HD]', '中文', '字幕'],
      scoreMultiplier: 1.2,
      stopOnMatch: false
    }
  },
  {
    id: 'default-keywords-2',
    type: RuleType.FILENAME_CONTAINS,
    enabled: true,
    order: 2,
    config: {
      type: RuleType.FILENAME_CONTAINS,
      keywords: ['uncensored'],
      scoreMultiplier: 0.8,
      stopOnMatch: false
    }
  },
  {
    id: 'default-suffix-1',
    type: RuleType.FILENAME_SUFFIX,
    enabled: true,
    order: 3,
    config: {
      type: RuleType.FILENAME_SUFFIX,
      suffixes: ['-cn', '-ch', '-c'],
      scoreMultiplier: 1.2,
      stopOnMatch: false
    }
  },
  {
    id: 'default-extension-1',
    type: RuleType.FILE_EXTENSION,
    enabled: true,
    order: 4,
    config: {
      type: RuleType.FILE_EXTENSION,
      extensions: ['mp4', 'mkv'],
      scoreMultiplier: 1.2,
      stopOnMatch: false
    }
  },
  {
    id: 'default-extension-2',
    type: RuleType.FILE_EXTENSION,
    enabled: true,
    order: 5,
    config: {
      type: RuleType.FILE_EXTENSION,
      extensions: ['avi', 'wmv'],
      scoreMultiplier: 0.8,
      stopOnMatch: false
    }
  },
  {
    id: 'default-date',
    type: RuleType.SHARE_DATE,
    enabled: true,
    order: 6,
    config: {
      type: RuleType.SHARE_DATE,
      condition: 'before',
      date: '2018-01-01',
      scoreMultiplier: 0.8,
      stopOnMatch: false
    }
  }
]; 