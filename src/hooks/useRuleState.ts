import { useState, useMemo } from 'react';
import { MagnetRule } from '../types/rule';
import { validateRule } from '../components/rule/utils/validation';

export const useRuleState = (rules: MagnetRule[]) => {
    const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set());
    const [validationResults, setValidationResults] = useState<Map<string, boolean>>(new Map());
    const [ruleNumbers, setRuleNumbers] = useState<Map<string, number>>(new Map());

    // 更新验证结果
    useMemo(() => {
        const newValidationResults = new Map<string, boolean>();
        rules.forEach(rule => {
            const { isValid } = validateRule(rule.type, rule.config, rule, rules);
            newValidationResults.set(rule.id, isValid);
            // 如果规则无效，确保它是展开的
            if (!isValid && !expandedRules.has(rule.id)) {
                setExpandedRules(prev => new Set([...prev, rule.id]));
            }
        });
        setValidationResults(newValidationResults);
    }, [rules]);

    // 更新规则编号
    useMemo(() => {
        const newRuleNumbers = new Map<string, number>();
        rules.forEach((rule, index) => {
            newRuleNumbers.set(rule.id, index + 1);
        });
        setRuleNumbers(newRuleNumbers);
    }, [rules]);

    const toggleExpand = (ruleId: string) => {
        const isValid = validationResults.get(ruleId);
        if (!isValid) return; // 如果规则无效，不允许折叠

        setExpandedRules(prev => {
            const newSet = new Set(prev);
            if (newSet.has(ruleId)) {
                newSet.delete(ruleId);
            } else {
                newSet.add(ruleId);
            }
            return newSet;
        });
    };

    return {
        expandedRules,
        validationResults,
        ruleNumbers,
        toggleExpand
    };
}; 