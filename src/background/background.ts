/// <reference types="chrome"/>

import { Message } from '../types';
import { MagnetInfo } from '../types/magnet';
import { PageState, SessionState } from '../types';

console.log('Background: 后台脚本已加载');

// 监听来自 content script 的消息
chrome.runtime.onMessage.addListener((
  message: Message,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
): boolean => {
  console.log('Background: 收到消息:', message);

  switch (message.type) {
    case 'GET_PAGE_STATE':
      handleGetPageState(message.url, sendResponse);
      return true;

    case 'SAVE_PAGE_STATE':
      handleSavePageState(message.state, sendResponse);
      return true;

    case 'SAVE_MAGNETS':
      console.log('Background: 保存磁力链接:', message.data);
      saveMagnets(message.data).then(() => {
        console.log('Background: 磁力链接保存成功');
        sendResponse({ success: true });
      }).catch(error => {
        console.error('Background: 保存失败:', error);
        sendResponse({ success: false, error: error.message });
      });
      return true;

    case 'GET_MAGNETS':
      console.log('Background: 获取磁力链接');
      getMagnets().then(magnets => {
        console.log('Background: 获取成功，数量:', magnets.length);
        console.log('Background: 返回磁力链接:', magnets);
        sendResponse(magnets);
      }).catch(error => {
        console.error('Background: 获取失败:', error);
        sendResponse([]);
      });
      return true;

    case 'REMOVE_MAGNET':
      console.log('Background: 删除磁力链接:', message.data);
      removeMagnet(message.data).then(() => {
        console.log('Background: 磁力链接删除成功');
        sendResponse({ success: true });
      }).catch(error => {
        console.error('Background: 删除失败:', error);
        sendResponse({ success: false, error: error.message });
      });
      return true;

    case 'PARSE_MAGNETS':
      console.log('Background: 收到解析磁力链接请求');
      return false;

    case 'CLEANUP_PAGE_STATES':
      handleCleanupPageStates(message.maxAge, sendResponse);
      return true;

    default:
      console.warn('Background: 未知消息类型:', message);
      sendResponse({ success: false, error: 'Unknown message type' });
      return false;
  }
});

async function saveMagnets(magnets: MagnetInfo[]): Promise<void> {
  try {
    const { magnets: existingMagnets = [] } = await chrome.storage.local.get('magnets');
    
    // 创建现有磁力链接的哈希集合
    const existingHashes = new Set(existingMagnets.map((m: MagnetInfo) => m.hash));
    
    // 过滤掉已存在的磁力链接
    const newMagnets = magnets.filter(magnet => !existingHashes.has(magnet.hash));
    
    // 如果没有新的磁力链接，直接返回
    if (newMagnets.length === 0) {
      console.log('Background: 所有磁力链接已存在，无需保存');
      return;
    }
    
    const updatedMagnets = [...existingMagnets, ...newMagnets];
    await chrome.storage.local.set({ magnets: updatedMagnets });
    console.log('Background: 保存完成，新增:', newMagnets.length, '总数:', updatedMagnets.length);
  } catch (error) {
    console.error('Background: 保存出错:', error);
    throw error;
  }
}

async function getMagnets(): Promise<MagnetInfo[]> {
  try {
    const { magnets = [] } = await chrome.storage.local.get('magnets');
    console.log('Background: 获取成功，数量:', magnets.length);
    return magnets;
  } catch (error) {
    console.error('Background: 获取出错:', error);
    return [];
  }
}

async function removeMagnet(magnet: MagnetInfo): Promise<void> {
  try {
    const { magnets: existingMagnets = [] } = await chrome.storage.local.get('magnets');
    
    // 过滤掉要删除的磁力链接
    const updatedMagnets = existingMagnets.filter((m: MagnetInfo) => m.hash !== magnet.hash);
    
    // 如果没有找到要删除的磁力链接
    if (updatedMagnets.length === existingMagnets.length) {
      console.log('Background: 未找到要删除的磁力链接');
      return;
    }
    
    await chrome.storage.local.set({ magnets: updatedMagnets });
    console.log('Background: 删除完成，剩余:', updatedMagnets.length);
  } catch (error) {
    console.error('Background: 删除出错:', error);
    throw error;
  }
}

// 处理获取页面状态
async function handleGetPageState(url: string, sendResponse: (response: any) => void) {
  try {
    const result = await chrome.storage.session.get('magnet_picker_page_states');
    const states = result.magnet_picker_page_states as SessionState || {};
    sendResponse({ success: true, state: states[url] || null });
  } catch (error) {
    console.error('获取页面状态失败:', error);
    sendResponse({ success: false, error });
  }
}

// 处理保存页面状态
async function handleSavePageState(state: PageState, sendResponse: (response: any) => void) {
  try {
    const result = await chrome.storage.session.get('magnet_picker_page_states');
    const states = result.magnet_picker_page_states as SessionState || {};
    
    // 更新状态
    states[state.url] = {
      ...state,
      lastUpdate: Date.now()
    };

    // 保存到会话存储
    await chrome.storage.session.set({
      'magnet_picker_page_states': states
    });
    
    sendResponse({ success: true });
  } catch (error) {
    console.error('保存页面状态失败:', error);
    sendResponse({ success: false, error });
  }
}

// 处理清理页面状态
async function handleCleanupPageStates(maxAge: number, sendResponse: (response: any) => void) {
  try {
    const result = await chrome.storage.session.get('magnet_picker_page_states');
    const states = result.magnet_picker_page_states as SessionState || {};
    const now = Date.now();

    // 过滤掉超过指定时间的状态
    const cleanedStates = Object.entries(states).reduce((acc, [url, state]) => {
      if (now - state.lastUpdate < maxAge) {
        acc[url] = state;
      }
      return acc;
    }, {} as SessionState);

    await chrome.storage.session.set({
      'magnet_picker_page_states': cleanedStates
    });
    
    sendResponse({ success: true });
  } catch (error) {
    console.error('清理页面状态失败:', error);
    sendResponse({ success: false, error });
  }
} 