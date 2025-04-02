import React, { useState, useEffect, useRef } from 'react';
import TagInput from '../common/TagInput';
import { RuleType, RuleConfig, FileSizeRuleConfig, FilenameContainsRuleConfig, FilenameSuffixRuleConfig, FileExtensionRuleConfig, FilenameRegexRuleConfig } from '../../types/rule';

interface RuleConfigEditorProps {
    type: RuleType;
    config: RuleConfig;
    onChange: (config: RuleConfig) => void;
}

const SCORE_MULTIPLIER_PRESETS = [
    { label: '150%', value: 1.5 },
    { label: '120%', value: 1.2 },
    { label: '100%', value: 1.0 },
    { label: '80%', value: 0.8 },
    { label: '50%', value: 0.5 },
    { label: '0%', value: 0 },
    { label: '自定义', value: 'custom' }
];

const FILE_SIZE_PRESETS = [
    { label: '5GB', value: 5 * 1024 * 1024 * 1024 },
    { label: '10GB', value: 10 * 1024 * 1024 * 1024 },
    { label: '15GB', value: 15 * 1024 * 1024 * 1024 },
    { label: '自定义', value: 'custom' }
];

const FILE_EXTENSION_PRESETS = [
    { label: 'MP4', value: 'mp4' },
    { label: 'MKV', value: 'mkv' },
    { label: 'ISO', value: 'iso' },
    { label: '自定义', value: 'custom' }
];

// 文件大小单位转换
const parseFileSize = (input: string): number | null => {
    // 如果只输入了数字，默认单位为B（字节）
    if (/^\d+(?:\.\d+)?$/.test(input)) {
        return parseFloat(input);
    }

    const match = input.match(/^(\d+(?:\.\d+)?)\s*(T|TB|G|GB|M|MB|K|KB|B)?$/i);
    if (!match) return null;

    const value = parseFloat(match[1]);
    const unit = (match[2] || 'B').toUpperCase(); // 默认单位为B

    switch (unit) {
        case 'T':
        case 'TB':
            return value * 1024 * 1024 * 1024 * 1024;
        case 'G':
        case 'GB':
            return value * 1024 * 1024 * 1024;
        case 'M':
        case 'MB':
            return value * 1024 * 1024;
        case 'K':
        case 'KB':
            return value * 1024;
        case 'B':
            return value;
        default:
            return null;
    }
};

// 检查正则表达式是否有效
const isValidRegex = (pattern: string): boolean => {
    try {
        new RegExp(pattern);
        return true;
    } catch (e) {
        return false;
    }
};

const RuleConfigEditor: React.FC<RuleConfigEditorProps> = ({ type, config, onChange }) => {
    const [customScoreMultiplier, setCustomScoreMultiplier] = useState<string>('');
    const [customFileSize, setCustomFileSize] = useState<string>('');
    const [isCustomScoreMultiplier, setIsCustomScoreMultiplier] = useState(false);
    const [isCustomFileSize, setIsCustomFileSize] = useState(false);
    const [isCustomExtension, setIsCustomExtension] = useState(false);
    const lastValidFileSizeRef = useRef<string>('');

    // 初始化所有状态
    useEffect(() => {
        // 初始化得分系数状态
        const scoreMultiplier = config.scoreMultiplier;
        const isCustom = !SCORE_MULTIPLIER_PRESETS.some(preset => 
            preset.value !== 'custom' && preset.value === scoreMultiplier
        );
        setIsCustomScoreMultiplier(isCustom);
        if (isCustom) {
            setCustomScoreMultiplier(String(Math.round(scoreMultiplier * 100)));
        }

        // 初始化各种规则的状态
        switch (type) {
            case RuleType.FILE_SIZE: {
                const fileSizeConfig = config as FileSizeRuleConfig;
                const threshold = fileSizeConfig.threshold;
                const isCustomSize = !FILE_SIZE_PRESETS.some(preset => 
                    preset.value !== 'custom' && preset.value === threshold
                );
                setIsCustomFileSize(isCustomSize);
                const formattedSize = formatFileSize(threshold);
                setCustomFileSize(formattedSize);
                lastValidFileSizeRef.current = formattedSize;
                break;
            }
            case RuleType.FILE_EXTENSION: {
                const extensionConfig = config as FileExtensionRuleConfig;
                const extension = extensionConfig.extensions[0] || '';
                const isCustom = !FILE_EXTENSION_PRESETS.some(preset => 
                    preset.value === extension
                );
                setIsCustomExtension(isCustom);
                break;
            }
        }
    }, [type, config]);

    const handleScoreMultiplierChange = (value: string | number) => {
        if (value === 'custom') {
            setIsCustomScoreMultiplier(true);
            return;
        }

        setIsCustomScoreMultiplier(false);
        onChange({
            ...config,
            scoreMultiplier: typeof value === 'string' ? parseFloat(value) : value
        });
    };

    const handleCustomScoreMultiplierChange = (input: string) => {
        const value = input.replace(/[^\d]/g, '');
        if (value === '' || parseInt(value) <= 0) return;
        setCustomScoreMultiplier(value);
        onChange({
            ...config,
            scoreMultiplier: parseInt(value) / 100
        });
    };

    const formatFileSize = (bytes: number): string => {
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

    const renderScoreMultiplier = () => (
        <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 min-w-[4rem]">
                得分系数
            </label>
            <div className="flex gap-2 flex-1">
                <select
                    value={isCustomScoreMultiplier ? 'custom' : config.scoreMultiplier}
                    onChange={(e) => handleScoreMultiplierChange(e.target.value)}
                    className="w-32 px-2 py-1 text-sm border rounded"
                >
                    {SCORE_MULTIPLIER_PRESETS.map(preset => (
                        <option key={preset.value} value={preset.value}>
                            {preset.label}
                        </option>
                    ))}
                </select>
                {isCustomScoreMultiplier && (
                    <div className="relative w-24">
                        <input
                            type="text"
                            value={customScoreMultiplier}
                            onChange={(e) => handleCustomScoreMultiplierChange(e.target.value)}
                            className="w-full px-2 py-1 text-sm border rounded pr-6"
                            placeholder="输入数字"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                    </div>
                )}
            </div>
        </div>
    );

    const getRulePreview = (type: RuleType, config: RuleConfig): string => {
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

    switch (type) {
        case RuleType.FILE_SIZE: {
            const fileSizeConfig = config as FileSizeRuleConfig;
            
            const handleFileSizeChange = (value: string) => {
                if (value === 'custom') {
                    setIsCustomFileSize(true);
                    const formattedSize = formatFileSize(fileSizeConfig.threshold);
                    setCustomFileSize(formattedSize);
                    lastValidFileSizeRef.current = formattedSize;
                    return;
                }

                setIsCustomFileSize(false);
                const newThreshold = Number(value);
                onChange({
                    ...fileSizeConfig,
                    threshold: newThreshold
                });
            };

            const handleCustomFileSizeChange = (input: string) => {
                setCustomFileSize(input);
            };

            const handleCustomFileSizeBlur = () => {
                const size = parseFileSize(customFileSize);
                if (size !== null) {
                    const formattedSize = formatFileSize(size);
                    setCustomFileSize(formattedSize);
                    lastValidFileSizeRef.current = formattedSize;
                    onChange({
                        ...fileSizeConfig,
                        threshold: size
                    });
                } else {
                    setCustomFileSize(lastValidFileSizeRef.current);
                }
            };

            return (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 min-w-[4rem]">
                            条件
                        </label>
                        <div className="flex gap-2 flex-1">
                            <select
                                value={fileSizeConfig.condition}
                                onChange={(e) => onChange({
                                    ...fileSizeConfig,
                                    condition: e.target.value as 'greater' | 'less'
                                })}
                                className="w-24 px-2 py-1 text-sm border rounded"
                            >
                                <option value="greater">大于</option>
                                <option value="less">小于</option>
                            </select>
                            <select
                                value={isCustomFileSize ? 'custom' : String(fileSizeConfig.threshold)}
                                onChange={(e) => handleFileSizeChange(e.target.value)}
                                className="w-24 px-2 py-1 text-sm border rounded"
                            >
                                {FILE_SIZE_PRESETS.map(preset => (
                                    <option key={preset.value} value={preset.value}>
                                        {preset.label}
                                    </option>
                                ))}
                            </select>
                            {isCustomFileSize && (
                                <input
                                    type="text"
                                    value={customFileSize}
                                    onChange={(e) => handleCustomFileSizeChange(e.target.value)}
                                    onBlur={handleCustomFileSizeBlur}
                                    className="w-32 px-2 py-1 text-sm border rounded"
                                    placeholder="如: 5GB, 1.5TB"
                                />
                            )}
                        </div>
                    </div>
                    {renderScoreMultiplier()}
                </div>
            );
        }

        case RuleType.FILENAME_CONTAINS: {
            const containsConfig = config as FilenameContainsRuleConfig;
            return (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 min-w-[4rem]">
                            关键字
                        </label>
                        <div className="flex-1 max-w-xl">
                            <TagInput
                                tags={containsConfig.keywords}
                                onChange={(keywords) => onChange({
                                    ...containsConfig,
                                    keywords
                                })}
                                placeholder="输入关键字后按回车添加"
                            />
                        </div>
                    </div>
                    {renderScoreMultiplier()}
                </div>
            );
        }

        case RuleType.FILENAME_SUFFIX: {
            const suffixConfig = config as FilenameSuffixRuleConfig;
            return (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 min-w-[4rem]">
                            后缀
                        </label>
                        <div className="flex-1">
                            <TagInput
                                tags={suffixConfig.suffixes}
                                onChange={(suffixes) => onChange({
                                    ...suffixConfig,
                                    suffixes
                                })}
                                placeholder="输入后缀后按回车添加"
                            />
                        </div>
                    </div>
                    {renderScoreMultiplier()}
                </div>
            );
        }

        case RuleType.FILE_EXTENSION: {
            const extensionConfig = config as FileExtensionRuleConfig;

            const handleExtensionChange = (value: string) => {
                if (value === 'custom') {
                    setIsCustomExtension(true);
                    onChange({
                        ...extensionConfig,
                        extensions: []
                    });
                    return;
                }

                setIsCustomExtension(false);
                onChange({
                    ...extensionConfig,
                    extensions: [value]
                });
            };

            const handleCustomExtensionChange = (value: string) => {
                const trimmedValue = value.slice(0, 10);
                onChange({
                    ...extensionConfig,
                    extensions: trimmedValue ? [trimmedValue] : []
                });
            };

            // 初始化时如果没有选中值，默认选中第一个选项
            useEffect(() => {
                if (!extensionConfig.extensions.length && !isCustomExtension) {
                    handleExtensionChange(FILE_EXTENSION_PRESETS[0].value);
                }
            }, []);

            const currentExtension = extensionConfig.extensions[0];
            const isPresetExtension = FILE_EXTENSION_PRESETS.some(preset => preset.value === currentExtension);
            const selectValue = isCustomExtension ? 'custom' : 
                              (isPresetExtension ? currentExtension : FILE_EXTENSION_PRESETS[0].value);

            return (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 min-w-[4rem]">
                            扩展名
                        </label>
                        <div className="flex gap-2 flex-1">
                            <select
                                value={selectValue}
                                onChange={(e) => handleExtensionChange(e.target.value)}
                                className="w-32 px-2 py-1 text-sm border rounded"
                            >
                                {FILE_EXTENSION_PRESETS.map(preset => (
                                    <option key={preset.value} value={preset.value}>
                                        {preset.label}
                                    </option>
                                ))}
                            </select>
                            {isCustomExtension && (
                                <input
                                    type="text"
                                    value={currentExtension || ''}
                                    onChange={(e) => handleCustomExtensionChange(e.target.value)}
                                    className="w-32 px-2 py-1 text-sm border rounded"
                                    placeholder="输入扩展名"
                                    maxLength={10}
                                />
                            )}
                        </div>
                    </div>
                    {renderScoreMultiplier()}
                </div>
            );
        }

        case RuleType.FILENAME_REGEX: {
            const regexConfig = config as FilenameRegexRuleConfig;
            const [isValidPattern, setIsValidPattern] = useState(true);

            const handlePatternChange = (pattern: string) => {
                const isValid = isValidRegex(pattern);
                setIsValidPattern(isValid);
                onChange({
                    ...regexConfig,
                    pattern
                });
            };

            return (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 min-w-[4rem]">
                            正则
                        </label>
                        <div className="flex-1 max-w-xl relative">
                            <input
                                type="text"
                                value={regexConfig.pattern}
                                onChange={(e) => handlePatternChange(e.target.value)}
                                className={`w-full px-2 py-1 text-sm border rounded ${
                                    !isValidPattern && regexConfig.pattern
                                        ? 'border-red-500 focus:ring-red-500'
                                        : ''
                                }`}
                                placeholder="输入正则表达式"
                            />
                            {!isValidPattern && regexConfig.pattern && (
                                <span className="absolute left-0 -bottom-5 text-xs text-red-500">
                                    无效的正则表达式
                                </span>
                            )}
                        </div>
                    </div>
                    {renderScoreMultiplier()}
                </div>
            );
        }

        default:
            return null;
    }
};

export default RuleConfigEditor; 