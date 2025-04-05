import React from 'react';
import { MagnetRule } from '../../../../types/rule';

interface RuleItemActionsProps {
    rule: MagnetRule;
    index: number;
    isValid: boolean;
    onToggleRule: (index: number) => void;
    onDelete: (index: number) => void;
    onChange: (index: number, rule: MagnetRule) => void;
}

const RuleItemActions: React.FC<RuleItemActionsProps> = ({
    rule,
    index,
    isValid,
    onToggleRule,
    onDelete,
    onChange
}) => {
    return (
        <div className="flex items-center gap-2">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleRule(index);
                }}
                disabled={!isValid}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    rule.enabled 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } ${!isValid ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {rule.enabled ? '规则已启用' : '规则已禁用'}
            </button>
            
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    const newRule = {
                        ...rule,
                        config: {
                            ...rule.config,
                            stopOnMatch: !rule.config.stopOnMatch
                        }
                    };
                    onChange(index, newRule);
                }}
                disabled={!isValid}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    rule.config.stopOnMatch 
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } ${!isValid ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {rule.config.stopOnMatch ? '启用匹配中止' : '禁用匹配中止'}
            </button>
            
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(index);
                }}
                className="px-3 py-1 rounded-md text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
            >
                删除
            </button>
        </div>
    );
};

export default RuleItemActions; 