import React, { useState, useEffect } from 'react';

const SCORE_MULTIPLIER_PRESETS = [
    { label: '150%', value: 1.5 },
    { label: '120%', value: 1.2 },
    { label: '100%', value: 1.0 },
    { label: '80%', value: 0.8 },
    { label: '50%', value: 0.5 },
    { label: '0%', value: 0 },
    { label: '自定义', value: 'custom' }
];

interface ScoreMultiplierInputProps {
    value: number;
    onChange: (value: number) => void;
}

const ScoreMultiplierInput: React.FC<ScoreMultiplierInputProps> = ({ value, onChange }) => {
    const [customScoreMultiplier, setCustomScoreMultiplier] = useState<string>('');
    const [isCustomScoreMultiplier, setIsCustomScoreMultiplier] = useState(false);

    useEffect(() => {
        const isCustom = !SCORE_MULTIPLIER_PRESETS.some(preset => 
            preset.value !== 'custom' && preset.value === value
        );
        setIsCustomScoreMultiplier(isCustom);
        if (isCustom) {
            setCustomScoreMultiplier(String(Math.round(value * 100)));
        }
    }, [value]);

    const handleScoreMultiplierChange = (value: string | number) => {
        if (value === 'custom') {
            setIsCustomScoreMultiplier(true);
            return;
        }

        setIsCustomScoreMultiplier(false);
        onChange(typeof value === 'string' ? parseFloat(value) : value);
    };

    const handleCustomScoreMultiplierChange = (input: string) => {
        const value = input.replace(/[^\d]/g, '');
        if (value === '' || parseInt(value) <= 0) return;
        setCustomScoreMultiplier(value);
        onChange(parseInt(value) / 100);
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
                    {SCORE_MULTIPLIER_PRESETS.map(preset => (
                        <option key={preset.value} value={preset.value}>
                            {preset.label}
                        </option>
                    ))}
                </select>
                {isCustomScoreMultiplier && (
                    <input
                        type="text"
                        value={customScoreMultiplier}
                        onChange={(e) => handleCustomScoreMultiplierChange(e.target.value)}
                        className="w-20 px-2 py-1 text-sm border rounded"
                        placeholder="输入百分比"
                    />
                )}
            </div>
        </div>
    );
};

export default ScoreMultiplierInput; 