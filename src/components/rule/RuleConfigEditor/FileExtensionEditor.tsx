import React from 'react';
import { FileExtensionRuleConfig } from '../../../types/rule';
import ScoreMultiplierSelect from './common/ScoreMultiplierInput';

const COMMON_EXTENSIONS = [
    'mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm',
    'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp',
    'mp3', 'wav', 'flac', 'aac', 'ogg',
    'zip', 'rar', '7z', 'tar', 'gz',
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    'txt', 'csv', 'json', 'xml', 'html', 'css', 'js'
];

interface FileExtensionEditorProps {
    config: FileExtensionRuleConfig;
    onChange: (config: FileExtensionRuleConfig) => void;
}

const FileExtensionEditor: React.FC<FileExtensionEditorProps> = ({ config, onChange }) => {
    const handleExtensionToggle = (extension: string) => {
        const newExtensions = config.extensions.includes(extension)
            ? config.extensions.filter(e => e !== extension)
            : [...config.extensions, extension];
        
        onChange({
            ...config,
            extensions: newExtensions
        });
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
                <div className="flex flex-wrap gap-2">
                    {COMMON_EXTENSIONS.map(extension => (
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
            
            {/* 右侧：得分系数 */}
            <ScoreMultiplierSelect
                value={config.scoreMultiplier}
                onChange={(value) => onChange({ ...config, scoreMultiplier: value })}
            />
        </div>
    );
};

export default FileExtensionEditor; 