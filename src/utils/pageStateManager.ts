import { PageState } from '../types';
import { MagnetInfo } from '../types/magnet';

export class PageStateManager {
  private url: string;
  private state: PageState | null = null;

  constructor(url: string) {
    this.url = url;
  }

  // 初始化页面状态
  async init(): Promise<void> {
    const state = await this.getState();
    if (!state) {
      // 创建新的页面状态，只保存是否已执行默认保存的状态
      this.state = {
        url: this.url,
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
      return new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { type: 'GET_PAGE_STATE', url: this.url },
          (response) => {
            if (response?.success) {
              resolve(response.state);
            } else {
              console.error('获取页面状态失败:', response?.error);
              resolve(null);
            }
          }
        );
      });
    } catch (error) {
      console.error('获取页面状态失败:', error);
      return null;
    }
  }

  // 保存当前页面状态
  private async saveState(): Promise<void> {
    if (!this.state) return;

    try {
      await new Promise<void>((resolve, reject) => {
        chrome.runtime.sendMessage(
          { type: 'SAVE_PAGE_STATE', state: this.state },
          (response) => {
            if (response?.success) {
              resolve();
            } else {
              console.error('保存页面状态失败:', response?.error);
              reject(new Error('保存页面状态失败'));
            }
          }
        );
      });
    } catch (error) {
      console.error('保存页面状态失败:', error);
      throw error;
    }
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

  // 获取实际保存的磁力链接状态
  async getSavedMagnetStates(currentMagnets: MagnetInfo[]): Promise<Map<string, boolean>> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'GET_MAGNETS' }, (savedMagnets: MagnetInfo[]) => {
        const savedHashes = new Set(savedMagnets.map(m => m.hash));
        const states = new Map<string, boolean>();
        
        // 对当前页面的每个magnet，检查是否在已保存列表中
        currentMagnets.forEach(magnet => {
          states.set(magnet.hash, savedHashes.has(magnet.hash));
        });
        
        resolve(states);
      });
    });
  }

  // 检查是否所有磁力链接都未保存
  async areAllMagnetsUnsaved(currentMagnets: MagnetInfo[]): Promise<boolean> {
    const savedStates = await this.getSavedMagnetStates(currentMagnets);
    return Array.from(savedStates.values()).every(state => !state);
  }

  // 清理过期的页面状态（可选，在合适的时机调用）
  static async cleanup(maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
    try {
      await new Promise<void>((resolve, reject) => {
        chrome.runtime.sendMessage(
          { type: 'CLEANUP_PAGE_STATES', maxAge },
          (response) => {
            if (response?.success) {
              resolve();
            } else {
              console.error('清理页面状态失败:', response?.error);
              reject(new Error('清理页面状态失败'));
            }
          }
        );
      });
    } catch (error) {
      console.error('清理页面状态失败:', error);
    }
  }
} 