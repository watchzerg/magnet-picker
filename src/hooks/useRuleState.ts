import { useState, useEffect } from 'react';
import { MagnetRule } from '../types/rule';
import { validateRule } from '../components/rule/utils/validation';

export const useRuleState = (rules: MagnetRule[]) => {
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
    }, [rules]);

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

    return {
        expandedRules,
        validationResults,
        ruleNumbers,
        toggleExpand
    };
}; 