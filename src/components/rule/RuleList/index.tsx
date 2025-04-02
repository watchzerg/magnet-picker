import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { MagnetRule, RuleType, RuleConfig } from '../../../types/rule';
import { validateRule } from '../utils/validation';
import RuleItem from './RuleItem';
import RuleActions from './RuleActions';

interface RuleListProps {
    rules: MagnetRule[];
    onChange: (rules: MagnetRule[]) => void;
}

const RuleList: React.FC<RuleListProps> = ({ rules, onChange }) => {
    const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set());
    const [validationResults, setValidationResults] = useState<Map<string, boolean>>(new Map());

    // 初始化时校验所有规则
    useEffect(() => {
        const newValidationResults = new Map<string, boolean>();
        rules.forEach(rule => {
            const { isValid } = validateRule(rule.type, rule.config);
            newValidationResults.set(rule.id, isValid);
            // 如果规则无效，确保它是展开的
            if (!isValid && !expandedRules.has(rule.id)) {
                setExpandedRules(prev => new Set([...prev, rule.id]));
            }
        });
        setValidationResults(newValidationResults);
    }, []);

    const toggleExpand = (ruleId: string) => {
        const isValid = validationResults.get(ruleId);
        if (!isValid) return; // 如果规则无效，不允许折叠

        setExpandedRules(prev => {
            const next = new Set(prev);
            if (next.has(ruleId)) {
                next.delete(ruleId);
            } else {
                next.add(ruleId);
            }
            return next;
        });
    };

    const handleRuleChange = (index: number, rule: MagnetRule) => {
        const newRules = [...rules];
        newRules[index] = rule;

        // 校验规则
        const { isValid } = validateRule(rule.type, rule.config);
        const newValidationResults = new Map(validationResults);
        newValidationResults.set(rule.id, isValid);
        setValidationResults(newValidationResults);

        // 如果规则无效，确保它是展开的并且未启用
        if (!isValid) {
            setExpandedRules(prev => new Set([...prev, rule.id]));
            rule.enabled = false;
        }

        onChange(newRules);
    };

    const handleDragEnd = (result: any) => {
        if (!result.destination) return;

        const newRules = [...rules];
        const [removed] = newRules.splice(result.source.index, 1);
        newRules.splice(result.destination.index, 0, removed);
        onChange(newRules);
    };

    const toggleRule = (index: number) => {
        const rule = rules[index];
        const isValid = validationResults.get(rule.id);
        
        // 如果规则无效，不允许启用
        if (!isValid) return;

        const newRules = [...rules];
        newRules[index] = {
            ...rule,
            enabled: !rule.enabled
        };
        onChange(newRules);
    };

    const addRule = (type: RuleType) => {
        let config: RuleConfig;
        switch (type) {
            case RuleType.FILE_SIZE:
                config = {
                    type: RuleType.FILE_SIZE,
                    condition: 'greater',
                    threshold: 5 * 1024 * 1024 * 1024, // 5GB
                    scoreMultiplier: 1.0,
                    stopOnMatch: false
                };
                break;
            case RuleType.FILENAME_CONTAINS:
                config = {
                    type: RuleType.FILENAME_CONTAINS,
                    keywords: [],
                    scoreMultiplier: 1.0,
                    stopOnMatch: false
                };
                break;
            case RuleType.FILENAME_SUFFIX:
                config = {
                    type: RuleType.FILENAME_SUFFIX,
                    suffixes: [],
                    scoreMultiplier: 1.0,
                    stopOnMatch: false
                };
                break;
            case RuleType.FILE_EXTENSION:
                config = {
                    type: RuleType.FILE_EXTENSION,
                    extensions: [],
                    scoreMultiplier: 1.0,
                    stopOnMatch: false
                };
                break;
            case RuleType.FILENAME_REGEX:
                config = {
                    type: RuleType.FILENAME_REGEX,
                    pattern: '',
                    scoreMultiplier: 1.0,
                    stopOnMatch: false
                };
                break;
            default:
                throw new Error('Unknown rule type');
        }

        const newRule: MagnetRule = {
            id: Date.now().toString(),
            type,
            enabled: false,
            order: rules.length,
            config
        };

        // 校验新规则
        const { isValid } = validateRule(newRule.type, newRule.config);
        const newValidationResults = new Map(validationResults);
        newValidationResults.set(newRule.id, isValid);
        setValidationResults(newValidationResults);

        // 新规则默认展开
        setExpandedRules(prev => new Set([...prev, newRule.id]));

        onChange([...rules, newRule]);
    };

    const deleteRule = (index: number) => {
        const newRules = [...rules];
        const deletedRule = newRules[index];
        
        // 清除相关状态
        const newValidationResults = new Map(validationResults);
        newValidationResults.delete(deletedRule.id);
        setValidationResults(newValidationResults);

        setExpandedRules(prev => {
            const next = new Set(prev);
            next.delete(deletedRule.id);
            return next;
        });

        newRules.splice(index, 1);
        onChange(newRules);
    };

    return (
        <div className="space-y-4">
            <RuleActions onAddRule={addRule} />

            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="rules">
                    {(provided) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-2"
                        >
                            {rules.map((rule, index) => (
                                <RuleItem
                                    key={rule.id}
                                    rule={rule}
                                    index={index}
                                    isExpanded={expandedRules.has(rule.id)}
                                    isValid={validationResults.get(rule.id) || false}
                                    onToggleExpand={toggleExpand}
                                    onToggleRule={toggleRule}
                                    onDelete={deleteRule}
                                    onChange={handleRuleChange}
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