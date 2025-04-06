import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import RuleConfigEditor from '../../RuleConfigEditor';
import RuleItemHeader from './RuleItemHeader';
import { RuleItemProps } from './types';

const RuleItem: React.FC<RuleItemProps> = ({
    rule,
    index,
    isExpanded,
    isValid,
    onToggleExpand,
    onToggleRule,
    onDelete,
    onChange,
    ruleNumber,
    rules
}) => {
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
                    <RuleItemHeader
                        rule={rule}
                        index={index}
                        isExpanded={isExpanded}
                        isValid={isValid}
                        onToggleExpand={onToggleExpand}
                        onToggleRule={onToggleRule}
                        onDelete={onDelete}
                        onChange={onChange}
                        ruleNumber={ruleNumber}
                        provided={provided}
                        rules={rules}
                    />
                    
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