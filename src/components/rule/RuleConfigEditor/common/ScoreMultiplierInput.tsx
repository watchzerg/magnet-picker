import React, { useState, useEffect } from 'react';

// 得分系数预设选项
export const SCORE_MULTIPLIER_OPTIONS = [
    { value: 2.0, label: '200%' },
    { value: 1.5, label: '150%' },
    { value: 1.2, label: '120%' },
    { value: 1.0, label: '100%' },
    { value: 0.8, label: '80%' },
    { value: 0.5, label: '50%' },
    { value: 0.2, label: '20%' },
    { value: 0, label: '0%' },
    { value: 'custom', label: '自定义' }
] as const;

// 预设选项的值类型（不包括'custom'）
type PresetValue = Exclude<typeof SCORE_MULTIPLIER_OPTIONS[number]['value'], 'custom'>;

interface ScoreMultiplierInputProps {
    value: number;
    onChange: (value: number) => void;
}

const ScoreMultiplierInput: React.FC<ScoreMultiplierInputProps> = ({ value, onChange }) => {
    const [customScoreMultiplier, setCustomScoreMultiplier] = useState<string>('');
    const [isCustomScoreMultiplier, setIsCustomScoreMultiplier] = useState(false);

    useEffect(() => {
        const isCustom = !SCORE_MULTIPLIER_OPTIONS
            .filter(option => option.value !== 'custom')
            .some(option => option.value === value);
            
        setIsCustomScoreMultiplier(isCustom);
        if (isCustom) {
            setCustomScoreMultiplier(String(Math.round(value * 100)));
        }
    }, [value]);

    const handleScoreMultiplierChange = (value: string | number) => {
        if (value === 'custom') {
            setIsCustomScoreMultiplier(true);
            setCustomScoreMultiplier('');
            return;
        }

        setIsCustomScoreMultiplier(false);
        onChange(Number(value));
    };

    const handleCustomScoreMultiplierChange = (input: string) => {
        // 只允许输入数字
        const value = input.replace(/[^\d]/g, '');
        setCustomScoreMultiplier(value);
    };

    const handleCustomScoreMultiplierConfirm = () => {
        if (!customScoreMultiplier || parseInt(customScoreMultiplier) <= 0) {
            // 如果输入无效，重置为当前值
            setCustomScoreMultiplier(String(Math.round(value * 100)));
            return;
        }

        const numericValue = parseInt(customScoreMultiplier) / 100;
        
        // 检查是否匹配预设选项
        const matchedOption = SCORE_MULTIPLIER_OPTIONS.find(
            option => option.value !== 'custom' && option.value === numericValue
        );

        if (matchedOption) {
            setIsCustomScoreMultiplier(false);
            onChange(matchedOption.value as number);
        } else {
            onChange(numericValue);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleCustomScoreMultiplierConfirm();
        }
    };

    return (
        <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 min-w-[4rem]">
                得分系数
            </label>
            <div className="flex gap-2 flex-1">
                <select
                    value={isCustomScoreMultiplier ? 'custom' : value}
                    onChange={(e) => handleScoreMultiplierChange(e.target.value)}
                    className="w-32 px-2 py-1 text-sm border rounded"
                >
                    {SCORE_MULTIPLIER_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {isCustomScoreMultiplier && (
                    <input
                        type="text"
                        value={customScoreMultiplier}
                        onChange={(e) => handleCustomScoreMultiplierChange(e.target.value)}
                        onBlur={handleCustomScoreMultiplierConfirm}
                        onKeyDown={handleKeyDown}
                        className="w-20 px-2 py-1 text-sm border rounded"
                        placeholder="输入数字"
                    />
                )}
            </div>
        </div>
    );
};

export default ScoreMultiplierInput; 