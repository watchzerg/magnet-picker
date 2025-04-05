import { Message } from '../types/message-types';
import { saveMagnets, getMagnets, removeMagnet } from '../services/magnet-service';
import { handleGetPageState, handleSavePageState, handleCleanupPageStates } from '../services/page-state-service';
import { initializeDefaultRules } from '../services/rule-service';

export function setupMessageHandlers() {
  chrome.runtime.onMessage.addListener((
    message: Message,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): boolean => {
    console.log('Background: 收到消息:', message);

    switch (message.type) {
      case 'GET_PAGE_STATE':
        handleGetPageState(message.url!, sendResponse);
        return true;

      case 'SAVE_PAGE_STATE':
        handleSavePageState(message.state!, sendResponse);
        return true;

      case 'SAVE_MAGNET':
      case 'SAVE_MAGNETS':
        const magnetsToSave = message.type === 'SAVE_MAGNET' ? [message.magnet!] : message.data!;
        console.log('Background: 保存磁力链接:', magnetsToSave);
        saveMagnets(magnetsToSave).then(() => {
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

      case 'DELETE_MAGNET':
        console.log('Background: 删除磁力链接:', message.hash);
        removeMagnet(message.hash!).then(() => {
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
        handleCleanupPageStates(message.maxAge!, sendResponse);
        return true;

      default:
        console.warn('Background: 未知消息类型:', message);
        sendResponse({ success: false, error: 'Unknown message type' });
        return false;
    }
  });
} 