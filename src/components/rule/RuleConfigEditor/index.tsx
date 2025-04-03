import React from 'react';
import { RuleType, RuleConfig } from '../../../types/rule';
import FileSizeEditor from './FileSizeEditor';
import FilenameContainsEditor from './FilenameContainsEditor';
import FilenameSuffixEditor from './FilenameSuffixEditor';
import FileExtensionEditor from './FileExtensionEditor';
import FilenameRegexEditor from './FilenameRegexEditor';
import ShareDateEditor from './ShareDateEditor';

interface RuleConfigEditorProps {
    type: RuleType;
    config: RuleConfig;
    onChange: (config: RuleConfig) => void;
}

const RuleConfigEditor: React.FC<RuleConfigEditorProps> = ({ type, config, onChange }) => {
    switch (type) {
        case RuleType.FILE_SIZE:
            return (
                <FileSizeEditor
                    config={config as any}
                    onChange={onChange}
                />
            );
        case RuleType.FILENAME_CONTAINS:
            return (
                <FilenameContainsEditor
                    config={config as any}
                    onChange={onChange}
                />
            );
        case RuleType.FILENAME_SUFFIX:
            return (
                <FilenameSuffixEditor
                    config={config as any}
                    onChange={onChange}
                />
            );
        case RuleType.FILE_EXTENSION:
            return (
                <FileExtensionEditor
                    config={config as any}
                    onChange={onChange}
                />
            );
        case RuleType.FILENAME_REGEX:
            return (
                <FilenameRegexEditor
                    config={config as any}
                    onChange={onChange}
                />
            );
        case RuleType.SHARE_DATE:
            return (
                <ShareDateEditor
                    config={config as any}
                    onChange={onChange}
                />
            );
        default:
            return null;
    }
};

export default RuleConfigEditor; 