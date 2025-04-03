import React, { useState, useEffect } from 'react';
import { FileSizeRuleConfig } from '../../../types/rule';
import ScoreMultiplierSelect from './common/ScoreMultiplierInput';

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];
const FILE_SIZE_PRESETS = [
    { value: 5 * 1024 * 1024 * 1024, label: '5G' },
    { value: 10 * 1024 * 1024 * 1024, label: '10G' },
    { value: 15 * 1024 * 1024 * 1024, label: '15G' },
    { value: 'custom', label: '自定义' }
];

interface FileSizeEditorProps {
    config: FileSizeRuleConfig;
    onChange: (config: FileSizeRuleConfig) => void;
}

const FileSizeEditor: React.FC<FileSizeEditorProps> = ({ config, onChange }) => {
    const [isCustomSize, setIsCustomSize] = useState(false);
    const [customValue, setCustomValue] = useState('5');
    const [customUnit, setCustomUnit] = useState('GB');

    useEffect(() => {
        const threshold = config.threshold;
        const isCustom = !FILE_SIZE_PRESETS.some(preset => 
            preset.value !== 'custom' && preset.value === threshold
        );
        
        if (isCustom) {
            setIsCustomSize(true);
            // 将字节转换为适当的单位
            let value = threshold;
            let unitIndex = 0;
            while (value >= 1024 && unitIndex < BYTE_UNITS.length - 1) {
                value /= 1024;
                unitIndex++;
            }
            setCustomValue(value.toString());
            setCustomUnit(BYTE_UNITS[unitIndex]);
        } else {
            setIsCustomSize(false);
        }
    }, [config.threshold]);

    const handleSizeChange = (value: string | number) => {
        if (value === 'custom') {
            setIsCustomSize(true);
            return;
        }

        setIsCustomSize(false);
        onChange({
            ...config,
            threshold: Number(value)
        });
    };

    const handleCustomValueChange = (value: string, unit: string) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return;

        let bytes = numValue;
        const unitIndex = BYTE_UNITS.indexOf(unit);
        for (let i = 0; i < unitIndex; i++) {
            bytes *= 1024;
        }

        setCustomValue(value);
        setCustomUnit(unit);
        onChange({
            ...config,
            threshold: bytes
        });
    };

    return (
        <div className="flex items-center justify-between gap-4">
            {/* 左侧：条件选择 */}
            <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                    条件
                </label>
                <select
                    value={config.condition}
                    onChange={(e) => onChange({
                        ...config,
                        condition: e.target.value as 'greater' | 'less'
                    })}
                    className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                    <option value="greater">大于</option>
                    <option value="less">小于</option>
                </select>
                <select
                    value={isCustomSize ? 'custom' : config.threshold}
                    onChange={(e) => handleSizeChange(e.target.value)}
                    className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                    {FILE_SIZE_PRESETS.map(option => (
                        <option key={option.label} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {isCustomSize && (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={customValue}
                            onChange={(e) => handleCustomValueChange(e.target.value, customUnit)}
                            className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                        <select
                            value={customUnit}
                            onChange={(e) => handleCustomValueChange(customValue, e.target.value)}
                            className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                            {BYTE_UNITS.map(unit => (
                                <option key={unit} value={unit}>{unit}</option>
                            ))}
                        </select>
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

export default FileSizeEditor; 