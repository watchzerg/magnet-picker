/// <reference types="chrome"/>

import { Message, MagnetInfo } from '../types';

console.log('Background: 后台脚本已加载');

chrome.runtime.onMessage.addListener((
  message: Message,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
): boolean => {
  console.log('Background: 收到消息:', message);

  switch (message.type) {
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
        console.log('Background: 返回磁力链接:', magnets);
        sendResponse(magnets);
      }).catch(error => {
        console.error('Background: 获取失败:', error);
        sendResponse([]);
      });
      return true;

    default:
      console.warn('Background: 未知消息类型:', message.type);
      return false;
  }
});

async function saveMagnets(magnets: MagnetInfo[]): Promise<void> {
  try {
    const { magnets: existingMagnets = [] } = await chrome.storage.local.get('magnets');
    const updatedMagnets = [...existingMagnets, ...magnets];
    await chrome.storage.local.set({ magnets: updatedMagnets });
    console.log('Background: 保存完成，总数:', updatedMagnets.length);
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