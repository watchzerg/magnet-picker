import React from 'react';
import { FilenameSuffixRuleConfig } from '../../../types/rule';
import TagInput from '../../common/TagInput';
import ScoreMultiplierInput from './common/ScoreMultiplierInput';
import StopOnMatchInput from './common/StopOnMatchInput';

interface FilenameSuffixEditorProps {
    config: FilenameSuffixRuleConfig;
    onChange: (config: FilenameSuffixRuleConfig) => void;
}

const FilenameSuffixEditor: React.FC<FilenameSuffixEditorProps> = ({ config, onChange }) => {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 min-w-[4rem]">
                    后缀
                </label>
                <div className="flex-1">
                    <TagInput
                        tags={config.suffixes}
                        onChange={(suffixes) => onChange({
                            ...config,
                            suffixes
                        })}
                        placeholder="输入后缀后按回车添加"
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

export default FilenameSuffixEditor; 