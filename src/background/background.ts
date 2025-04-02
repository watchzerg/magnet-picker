/// <reference types="chrome"/>

import { Message } from '../types';
import { MagnetInfo } from '../types/magnet';

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

    default:
      console.warn('Background: 未知消息类型:', message.type);
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