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

export interface RuleOverview {
    condition: string;
    scoreMultiplier: number;
    tooltip: string;
}

export const generateRuleOverview = (rule: MagnetRule): RuleOverview => {
    const { type, config } = rule;
    const scoreMultiplier = config.scoreMultiplier * 100;
    let condition = '';
    let tooltip = '';
    
    switch (type) {
        case RuleType.FILE_SIZE: {
            const fileSizeConfig = config as FileSizeRuleConfig;
            const symbol = fileSizeConfig.condition === 'greater' ? '>' : '<';
            condition = `体积 ${symbol} ${formatFileSize(fileSizeConfig.threshold)}`;
            tooltip = `文件体积${fileSizeConfig.condition === 'greater' ? '大于' : '小于'} ${formatFileSize(fileSizeConfig.threshold)}
评分修正：${scoreMultiplier > 100 ? '+' : ''}${(scoreMultiplier - 100).toFixed(0)}%
${config.stopOnMatch ? '⚡ 匹配后中止后续规则' : ''}`;
            break;
        }
            
        case RuleType.FILENAME_CONTAINS: {
            const containsConfig = config as FilenameContainsRuleConfig;
            condition = `关键字 [${containsConfig.keywords.join(' / ')}]`;
            tooltip = `文件名包含以下关键字之一：
${containsConfig.keywords.map(k => `• ${k}`).join('\n')}
评分修正：${scoreMultiplier > 100 ? '+' : ''}${(scoreMultiplier - 100).toFixed(0)}%
${config.stopOnMatch ? '⚡ 匹配后中止后续规则' : ''}`;
            break;
        }
            
        case RuleType.FILENAME_SUFFIX: {
            const suffixConfig = config as FilenameSuffixRuleConfig;
            condition = `后缀 [${suffixConfig.suffixes.join(' / ')}]`;
            tooltip = `文件名以下列后缀之一结尾：
${suffixConfig.suffixes.map(s => `• ${s}`).join('\n')}
评分修正：${scoreMultiplier > 100 ? '+' : ''}${(scoreMultiplier - 100).toFixed(0)}%
${config.stopOnMatch ? '⚡ 匹配后中止后续规则' : ''}`;
            break;
        }
            
        case RuleType.FILE_EXTENSION: {
            const extensionConfig = config as FileExtensionRuleConfig;
            condition = `扩展名 [${extensionConfig.extensions.join(' / ')}]`;
            tooltip = `文件扩展名为以下之一：
${extensionConfig.extensions.map(e => `• ${e}`).join('\n')}
评分修正：${scoreMultiplier > 100 ? '+' : ''}${(scoreMultiplier - 100).toFixed(0)}%
${config.stopOnMatch ? '⚡ 匹配后中止后续规则' : ''}`;
            break;
        }
            
        case RuleType.FILENAME_REGEX: {
            const regexConfig = config as FilenameRegexRuleConfig;
            condition = `正则 [${regexConfig.pattern}]`;
            tooltip = `文件名匹配正则表达式：
${regexConfig.pattern}
评分修正：${scoreMultiplier > 100 ? '+' : ''}${(scoreMultiplier - 100).toFixed(0)}%
${config.stopOnMatch ? '⚡ 匹配后中止后续规则' : ''}`;
            break;
        }
            
        case RuleType.SHARE_DATE: {
            const dateConfig = config as ShareDateRuleConfig;
            const dateCondition = dateConfig.condition === 'after' ? '>' : 
                                dateConfig.condition === 'before' ? '<' : '=';
            condition = `日期 ${dateCondition} ${dateConfig.date}`;
            tooltip = `分享日期${dateConfig.condition === 'after' ? '晚于' : dateConfig.condition === 'before' ? '早于' : '等于'} ${dateConfig.date}
评分修正：${scoreMultiplier > 100 ? '+' : ''}${(scoreMultiplier - 100).toFixed(0)}%
${config.stopOnMatch ? '⚡ 匹配后中止后续规则' : ''}`;
            break;
        }
    }
    
    return {
        condition,
        scoreMultiplier,
        tooltip
    };
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