import { RuleType, RuleConfig, MagnetRule } from '../../../types/rule';

// 检查规则是否重复
const isRuleDuplicate = (rule: MagnetRule, existingRules: MagnetRule[]): boolean => {
    return existingRules.some(existingRule => {
        // 跳过与自身比较
        if (existingRule.id === rule.id) {
            return false;
        }
        
        // 类型必须相同
        if (existingRule.type !== rule.type) {
            return false;
        }
        
        // 根据规则类型比较配置
        switch (rule.type) {
            case RuleType.FILE_SIZE: {
                const config = rule.config as any;
                const existingConfig = existingRule.config as any;
                return config.condition === existingConfig.condition && 
                       config.threshold === existingConfig.threshold;
            }
            case RuleType.FILENAME_CONTAINS: {
                const config = rule.config as any;
                const existingConfig = existingRule.config as any;
                return config.keywords.length === existingConfig.keywords.length &&
                       config.keywords.every((keyword: string) => 
                           existingConfig.keywords.includes(keyword));
            }
            case RuleType.FILENAME_SUFFIX: {
                const config = rule.config as any;
                const existingConfig = existingRule.config as any;
                return config.suffixes.length === existingConfig.suffixes.length &&
                       config.suffixes.every((suffix: string) => 
                           existingConfig.suffixes.includes(suffix));
            }
            case RuleType.FILE_EXTENSION: {
                const config = rule.config as any;
                const existingConfig = existingRule.config as any;
                return config.extensions.length === existingConfig.extensions.length &&
                       config.extensions.every((ext: string) => 
                           existingConfig.extensions.includes(ext));
            }
            case RuleType.FILENAME_REGEX: {
                const config = rule.config as any;
                const existingConfig = existingRule.config as any;
                return config.pattern === existingConfig.pattern;
            }
            case RuleType.SHARE_DATE: {
                const config = rule.config as any;
                const existingConfig = existingRule.config as any;
                return config.condition === existingConfig.condition &&
                       config.date === existingConfig.date;
            }
            default:
                return false;
        }
    });
};

export const validateRule = (
    type: RuleType, 
    config: RuleConfig,
    rule: MagnetRule,
    existingRules: MagnetRule[]
): { isValid: boolean; message?: string } => {
    // 检查规则是否重复
    if (isRuleDuplicate(rule, existingRules)) {
        return { 
            isValid: false, 
            message: '无效规则：存在相同类型的重复规则' 
        };
    }

    // 原有的验证逻辑
    switch (type) {
        case RuleType.FILE_SIZE: {
            const fileSizeConfig = config as any;
            if (!fileSizeConfig.threshold || fileSizeConfig.threshold <= 0) {
                return { isValid: false, message: '无效规则：文件大小必须大于0' };
            }
            return { isValid: true };
        }
        case RuleType.FILENAME_CONTAINS: {
            const containsConfig = config as any;
            if (!containsConfig.keywords || containsConfig.keywords.length === 0) {
                return { isValid: false, message: '无效规则：至少需要一个关键字' };
            }
            return { isValid: true };
        }
        case RuleType.FILENAME_SUFFIX: {
            const suffixConfig = config as any;
            if (!suffixConfig.suffixes || suffixConfig.suffixes.length === 0) {
                return { isValid: false, message: '无效规则：至少需要一个后缀' };
            }
            return { isValid: true };
        }
        case RuleType.FILE_EXTENSION: {
            const extensionConfig = config as any;
            if (!extensionConfig.extensions || extensionConfig.extensions.length === 0) {
                return { isValid: false, message: '无效规则：至少需要一个扩展名' };
            }
            return { isValid: true };
        }
        case RuleType.FILENAME_REGEX: {
            const regexConfig = config as any;
            if (!regexConfig.pattern) {
                return { isValid: false, message: '无效规则：请输入正则表达式' };
            }
            try {
                new RegExp(regexConfig.pattern);
                return { isValid: true };
            } catch (e) {
                return { isValid: false, message: '无效规则：无效的正则表达式' };
            }
        }
        case RuleType.SHARE_DATE: {
            const shareDateConfig = config as any;
            if (!shareDateConfig.date) {
                return { isValid: false, message: '请选择日期' };
            }
            return { isValid: true };
        }
        default:
            return { isValid: false, message: '未知的规则类型' };
    }
}; 