import { PageState, SessionState } from '../types';

export class PageStateManager {
  private static SESSION_KEY = 'magnet_picker_page_states';
  private url: string;
  private state: PageState | null = null;

  constructor(url: string) {
    this.url = url;
  }

  // 初始化页面状态
  async init(): Promise<void> {
    const state = await this.getState();
    if (!state) {
      // 创建新的页面状态
      this.state = {
        url: this.url,
        savedMagnets: [],
        hasDefaultSave: false,
        lastUpdate: Date.now()
      };
      await this.saveState();
    } else {
      this.state = state;
    }
  }

  // 获取当前页面状态
  async getState(): Promise<PageState | null> {
    try {
      const result = await chrome.storage.session.get(PageStateManager.SESSION_KEY);
      const states = result[PageStateManager.SESSION_KEY] as SessionState || {};
      return states[this.url] || null;
    } catch (error) {
      console.error('获取页面状态失败:', error);
      return null;
    }
  }

  // 保存当前页面状态
  private async saveState(): Promise<void> {
    if (!this.state) return;

    try {
      const result = await chrome.storage.session.get(PageStateManager.SESSION_KEY);
      const states = result[PageStateManager.SESSION_KEY] as SessionState || {};
      
      // 更新状态
      states[this.url] = {
        ...this.state,
        lastUpdate: Date.now()
      };

      // 保存到会话存储
      await chrome.storage.session.set({
        [PageStateManager.SESSION_KEY]: states
      });
    } catch (error) {
      console.error('保存页面状态失败:', error);
    }
  }

  // 添加已保存的磁力链接
  async addSavedMagnets(hashes: string[]): Promise<void> {
    if (!this.state) return;

    // 添加新的哈希值，确保不重复
    const newHashes = hashes.filter(hash => !this.state?.savedMagnets.includes(hash));
    if (newHashes.length > 0) {
      this.state.savedMagnets = [...this.state.savedMagnets, ...newHashes];
      await this.saveState();
    }
  }

  // 移除已保存的磁力链接
  async removeSavedMagnet(hash: string): Promise<void> {
    if (!this.state) return;

    this.state.savedMagnets = this.state.savedMagnets.filter(h => h !== hash);
    await this.saveState();
  }

  // 设置默认保存状态
  async setDefaultSaved(): Promise<void> {
    if (!this.state) return;

    this.state.hasDefaultSave = true;
    await this.saveState();
  }

  // 检查是否已执行默认保存
  hasDefaultSaved(): boolean {
    return this.state?.hasDefaultSave || false;
  }

  // 获取已保存的磁力链接哈希值列表
  getSavedMagnets(): string[] {
    return this.state?.savedMagnets || [];
  }

  // 清理过期的页面状态（可选，在合适的时机调用）
  static async cleanup(maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
    try {
      const result = await chrome.storage.session.get(PageStateManager.SESSION_KEY);
      const states = result[PageStateManager.SESSION_KEY] as SessionState || {};
      const now = Date.now();

      // 过滤掉超过指定时间的状态
      const cleanedStates = Object.entries(states).reduce((acc, [url, state]) => {
        if (now - state.lastUpdate < maxAge) {
          acc[url] = state;
        }
        return acc;
      }, {} as SessionState);

      await chrome.storage.session.set({
        [PageStateManager.SESSION_KEY]: cleanedStates
      });
    } catch (error) {
      console.error('清理页面状态失败:', error);
    }
  }
} 