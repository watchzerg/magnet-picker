import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { MagnetRule } from '../../../types/rule';
import RuleConfigEditor from '../RuleConfigEditor';
import { getRulePreview, getRuleTypeName } from '../utils/rule-utils';

interface RuleItemProps {
    rule: MagnetRule;
    index: number;
    isExpanded: boolean;
    isValid: boolean;
    onToggleExpand: (ruleId: string) => void;
    onToggleRule: (index: number) => void;
    onDelete: (index: number) => void;
    onChange: (index: number, rule: MagnetRule) => void;
}

const RuleItem: React.FC<RuleItemProps> = ({
    rule,
    index,
    isExpanded,
    isValid,
    onToggleExpand,
    onToggleRule,
    onDelete,
    onChange
}) => {
    const rulePreview = getRulePreview(rule.type, rule.config);

    return (
        <Draggable
            key={rule.id}
            draggableId={rule.id}
            index={index}
        >
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className="border rounded bg-white"
                >
                    <div className="flex items-center p-2 gap-2">
                        <div {...provided.dragHandleProps} className="cursor-move">
                            ⋮⋮
                        </div>
                        <input
                            type="checkbox"
                            checked={rule.enabled}
                            disabled={!isValid}
                            onChange={() => onToggleRule(index)}
                            className={`w-4 h-4 ${!isValid ? 'cursor-not-allowed opacity-50' : ''}`}
                        />
                        <button
                            onClick={() => onToggleExpand(rule.id)}
                            disabled={!isValid}
                            className={`flex-1 text-left ${!isValid ? 'cursor-not-allowed' : 'hover:bg-gray-50'}`}
                        >
                            <span className="font-medium">{getRuleTypeName(rule.type)}</span>
                            <span className="ml-2 text-gray-500">{rulePreview}</span>
                            {!isValid && (
                                <span className="ml-2 text-red-500 text-sm">
                                    规则配置无效
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => onDelete(index)}
                            className="text-red-500 hover:text-red-600"
                        >
                            删除
                        </button>
                    </div>
                    {isExpanded && (
                        <div className="p-2 border-t">
                            <RuleConfigEditor
                                type={rule.type}
                                config={rule.config}
                                onChange={(config) => onChange(index, { ...rule, config })}
                            />
                        </div>
                    )}
                </div>
            )}
        </Draggable>
    );
};

export default RuleItem; 