import { ShareDateRuleConfig } from '../../types/rule';

/**
 * 检查分享日期是否匹配规则
 */
export const checkShareDate = (date: string, config: ShareDateRuleConfig): boolean => {
    if (!date) return false;
    
    const shareDate = new Date(date);
    const ruleDate = new Date(config.date);
    
    if (config.condition === 'after') {
        return shareDate >= ruleDate;
    } else if (config.condition === 'before') {
        return shareDate <= ruleDate;
    }
    
    return false;
}; 