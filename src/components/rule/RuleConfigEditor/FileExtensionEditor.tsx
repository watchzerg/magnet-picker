import React, { useState, useEffect } from 'react';
import { FileExtensionRuleConfig } from '../../../types/rule';
import ScoreMultiplierInput from './common/ScoreMultiplierInput';
import StopOnMatchInput from './common/StopOnMatchInput';

const FILE_EXTENSION_PRESETS = [
    { label: 'MP4', value: 'mp4' },
    { label: 'MKV', value: 'mkv' },
    { label: 'ISO', value: 'iso' },
    { label: '自定义', value: 'custom' }
];

interface FileExtensionEditorProps {
    config: FileExtensionRuleConfig;
    onChange: (config: FileExtensionRuleConfig) => void;
}

const FileExtensionEditor: React.FC<FileExtensionEditorProps> = ({ config, onChange }) => {
    const [isCustomExtension, setIsCustomExtension] = useState(false);

    const handleExtensionChange = (value: string) => {
        if (value === 'custom') {
            setIsCustomExtension(true);
            onChange({
                ...config,
                extensions: []
            });
            return;
        }

        setIsCustomExtension(false);
        onChange({
            ...config,
            extensions: [value]
        });
    };

    const handleCustomExtensionChange = (value: string) => {
        const trimmedValue = value.slice(0, 10);
        onChange({
            ...config,
            extensions: trimmedValue ? [trimmedValue] : []
        });
    };

    // 初始化时如果没有选中值，默认选中第一个选项
    useEffect(() => {
        if (!config.extensions.length && !isCustomExtension) {
            handleExtensionChange(FILE_EXTENSION_PRESETS[0].value);
        }
    }, []);

    const currentExtension = config.extensions[0];
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

export default FileExtensionEditor; 