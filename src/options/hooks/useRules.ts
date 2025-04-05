import { useState, useEffect } from 'react';
import { MagnetRule, RuleType } from '../../types/rule';

// 验证规则配置是否有效
const validateRuleConfig = (rule: any): rule is MagnetRule => {
    console.log('验证规则:', rule);
    
    if (!rule || typeof rule !== 'object') {
        console.log('规则验证失败: 不是有效的对象');
        return false;
    }
    if (typeof rule.id !== 'string') {
        console.log('规则验证失败: id不是字符串');
        return false;
    }
    if (typeof rule.enabled !== 'boolean') {
        console.log('规则验证失败: enabled不是布尔值');
        return false;
    }
    if (typeof rule.order !== 'number') {
        console.log('规则验证失败: order不是数字');
        return false;
    }
    if (!rule.type || !Object.values(RuleType).includes(rule.type)) {
        console.log('规则验证失败: type无效', rule.type, Object.values(RuleType));
        return false;
    }
    if (!rule.config || typeof rule.config !== 'object') {
        console.log('规则验证失败: config不是有效的对象');
        return false;
    }
    if (typeof rule.config.scoreMultiplier !== 'number') {
        console.log('规则验证失败: scoreMultiplier不是数字');
        return false;
    }
    if (typeof rule.config.stopOnMatch !== 'boolean') {
        console.log('规则验证失败: stopOnMatch不是布尔值');
        return false;
    }
    
    console.log('规则验证通过');
    return true;
};

export const useRules = () => {
    const [rules, setRules] = useState<MagnetRule[]>([]);

    useEffect(() => {
        console.log('开始加载规则配置...');
        chrome.storage.local.get(['magnetRules'], (result) => {
            console.log('从storage加载的规则:', result);
            if (result.magnetRules && Array.isArray(result.magnetRules)) {
                console.log('开始验证规则配置...');
                console.log('规则数组:', result.magnetRules);
                const validRules = result.magnetRules.filter(validateRuleConfig);
                if (validRules.length !== result.magnetRules.length) {
                    console.warn('部分规则配置无效，已被过滤');
                    console.log('有效规则数量:', validRules.length);
                    console.log('原始规则数量:', result.magnetRules.length);
                }
                console.log('设置规则到state:', validRules);
                setRules(validRules);
            } else {
                console.log('未找到规则配置或配置无效');
            }
        });
    }, []);

    const handleRulesChange = (newRules: MagnetRule[]) => {
        console.log('保存新的规则配置:', newRules);
        chrome.storage.local.set({ magnetRules: newRules });
        setRules(newRules);
    };

    return {
        rules,
        handleRulesChange
    };
}; 