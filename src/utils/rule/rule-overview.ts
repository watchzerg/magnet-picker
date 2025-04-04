import { 
    MagnetRule, 
    RuleType, 
    RuleConfig,
    FileSizeRuleConfig,
    FilenameContainsRuleConfig,
    FilenameSuffixRuleConfig,
    FileExtensionRuleConfig,
    FilenameRegexRuleConfig,
    ShareDateRuleConfig
} from '../../types/rule';

export const generateRuleOverview = (rule: MagnetRule): string => {
    const { type, config } = rule;
    const scoreMultiplier = config.scoreMultiplier * 100;
    
    switch (type) {
        case RuleType.FILE_SIZE: {
            const fileSizeConfig = config as FileSizeRuleConfig;
            const condition = fileSizeConfig.condition === 'greater' ? '>' : '<';
            return `体积${condition}${formatFileSize(fileSizeConfig.threshold)}=>${scoreMultiplier}%`;
        }
            
        case RuleType.FILENAME_CONTAINS: {
            const containsConfig = config as FilenameContainsRuleConfig;
            return `关键字[${containsConfig.keywords.join('/')}]=>${scoreMultiplier}%`;
        }
            
        case RuleType.FILENAME_SUFFIX: {
            const suffixConfig = config as FilenameSuffixRuleConfig;
            return `后缀[${suffixConfig.suffixes.join('/')}]=>${scoreMultiplier}%`;
        }
            
        case RuleType.FILE_EXTENSION: {
            const extensionConfig = config as FileExtensionRuleConfig;
            return `扩展名[${extensionConfig.extensions.join('/')}]=>${scoreMultiplier}%`;
        }
            
        case RuleType.FILENAME_REGEX: {
            const regexConfig = config as FilenameRegexRuleConfig;
            return `正则[${regexConfig.pattern}]=>${scoreMultiplier}%`;
        }
            
        case RuleType.SHARE_DATE: {
            const dateConfig = config as ShareDateRuleConfig;
            const dateCondition = dateConfig.condition === 'after' ? '>' : 
                                dateConfig.condition === 'before' ? '<' : '=';
            return `日期${dateCondition}${dateConfig.date}=>${scoreMultiplier}%`;
        }
            
        default:
            return '';
    }
};

const formatFileSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024 * 1024) {
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}GB`;
    } else if (bytes >= 1024 * 1024) {
        return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
    } else if (bytes >= 1024) {
        return `${(bytes / 1024).toFixed(1)}KB`;
    } else {
        return `${bytes}B`;
    }
}; 