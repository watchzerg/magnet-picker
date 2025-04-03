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
    ruleNumber: number;
}

const RuleItem: React.FC<RuleItemProps> = ({
    rule,
    index,
    isExpanded,
    isValid,
    onToggleExpand,
    onToggleRule,
    onDelete,
    onChange,
    ruleNumber
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
                    <div 
                        className="flex items-center p-2 gap-2 cursor-pointer hover:bg-gray-50"
                        onClick={() => onToggleExpand(rule.id)}
                    >
                        {/* 左侧元素组 */}
                        <div className="flex items-center gap-2 flex-1">
                            {/* 拖拽标识符 */}
                            <div 
                                {...provided.dragHandleProps} 
                                className="cursor-move text-gray-400"
                                onClick={(e) => e.stopPropagation()}
                            >
                                ⋮⋮
                            </div>
                            
                            {/* 序号标识 */}
                            <div className="min-w-[32px] h-[32px] flex items-center justify-center">
                                {rule.enabled ? (
                                    <div className="w-[28px] h-[28px] rounded-full bg-blue-100 text-blue-800 font-bold text-lg flex items-center justify-center">
                                        {ruleNumber}
                                    </div>
                                ) : (
                                    <div className="w-[28px] h-[28px] rounded-full bg-gray-100 text-gray-400 font-bold text-lg flex items-center justify-center">
                                        -
                                    </div>
                                )}
                            </div>
                            
                            {/* 规则标题 */}
                            <div className="font-bold text-lg text-blue-800 min-w-[120px]">
                                {getRuleTypeName(rule.type)}
                            </div>
                            
                            {/* 规则说明 */}
                            <div className="text-gray-500 flex-1">
                                {rulePreview}
                                {!isValid && (
                                    <span className="ml-2 text-red-500 text-sm">
                                        规则配置无效
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        {/* 右侧按钮组 */}
                        <div className="flex items-center gap-2">
                            {/* 规则启用/禁用按钮 */}
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
                            
                            {/* 中止规则按钮 */}
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
                            
                            {/* 删除按钮 */}
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
                    </div>
                    
                    {/* 展开的规则配置编辑器 */}
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