import React from 'react';
import { FilenameContainsRuleConfig } from '../../../types/rule';
import TagInput from '../../common/TagInput';
import ScoreMultiplierInput from './common/ScoreMultiplierInput';
import StopOnMatchInput from './common/StopOnMatchInput';

interface FilenameContainsEditorProps {
    config: FilenameContainsRuleConfig;
    onChange: (config: FilenameContainsRuleConfig) => void;
}

const FilenameContainsEditor: React.FC<FilenameContainsEditorProps> = ({ config, onChange }) => {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 min-w-[4rem]">
                    关键字
                </label>
                <div className="flex-1 max-w-xl">
                    <TagInput
                        tags={config.keywords}
                        onChange={(keywords) => onChange({
                            ...config,
                            keywords
                        })}
                        placeholder="输入关键字后按回车添加"
                    />
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

export default FilenameContainsEditor; 