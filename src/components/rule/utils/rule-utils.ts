import { RuleType, RuleConfig } from '../../../types/rule';

export const getRuleTypeName = (type: RuleType): string => {
    switch (type) {
        case RuleType.FILE_SIZE:
            return '文件体积';
        case RuleType.FILENAME_CONTAINS:
            return '文件名（不含扩展名）关键字';
        case RuleType.FILENAME_SUFFIX:
            return '文件名（不含扩展名）后缀';
        case RuleType.FILE_EXTENSION:
            return '文件扩展名';
        case RuleType.FILENAME_REGEX:
            return '文件名正则';
        case RuleType.SHARE_DATE:
            return '分享日期';
        default:
            return '未知规则';
    }
};

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

export const getRulePreview = (type: RuleType, config: RuleConfig): string => {
    switch (type) {
        case RuleType.FILE_SIZE: {
            const fileSizeConfig = config as any;
            return `${fileSizeConfig.condition === 'greater' ? '大于' : '小于'} ${formatFileSize(fileSizeConfig.threshold)}`;
        }
        case RuleType.FILENAME_CONTAINS: {
            const containsConfig = config as any;
            return containsConfig.keywords.length > 0 ? containsConfig.keywords.join(', ') : '未设置关键字';
        }
        case RuleType.FILENAME_SUFFIX: {
            const suffixConfig = config as any;
            return suffixConfig.suffixes.length > 0 ? suffixConfig.suffixes.join(', ') : '未设置后缀';
        }
        case RuleType.FILE_EXTENSION: {
            const extensionConfig = config as any;
            return extensionConfig.extensions[0] || '未设置扩展名';
        }
        case RuleType.FILENAME_REGEX: {
            const regexConfig = config as any;
            return regexConfig.pattern || '未设置正则';
        }
        case RuleType.SHARE_DATE: {
            const shareDateConfig = config as any;
            if (!shareDateConfig.date) return '未设置日期';
            
            const conditionMap: Record<string, string> = {
                'before': '早于',
                'equal': '等于',
                'after': '晚于'
            };
            
            return `${conditionMap[shareDateConfig.condition]} ${shareDateConfig.date}`;
        }
        default:
            return '';
    }
}; 