import React, { useState } from 'react';
import { FilenameContainsRuleConfig } from '../../../types/rule';
import ScoreMultiplierSelect from './common/ScoreMultiplierInput';

interface FilenameContainsEditorProps {
    config: FilenameContainsRuleConfig;
    onChange: (config: FilenameContainsRuleConfig) => void;
}

const FilenameContainsEditor: React.FC<FilenameContainsEditorProps> = ({
    config,
    onChange
}) => {
    const [newKeyword, setNewKeyword] = useState('');

    const handleAddKeyword = () => {
        if (!newKeyword.trim()) return;
        
        onChange({
            ...config,
            keywords: [...config.keywords, newKeyword.trim()]
        });
        setNewKeyword('');
    };

    const handleRemoveKeyword = (index: number) => {
        const newKeywords = [...config.keywords];
        newKeywords.splice(index, 1);
        onChange({
            ...config,
            keywords: newKeywords
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddKeyword();
        }
    };

    return (
        <div className="flex items-center justify-between gap-4">
            {/* 左侧：关键字输入和显示 */}
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium text-gray-700">
                        关键字
                    </label>
                    <input
                        type="text"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="输入关键字并按回车添加"
                        className="w-1/2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {config.keywords.map((keyword, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md"
                        >
                            <span>{keyword}</span>
                            <button
                                onClick={() => handleRemoveKeyword(index)}
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

export default FilenameContainsEditor; 