import { MagnetRule, RuleType, RuleConfig } from '../types/rule';
import { DEFAULT_RULES } from '../utils/rules';

export const useRuleOperations = (
    rules: MagnetRule[],
    onChange: (rules: MagnetRule[]) => void
) => {
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

        onChange(newRules);
    };

    const deleteRule = (ruleId: string) => {
        const newRules = rules.filter(r => r.id !== ruleId);
        
        // 更新规则顺序
        newRules.forEach((rule: MagnetRule, index: number) => {
            rule.order = index;
        });

        onChange(newRules);
    };

    const handleResetToDefault = () => {
        if (window.confirm('确定要重置为默认规则吗？这将清空所有现有规则。')) {
            const defaultRulesWithOrder = DEFAULT_RULES.map((rule: MagnetRule, index: number) => ({
                ...rule,
                order: index
            }));
            onChange(defaultRulesWithOrder);
        }
    };

    return {
        toggleRuleEnabled,
        addRule,
        updateRule,
        deleteRule,
        handleResetToDefault
    };
}; 