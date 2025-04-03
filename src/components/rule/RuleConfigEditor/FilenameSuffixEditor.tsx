import React, { useState } from 'react';
import { FilenameSuffixRuleConfig } from '../../../types/rule';
import ScoreMultiplierSelect from './common/ScoreMultiplierInput';

interface FilenameSuffixEditorProps {
    config: FilenameSuffixRuleConfig;
    onChange: (config: FilenameSuffixRuleConfig) => void;
}

const FilenameSuffixEditor: React.FC<FilenameSuffixEditorProps> = ({ config, onChange }) => {
    const [newSuffix, setNewSuffix] = useState('');

    const handleAddSuffix = () => {
        if (!newSuffix.trim()) return;
        
        onChange({
            ...config,
            suffixes: [...config.suffixes, newSuffix.trim()]
        });
        setNewSuffix('');
    };

    const handleRemoveSuffix = (index: number) => {
        const newSuffixes = [...config.suffixes];
        newSuffixes.splice(index, 1);
        onChange({
            ...config,
            suffixes: newSuffixes
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddSuffix();
        }
    };

    return (
        <div className="flex items-center justify-between gap-4">
            {/* 左侧：后缀输入和显示 */}
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium text-gray-700">
                        后缀
                    </label>
                    <input
                        type="text"
                        value={newSuffix}
                        onChange={(e) => setNewSuffix(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-1/2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="输入后缀并按回车添加"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {config.suffixes.map((suffix, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md"
                        >
                            <span>{suffix}</span>
                            <button
                                onClick={() => handleRemoveSuffix(index)}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                ×
                            </button>
                        </div>
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

export default FilenameSuffixEditor; 