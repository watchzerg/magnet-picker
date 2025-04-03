import React, { useState } from 'react';
import { FilenameRegexRuleConfig } from '../../../types/rule';
import ScoreMultiplierSelect from './common/ScoreMultiplierInput';

// 检查正则表达式是否有效
const isValidRegex = (pattern: string): boolean => {
    try {
        new RegExp(pattern);
        return true;
    } catch (e) {
        return false;
    }
};

interface FilenameRegexEditorProps {
    config: FilenameRegexRuleConfig;
    onChange: (config: FilenameRegexRuleConfig) => void;
}

const FilenameRegexEditor: React.FC<FilenameRegexEditorProps> = ({ config, onChange }) => {
    const [isValidPattern, setIsValidPattern] = useState(true);

    const handlePatternChange = (pattern: string) => {
        const isValid = !pattern || isValidRegex(pattern);
        setIsValidPattern(isValid);
        
        onChange({
            ...config,
            pattern
        });
    };

    return (
        <div className="flex items-center justify-between gap-4">
            {/* 左侧：正则表达式输入 */}
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">
                        正则表达式
                    </label>
                    <input
                        type="text"
                        value={config.pattern}
                        onChange={(e) => handlePatternChange(e.target.value)}
                        className={`w-full px-2 py-1 text-sm border rounded ${
                            !isValidPattern && config.pattern
                                ? 'border-red-500'
                                : ''
                        }`}
                        placeholder="输入正则表达式，如: .*1080p.*"
                    />
                </div>
                {!isValidPattern && config.pattern && (
                    <div className="mt-1 text-sm text-red-500">
                        无效的正则表达式
                    </div>
                )}
            </div>
            
            {/* 右侧：得分系数 */}
            <ScoreMultiplierSelect
                value={config.scoreMultiplier}
                onChange={(value) => onChange({ ...config, scoreMultiplier: value })}
            />
        </div>
    );
};

export default FilenameRegexEditor; 