import React, { useState, useEffect } from 'react';

interface RuleSettingsProps {
    initialSettings: {
        requiredThreshold: number;
        preferredThreshold: number;
        targetCount: number;
    };
    onSettingsChange: (settings: {
        requiredThreshold: number;
        preferredThreshold: number;
        targetCount: number;
    }) => void;
}

// 得分单位
const SCORE_UNITS = [
    { value: '', label: 'score' },
    { value: 'K', label: 'K-score' },
    { value: 'M', label: 'M-score' },
    { value: 'G', label: 'G-score' },
    { value: 'T', label: 'T-score' }
];

const DEFAULT_REQUIRED_OPTIONS = [
    { value: 10 * 1024 * 1024 * 1024, label: '10G-score' },
    { value: 15 * 1024 * 1024 * 1024, label: '15G-score' },
    { value: 20 * 1024 * 1024 * 1024, label: '20G-score' },
    { value: 'custom', label: '自定义' }
];

const DEFAULT_PREFERRED_OPTIONS = [
    { value: 5 * 1024 * 1024 * 1024, label: '5G-score' },
    { value: 7 * 1024 * 1024 * 1024, label: '7G-score' },
    { value: 10 * 1024 * 1024 * 1024, label: '10G-score' },
    { value: 'custom', label: '自定义' }
];

const RuleSettings: React.FC<RuleSettingsProps> = ({ initialSettings, onSettingsChange }) => {
    // 必选阈值状态
    const [requiredThreshold, setRequiredThreshold] = useState(initialSettings.requiredThreshold);
    const [isCustomRequired, setIsCustomRequired] = useState(false);
    const [customRequiredValue, setCustomRequiredValue] = useState('10');
    const [customRequiredUnit, setCustomRequiredUnit] = useState('G');

    // 优选阈值状态
    const [preferredThreshold, setPreferredThreshold] = useState(initialSettings.preferredThreshold);
    const [isCustomPreferred, setIsCustomPreferred] = useState(false);
    const [customPreferredValue, setCustomPreferredValue] = useState('5');
    const [customPreferredUnit, setCustomPreferredUnit] = useState('G');

    // 目标数量状态
    const [targetCount, setTargetCount] = useState(initialSettings.targetCount);

    // 初始化时检查是否使用自定义值
    useEffect(() => {
        // 检查必选阈值是否为预设值
        const isRequiredCustom = !DEFAULT_REQUIRED_OPTIONS.some(
            option => option.value !== 'custom' && option.value === initialSettings.requiredThreshold
        );
        if (isRequiredCustom) {
            setIsCustomRequired(true);
            let value = initialSettings.requiredThreshold;
            let unitIndex = 0;
            while (value >= 1024 && unitIndex < SCORE_UNITS.length - 1) {
                value /= 1024;
                unitIndex++;
            }
            setCustomRequiredValue(value.toString());
            setCustomRequiredUnit(SCORE_UNITS[unitIndex].value);
        }

        // 检查优选阈值是否为预设值
        const isPreferredCustom = !DEFAULT_PREFERRED_OPTIONS.some(
            option => option.value !== 'custom' && option.value === initialSettings.preferredThreshold
        );
        if (isPreferredCustom) {
            setIsCustomPreferred(true);
            let value = initialSettings.preferredThreshold;
            let unitIndex = 0;
            while (value >= 1024 && unitIndex < SCORE_UNITS.length - 1) {
                value /= 1024;
                unitIndex++;
            }
            setCustomPreferredValue(value.toString());
            setCustomPreferredUnit(SCORE_UNITS[unitIndex].value);
        }
    }, [initialSettings]);

    // 处理必选阈值变化
    const handleRequiredChange = (value: string | number) => {
        if (value === 'custom') {
            setIsCustomRequired(true);
            return;
        }
        setIsCustomRequired(false);
        setRequiredThreshold(Number(value));
        onSettingsChange({ requiredThreshold: Number(value), preferredThreshold, targetCount });
    };

    // 处理优选阈值变化
    const handlePreferredChange = (value: string | number) => {
        if (value === 'custom') {
            setIsCustomPreferred(true);
            return;
        }
        setIsCustomPreferred(false);
        setPreferredThreshold(Number(value));
        onSettingsChange({ requiredThreshold, preferredThreshold: Number(value), targetCount });
    };

    // 处理自定义值变化
    const handleCustomValueChange = (
        value: string,
        unit: string,
        type: 'required' | 'preferred'
    ) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return;

        let bytes = numValue;
        const unitIndex = SCORE_UNITS.findIndex(u => u.value === unit);
        for (let i = 0; i < unitIndex; i++) {
            bytes *= 1024;
        }

        if (type === 'required') {
            setCustomRequiredValue(value);
            setCustomRequiredUnit(unit);
            setRequiredThreshold(bytes);
            onSettingsChange({ requiredThreshold: bytes, preferredThreshold, targetCount });
        } else {
            setCustomPreferredValue(value);
            setCustomPreferredUnit(unit);
            setPreferredThreshold(bytes);
            onSettingsChange({ requiredThreshold, preferredThreshold: bytes, targetCount });
        }
    };

    // 处理目标数量变化
    const handleTargetCountChange = (value: number) => {
        setTargetCount(value);
        onSettingsChange({ requiredThreshold, preferredThreshold, targetCount: value });
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-3 gap-6">
                {/* 必选阈值 */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        必选阈值
                    </label>
                    <div className="flex gap-2">
                        <select
                            value={isCustomRequired ? 'custom' : requiredThreshold}
                            onChange={(e) => handleRequiredChange(e.target.value)}
                            className="block w-28 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                            {DEFAULT_REQUIRED_OPTIONS.map(option => (
                                <option key={option.label} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {isCustomRequired && (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={customRequiredValue}
                                    onChange={(e) => handleCustomValueChange(e.target.value, customRequiredUnit, 'required')}
                                    className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                                <select
                                    value={customRequiredUnit}
                                    onChange={(e) => handleCustomValueChange(customRequiredValue, e.target.value, 'required')}
                                    className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                >
                                    {SCORE_UNITS.map(unit => (
                                        <option key={unit.value} value={unit.value}>
                                            {unit.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* 优选阈值 */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        优选阈值
                    </label>
                    <div className="flex gap-2">
                        <select
                            value={isCustomPreferred ? 'custom' : preferredThreshold}
                            onChange={(e) => handlePreferredChange(e.target.value)}
                            className="block w-28 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                            {DEFAULT_PREFERRED_OPTIONS.map(option => (
                                <option key={option.label} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {isCustomPreferred && (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={customPreferredValue}
                                    onChange={(e) => handleCustomValueChange(e.target.value, customPreferredUnit, 'preferred')}
                                    className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                                <select
                                    value={customPreferredUnit}
                                    onChange={(e) => handleCustomValueChange(customPreferredValue, e.target.value, 'preferred')}
                                    className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                >
                                    {SCORE_UNITS.map(unit => (
                                        <option key={unit.value} value={unit.value}>
                                            {unit.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* 目标数量 */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        目标数量
                    </label>
                    <div className="flex items-center gap-4">
                        <div className="w-12 text-center font-medium bg-gray-100 py-1 rounded">
                            {targetCount}
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={targetCount}
                            onChange={(e) => handleTargetCountChange(parseInt(e.target.value))}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RuleSettings; 