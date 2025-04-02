import React, { useState, useEffect, useRef } from 'react';
import { FileSizeRuleConfig } from '../../../types/rule';
import { formatFileSize } from '../utils/rule-utils';
import ScoreMultiplierInput from './common/ScoreMultiplierInput';
import StopOnMatchInput from './common/StopOnMatchInput';

const FILE_SIZE_PRESETS = [
    { label: '5GB', value: 5 * 1024 * 1024 * 1024 },
    { label: '10GB', value: 10 * 1024 * 1024 * 1024 },
    { label: '15GB', value: 15 * 1024 * 1024 * 1024 },
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

interface FileSizeEditorProps {
    config: FileSizeRuleConfig;
    onChange: (config: FileSizeRuleConfig) => void;
}

const FileSizeEditor: React.FC<FileSizeEditorProps> = ({ config, onChange }) => {
    const [customFileSize, setCustomFileSize] = useState<string>('');
    const [isCustomFileSize, setIsCustomFileSize] = useState(false);
    const lastValidFileSizeRef = useRef<string>('');

    useEffect(() => {
        const threshold = config.threshold;
        const isCustomSize = !FILE_SIZE_PRESETS.some(preset => 
            preset.value !== 'custom' && preset.value === threshold
        );
        setIsCustomFileSize(isCustomSize);
        const formattedSize = formatFileSize(threshold);
        setCustomFileSize(formattedSize);
        lastValidFileSizeRef.current = formattedSize;
    }, [config.threshold]);

    const handleFileSizeChange = (value: string) => {
        if (value === 'custom') {
            setIsCustomFileSize(true);
            const formattedSize = formatFileSize(config.threshold);
            setCustomFileSize(formattedSize);
            lastValidFileSizeRef.current = formattedSize;
            return;
        }

        setIsCustomFileSize(false);
        const newThreshold = Number(value);
        onChange({
            ...config,
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
                ...config,
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
                        value={config.condition}
                        onChange={(e) => onChange({
                            ...config,
                            condition: e.target.value as 'greater' | 'less'
                        })}
                        className="w-24 px-2 py-1 text-sm border rounded"
                    >
                        <option value="greater">大于</option>
                        <option value="less">小于</option>
                    </select>
                    <select
                        value={isCustomFileSize ? 'custom' : String(config.threshold)}
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

export default FileSizeEditor; 