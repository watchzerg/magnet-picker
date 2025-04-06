import React from 'react';
import { getRuleTypeName } from '../../utils/rule-utils';
import RuleItemStatus from './RuleItemStatus';
import RuleItemPreview from './RuleItemPreview';
import RuleItemActions from './RuleItemActions';
import { RuleItemProps } from './types';

interface RuleItemHeaderProps extends RuleItemProps {
    provided: any;
}

const RuleItemHeader: React.FC<RuleItemHeaderProps> = ({
    rule,
    index,
    isValid,
    onToggleExpand,
    onToggleRule,
    onDelete,
    onChange,
    ruleNumber,
    provided,
    rules
}) => {
    return (
        <div 
            className="flex items-center p-2 gap-2 cursor-pointer hover:bg-gray-50"
            onClick={() => onToggleExpand(rule.id)}
        >
            <div className="flex items-center gap-2 flex-1">
                <div 
                    {...provided.dragHandleProps} 
                    className="cursor-move text-gray-400"
                    onClick={(e) => e.stopPropagation()}
                >
                    ⋮⋮
                </div>
                
                <RuleItemStatus enabled={rule.enabled} ruleNumber={ruleNumber} />
                
                <div className="font-bold text-lg text-blue-800 min-w-[120px]">
                    {getRuleTypeName(rule.type)}
                </div>
                
                <RuleItemPreview rule={rule} isValid={isValid} rules={rules} />
            </div>
            
            <RuleItemActions
                rule={rule}
                index={index}
                isValid={isValid}
                onToggleRule={onToggleRule}
                onDelete={onDelete}
                onChange={onChange}
            />
        </div>
    );
};

export default RuleItemHeader; 