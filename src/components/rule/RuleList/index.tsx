import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { MagnetRule, RuleType, RuleConfig } from '../../../types/rule';
import { validateRule } from '../utils/validation';
import RuleItem from './RuleItem';
import RuleActions from './RuleActions';
import RuleDescription from './RuleDescription';
import RuleSettings from './RuleSettings';

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
    const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set());
    const [validationResults, setValidationResults] = useState<Map<string, boolean>>(new Map());
    const [ruleNumbers, setRuleNumbers] = useState<Map<string, number>>(new Map());

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

    // 计算规则序号
    useEffect(() => {
        const newRuleNumbers = new Map<string, number>();
        let currentNumber = 1;
        
        rules.forEach(rule => {
            if (rule.enabled) {
                newRuleNumbers.set(rule.id, currentNumber);
                currentNumber++;
            }
        });
        
        setRuleNumbers(newRuleNumbers);
    }, [rules]);

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

    const handleDragEnd = (result: any) => {
        if (!result.destination) return;

        const newRules = [...rules];
        const [removed] = newRules.splice(result.source.index, 1);
        newRules.splice(result.destination.index, 0, removed);

        // 更新规则顺序
        newRules.forEach((rule, index) => {
            rule.order = index;
        });

        onChange(newRules);
    };

    const toggleRuleEnabled = (ruleId: string) => {
        const ruleIndex = rules.findIndex(r => r.id === ruleId);
        if (ruleIndex === -1) return;

        const newRules = [...rules];
        const rule = newRules[ruleIndex];
        newRules[ruleIndex] = {
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
            case RuleType.SHARE_DATE:
                config = {
                    type: RuleType.SHARE_DATE,
                    condition: 'after',
                    date: new Date().toISOString().split('T')[0], // 当前日期，格式为 YYYY-MM-DD
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

        // 添加新规则
        onChange([...rules, newRule]);
    };

    const updateRule = (ruleId: string, config: RuleConfig) => {
        const ruleIndex = rules.findIndex(r => r.id === ruleId);
        if (ruleIndex === -1) return;

        const newRules = [...rules];
        const rule = newRules[ruleIndex];
        newRules[ruleIndex] = {
            ...rule,
            config
        };

        // 校验更新后的规则
        const { isValid } = validateRule(rule.type, config);
        const newValidationResults = new Map(validationResults);
        newValidationResults.set(rule.id, isValid);
        setValidationResults(newValidationResults);

        onChange(newRules);
    };

    const deleteRule = (ruleId: string) => {
        const newRules = rules.filter(r => r.id !== ruleId);
        
        // 更新规则顺序
        newRules.forEach((rule, index) => {
            rule.order = index;
        });

        // 清理相关状态
        setExpandedRules(prev => {
            const next = new Set(prev);
            next.delete(ruleId);
            return next;
        });
        const newValidationResults = new Map(validationResults);
        newValidationResults.delete(ruleId);
        setValidationResults(newValidationResults);

        onChange(newRules);
    };

    return (
        <div className="space-y-6">
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