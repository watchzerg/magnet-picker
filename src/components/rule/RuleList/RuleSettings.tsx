import React, { useState, useEffect } from 'react';
import { RuleSettingsProps } from '../../../types/rule-settings';
import ThresholdSelector from './ThresholdSelector';
import TargetCountSelector from './TargetCountSelector';

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
                <ThresholdSelector
                    type="required"
                    value={requiredThreshold}
                    isCustom={isCustomRequired}
                    customValue={customRequiredValue}
                    customUnit={customRequiredUnit}
                    onValueChange={handleRequiredChange}
                    onCustomValueChange={(value, unit) => handleCustomValueChange(value, unit, 'required')}
                />

                <ThresholdSelector
                    type="preferred"
                    value={preferredThreshold}
                    isCustom={isCustomPreferred}
                    customValue={customPreferredValue}
                    customUnit={customPreferredUnit}
                    onValueChange={handlePreferredChange}
                    onCustomValueChange={(value, unit) => handleCustomValueChange(value, unit, 'preferred')}
                />

                <TargetCountSelector
                    value={targetCount}
                    onChange={handleTargetCountChange}
                />
            </div>
        </div>
    );
};

export default RuleSettings; 