import { DEFAULT_RULES } from '../../utils/rules';

export async function initializeDefaultRules() {
  try {
    console.log('开始初始化默认规则...');
    const result = await chrome.storage.local.get(['magnetRules']);
    console.log('当前存储状态:', result);
    console.log('默认规则配置:', DEFAULT_RULES);
    
    if (!result.magnetRules || !Array.isArray(result.magnetRules) || result.magnetRules.length === 0) {
      console.log('正在设置默认规则...');
      const rulesWithOrder = DEFAULT_RULES.map((rule, index) => ({
        ...rule,
        order: index
      }));
      await chrome.storage.local.set({ magnetRules: rulesWithOrder });
      console.log('默认规则设置完成，规则内容:', rulesWithOrder);
      return true; // 返回true表示初始化了新的规则
    } else {
      console.log('已存在规则配置，跳过默认规则初始化');
      console.log('现有规则:', result.magnetRules);
      return false; // 返回false表示使用了现有规则
    }
  } catch (error) {
    console.error('初始化默认规则失败:', error);
    return false;
  }
} 