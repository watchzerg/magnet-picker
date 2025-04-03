import React, { useState } from 'react';
import { FileExtensionRuleConfig } from '../../../types/rule';
import ScoreMultiplierSelect from './common/ScoreMultiplierInput';

// 扩展名分组定义
const EXTENSION_GROUPS = {
    '视频': ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm'],
    '图片': ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'],
    '音频': ['mp3', 'wav', 'flac', 'aac', 'ogg'],
    '压缩包': ['zip', 'rar', '7z', 'tar', 'gz'],
    '文档': ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'],
    '其他': ['txt', 'csv', 'json', 'xml', 'html', 'css', 'js']
};

interface FileExtensionEditorProps {
    config: FileExtensionRuleConfig;
    onChange: (config: FileExtensionRuleConfig) => void;
}

const FileExtensionEditor: React.FC<FileExtensionEditorProps> = ({ config, onChange }) => {
    const [customExtension, setCustomExtension] = useState('');

    const handleExtensionToggle = (extension: string) => {
        const newExtensions = config.extensions.includes(extension)
            ? config.extensions.filter(e => e !== extension)
            : [...config.extensions, extension];
        
        onChange({
            ...config,
            extensions: newExtensions
        });
    };

    const handleCustomExtensionAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter' || !customExtension.trim()) return;

        const extension = customExtension.trim().toLowerCase().replace(/^\./, '');
        if (!config.extensions.includes(extension)) {
            onChange({
                ...config,
                extensions: [...config.extensions, extension]
            });
        }
        setCustomExtension('');
    };

    return (
        <div className="flex items-center justify-between gap-4">
            {/* 左侧：扩展名选择 */}
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium text-gray-700">
                        扩展名
                    </label>
                </div>
                <div className="space-y-4">
                    {Object.entries(EXTENSION_GROUPS).map(([groupName, extensions]) => (
                        <div key={groupName} className="space-y-2">
                            <div className="text-sm font-medium text-gray-600">{groupName}</div>
                            <div className="flex flex-wrap gap-2">
                                {extensions.map(extension => (
                                    <button
                                        key={extension}
                                        onClick={() => handleExtensionToggle(extension)}
                                        className={`px-2 py-1 text-sm rounded ${
                                            config.extensions.includes(extension)
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {extension}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-gray-600">自定义</div>
                            <input
                                type="text"
                                value={customExtension}
                                onChange={(e) => setCustomExtension(e.target.value)}
                                onKeyDown={handleCustomExtensionAdd}
                                placeholder="输入自定义扩展名并回车"
                                className="px-2 py-1 text-sm border rounded w-48"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {config.extensions
                                .filter(ext => !Object.values(EXTENSION_GROUPS).flat().includes(ext))
                                .map(extension => (
                                    <button
                                        key={extension}
                                        onClick={() => handleExtensionToggle(extension)}
                                        className="px-2 py-1 text-sm rounded bg-blue-100 text-blue-800"
                                    >
                                        {extension}
                                    </button>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>
            
            {/* 右侧：得分系数 */}
            <ScoreMultiplierSelect
                value={config.scoreMultiplier}
                onChange={(value) => onChange({ ...config, scoreMultiplier: value })}
            />
        </div>
    );
};

export default FileExtensionEditor; 