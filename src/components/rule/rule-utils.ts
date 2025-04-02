import { RuleType, RuleConfig, FileSizeRuleConfig, FilenameContainsRuleConfig, FilenameSuffixRuleConfig, FileExtensionRuleConfig, FilenameRegexRuleConfig } from '../../types/rule';

// 获取规则类型名称
export const getRuleTypeName = (type: RuleType): string => {
    switch (type) {
        case RuleType.FILE_SIZE:
            return '文件体积规则';
        case RuleType.FILENAME_CONTAINS:
            return '文件名包含规则';
        case RuleType.FILENAME_SUFFIX:
            return '文件名后缀规则';
        case RuleType.FILE_EXTENSION:
            return '文件扩展名规则';
        case RuleType.FILENAME_REGEX:
            return '正则表达式规则';
        default:
            return '未知规则';
    }
};

// 格式化文件大小
export const formatFileSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024 * 1024 * 1024) {
        return `${(bytes / (1024 * 1024 * 1024 * 1024)).toFixed(1)}TB`;
    } else if (bytes >= 1024 * 1024 * 1024) {
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}GB`;
    } else if (bytes >= 1024 * 1024) {
        return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
    } else if (bytes >= 1024) {
        return `${(bytes / 1024).toFixed(1)}KB`;
    } else {
        return `${bytes}B`;
    }
};

// 获取规则预览文本
export const getRulePreview = (type: RuleType, config: RuleConfig): string => {
    switch (type) {
        case RuleType.FILE_SIZE: {
            const fileSizeConfig = config as FileSizeRuleConfig;
            return `${fileSizeConfig.condition === 'greater' ? '大于' : '小于'} ${formatFileSize(fileSizeConfig.threshold)}`;
        }
        case RuleType.FILENAME_CONTAINS: {
            const containsConfig = config as FilenameContainsRuleConfig;
            return containsConfig.keywords.length > 0 ? containsConfig.keywords.join(', ') : '未设置关键字';
        }
        case RuleType.FILENAME_SUFFIX: {
            const suffixConfig = config as FilenameSuffixRuleConfig;
            return suffixConfig.suffixes.length > 0 ? suffixConfig.suffixes.join(', ') : '未设置后缀';
        }
        case RuleType.FILE_EXTENSION: {
            const extensionConfig = config as FileExtensionRuleConfig;
            return extensionConfig.extensions[0] || '未设置扩展名';
        }
        case RuleType.FILENAME_REGEX: {
            const regexConfig = config as FilenameRegexRuleConfig;
            return regexConfig.pattern || '未设置正则';
        }
        default:
            return '';
    }
}; 