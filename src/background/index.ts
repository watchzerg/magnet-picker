/// <reference types="chrome"/>

import { setupMessageHandlers } from './handlers/message-handler';
import { initializeDefaultRules } from './services/rule-service';

console.log('Background: 后台脚本已加载');

// 设置消息处理器
setupMessageHandlers();

// 监听扩展安装事件
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('扩展安装/更新事件:', details);
  if (details.reason === 'install') {
    console.log('首次安装，开始初始化默认规则...');
    const rulesInitialized = await initializeDefaultRules();
    
    // 等待一小段时间确保规则已经保存
    if (rulesInitialized) {
      setTimeout(() => {
        console.log('打开选项页面...');
        chrome.tabs.create({
          url: chrome.runtime.getURL('options/options.html?tab=rules')
        });
      }, 500);
    }
  }
}); 