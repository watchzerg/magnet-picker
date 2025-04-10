import React from 'react';
import { RuleType } from '../../../types/rule';

interface RuleActionsProps {
    onAddRule: (type: RuleType) => void;
}

const RuleActions: React.FC<RuleActionsProps> = ({ onAddRule }) => {
    return (
        <div className="flex flex-wrap gap-2">
            <button
                onClick={() => onAddRule(RuleType.FILE_SIZE)}
                className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
            >
                +文件体积规则
            </button>
            <button
                onClick={() => onAddRule(RuleType.FILENAME_CONTAINS)}
                className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
            >
                +文件名关键字规则
            </button>
            <button
                onClick={() => onAddRule(RuleType.FILENAME_SUFFIX)}
                className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
            >
                +文件名后缀规则
            </button>
            <button
                onClick={() => onAddRule(RuleType.FILE_EXTENSION)}
                className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
            >
                +文件扩展名规则
            </button>
            <button
                onClick={() => onAddRule(RuleType.FILENAME_REGEX)}
                className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
            >
                +文件名正则规则
            </button>
            <button
                onClick={() => onAddRule(RuleType.SHARE_DATE)}
                className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
            >
                +分享日期规则
            </button>
        </div>
    );
};

export default RuleActions; 