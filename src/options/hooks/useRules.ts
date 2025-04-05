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
    console.log('useRules hook初始化');
    const [rules, setRules] = useState<MagnetRule[]>([]);

    useEffect(() => {
        console.log('useRules effect开始执行');
        let mounted = true;

        const loadRules = async () => {
            console.log('开始加载规则配置...');
            const result = await chrome.storage.local.get(['magnetRules']);
            console.log('从storage加载的原始数据:', result);
            
            if (!mounted) {
                console.log('组件已卸载，取消加载');
                return;
            }

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
                console.log('规则已设置到state');
            } else {
                console.log('未找到规则配置或配置无效');
                setRules([]);
            }
        };

        loadRules();
        
        return () => {
            mounted = false;
            console.log('useRules effect清理');
        };
    }, []);

    const handleRulesChange = (newRules: MagnetRule[]) => {
        console.log('保存新的规则配置:', newRules);
        chrome.storage.local.set({ magnetRules: newRules });
        setRules(newRules);
        console.log('新规则已保存并更新到state');
    };

    return {
        rules,
        handleRulesChange
    };
}; 