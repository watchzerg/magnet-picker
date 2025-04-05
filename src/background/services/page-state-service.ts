import { PageState, SessionState } from '../../types';

export async function handleGetPageState(url: string, sendResponse: (response: any) => void) {
  try {
    const result = await chrome.storage.session.get('magnet_picker_page_states');
    const states = result.magnet_picker_page_states as SessionState || {};
    const state = states[url];
    
    console.log('Background: 获取页面状态:', {
      url,
      state,
      allStates: states
    });
    
    sendResponse({ success: true, state: state || null });
  } catch (error) {
    console.error('获取页面状态失败:', error);
    sendResponse({ success: false, error });
  }
}

export async function handleSavePageState(state: PageState, sendResponse: (response: any) => void) {
  try {
    const result = await chrome.storage.session.get('magnet_picker_page_states');
    const states = result.magnet_picker_page_states as SessionState || {};
    
    // 更新状态
    states[state.url] = {
      ...state,
      lastUpdate: Date.now()
    };

    console.log('Background: 保存页面状态:', {
      url: state.url,
      state: states[state.url],
      allStates: states
    });

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

export async function handleCleanupPageStates(maxAge: number, sendResponse: (response: any) => void) {
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