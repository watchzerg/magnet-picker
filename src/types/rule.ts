// 规则类型枚举
export enum RuleType {
    FILE_SIZE = 'FILE_SIZE',
    FILENAME_CONTAINS = 'FILENAME_CONTAINS',
    FILENAME_SUFFIX = 'FILENAME_SUFFIX',
    FILE_EXTENSION = 'FILE_EXTENSION',
    FILENAME_REGEX = 'FILENAME_REGEX'
}

// 基础规则配置接口
interface BaseRuleConfig {
    type: RuleType;
    scoreMultiplier: number; // 匹配后的得分系数（1.5 表示 150%）
    stopOnMatch: boolean;    // 匹配后是否中止后续规则
}

// 文件体积规则配置
export interface FileSizeRuleConfig extends BaseRuleConfig {
    type: RuleType.FILE_SIZE;
    condition: 'greater' | 'less';
    threshold: number;  // 单位：字节
}

// 文件名包含规则配置
export interface FilenameContainsRuleConfig extends BaseRuleConfig {
    type: RuleType.FILENAME_CONTAINS;
    keywords: string[];
}

// 文件名后缀规则配置
export interface FilenameSuffixRuleConfig extends BaseRuleConfig {
    type: RuleType.FILENAME_SUFFIX;
    suffixes: string[];
}

// 文件扩展名规则配置
export interface FileExtensionRuleConfig extends BaseRuleConfig {
    type: RuleType.FILE_EXTENSION;
    extensions: string[];
}

// 文件名正则表达式规则配置
export interface FilenameRegexRuleConfig extends BaseRuleConfig {
    type: RuleType.FILENAME_REGEX;
    pattern: string;
}

// 所有规则配置的联合类型
export type RuleConfig = 
    | FileSizeRuleConfig 
    | FilenameContainsRuleConfig 
    | FilenameSuffixRuleConfig 
    | FileExtensionRuleConfig 
    | FilenameRegexRuleConfig;

// 规则基础接口
export interface MagnetRule {
    id: string;           // 规则唯一标识
    type: RuleType;       // 规则类型
    enabled: boolean;     // 是否启用
    order: number;        // 规则顺序
    config: RuleConfig;   // 规则配置
}

export type MagnetRules = MagnetRule[];

// 规则校验结果
export interface RuleValidationResult {
    isValid: boolean;
    message?: string;
}

// 规则校验函数
export const validateRule = (type: RuleType, config: RuleConfig): RuleValidationResult => {
    switch (type) {
        case RuleType.FILE_SIZE: {
            const fileSizeConfig = config as FileSizeRuleConfig;
            if (fileSizeConfig.threshold <= 0) {
                return {
                    isValid: false,
                    message: '文件大小必须大于0'
                };
            }
            break;
        }
        case RuleType.FILENAME_CONTAINS: {
            const containsConfig = config as FilenameContainsRuleConfig;
            if (!containsConfig.keywords.length) {
                return {
                    isValid: false,
                    message: '请至少添加一个关键字'
                };
            }
            break;
        }
        case RuleType.FILENAME_SUFFIX: {
            const suffixConfig = config as FilenameSuffixRuleConfig;
            if (!suffixConfig.suffixes.length) {
                return {
                    isValid: false,
                    message: '请至少添加一个后缀'
                };
            }
            break;
        }
        case RuleType.FILE_EXTENSION: {
            const extensionConfig = config as FileExtensionRuleConfig;
            if (!extensionConfig.extensions.length) {
                return {
                    isValid: false,
                    message: '请选择或输入扩展名'
                };
            }
            break;
        }
        case RuleType.FILENAME_REGEX: {
            const regexConfig = config as FilenameRegexRuleConfig;
            if (!regexConfig.pattern) {
                return {
                    isValid: false,
                    message: '请输入正则表达式'
                };
            }
            try {
                new RegExp(regexConfig.pattern);
            } catch (e) {
                return {
                    isValid: false,
                    message: '无效的正则表达式'
                };
            }
            break;
        }
    }
    return { isValid: true };
}; 