import React, { useState } from 'react';
import { FilenameRegexRuleConfig } from '../../../types/rule';
import ScoreMultiplierInput from './common/ScoreMultiplierInput';
import StopOnMatchInput from './common/StopOnMatchInput';

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
        const isValid = isValidRegex(pattern);
        setIsValidPattern(isValid);
        onChange({
            ...config,
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
                        value={config.pattern}
                        onChange={(e) => handlePatternChange(e.target.value)}
                        className={`w-full px-2 py-1 text-sm border rounded ${
                            !isValidPattern && config.pattern
                                ? 'border-red-500 focus:ring-red-500'
                                : ''
                        }`}
                        placeholder="输入正则表达式"
                    />
                    {!isValidPattern && config.pattern && (
                        <span className="absolute left-0 -bottom-5 text-xs text-red-500">
                            无效的正则表达式
                        </span>
                    )}
                </div>
            </div>
            <ScoreMultiplierInput
                value={config.scoreMultiplier}
                onChange={(value) => onChange({ ...config, scoreMultiplier: value })}
            />
            <StopOnMatchInput
                value={config.stopOnMatch}
                onChange={(value) => onChange({ ...config, stopOnMatch: value })}
            />
        </div>
    );
};

export default FilenameRegexEditor; 