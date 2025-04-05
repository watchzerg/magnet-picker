import { RuleType, RuleConfig } from '../../../types/rule';

export const validateRule = (type: RuleType, config: RuleConfig): { isValid: boolean; message?: string } => {
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