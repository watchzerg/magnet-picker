import React from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { MagnetRule } from '../../../types/rule';
import { validateRule } from '../utils/validation';
import RuleItem from './RuleItem';
import RuleActions from './RuleActions';
import RuleDescription from './RuleDescription';
import RuleSettings from './RuleSettings';
import { useRuleState } from '../../../hooks/useRuleState';
import { useRuleOperations } from '../../../hooks/useRuleOperations';
import { useRuleDragDrop } from '../../../hooks/useRuleDragDrop';

interface RuleListProps {
    rules: MagnetRule[];
    initialSettings: {
        requiredThreshold: number;
        preferredThreshold: number;
        targetCount: number;
    };
    onChange: (rules: MagnetRule[]) => void;
    onSettingsChange: (settings: {
        requiredThreshold: number;
        preferredThreshold: number;
        targetCount: number;
    }) => void;
}

const RuleList: React.FC<RuleListProps> = ({ rules, initialSettings, onChange, onSettingsChange }) => {
    const {
        expandedRules,
        validationResults,
        ruleNumbers,
        toggleExpand
    } = useRuleState(rules);

    const {
        toggleRuleEnabled,
        addRule,
        updateRule,
        deleteRule,
        handleResetToDefault
    } = useRuleOperations(rules, onChange);

    const {
        handleDragEnd
    } = useRuleDragDrop(rules, onChange);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">规则配置</h2>
                <button
                    onClick={handleResetToDefault}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                    重置为默认规则
                </button>
            </div>
            <RuleDescription />
            
            <RuleSettings
                onSettingsChange={onSettingsChange}
                initialSettings={initialSettings}
            />
            
            <RuleActions onAddRule={addRule} />

            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="rules">
                    {(provided) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-4"
                        >
                            {rules.map((rule, index) => (
                                <RuleItem
                                    key={rule.id}
                                    rule={rule}
                                    index={index}
                                    isExpanded={expandedRules.has(rule.id)}
                                    isValid={validationResults.get(rule.id) ?? true}
                                    ruleNumber={ruleNumbers.get(rule.id) || 0}
                                    onToggleExpand={(ruleId) => toggleExpand(ruleId)}
                                    onToggleRule={(index) => toggleRuleEnabled(rules[index].id)}
                                    onChange={(index, rule) => updateRule(rule.id, rule.config)}
                                    onDelete={(index) => deleteRule(rules[index].id)}
                                    rules={rules}
                                />
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};

export default RuleList; 