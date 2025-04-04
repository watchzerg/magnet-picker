import { PageState } from '../types';
import { MagnetInfo } from '../types/magnet';

export class PageStateManager {
  private url: string;
  private state: PageState | null = null;
  private initPromise: Promise<void> | null = null;

  constructor(url: string) {
    this.url = url;
    // 立即开始初始化
    this.initPromise = this.init();
  }

  // 确保状态已初始化
  private async ensureInitialized(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
    }
  }

  // 初始化页面状态
  async init(): Promise<void> {
    try {
      const state = await this.getState();

      if (!state) {
        // 创建新的页面状态
        this.state = {
          url: this.url,
          hasDefaultSave: false,
          lastUpdate: Date.now()
        };
        await this.saveState();
      } else {
        this.state = state;
      }
    } catch (error) {
      console.error('[Magnet保存] 初始化页面状态失败:', error);
      // 如果初始化失败，创建一个新的状态
      this.state = {
        url: this.url,
        hasDefaultSave: false,
        lastUpdate: Date.now()
      };
      await this.saveState();
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
              // 设置this.state
              this.state = response.state;
              resolve(response.state);
            } else {
              console.error('[Magnet保存] 获取页面状态失败:', {
                error: response?.error,
                response: response,
                currentState: this.state
              });
              resolve(null);
            }
          }
        );
      });
    } catch (error) {
      console.error('[Magnet保存] 获取页面状态失败:', error);
      return null;
    }
  }

  // 保存当前页面状态
  private async saveState(): Promise<void> {
    if (!this.state) {
      console.error('[Magnet保存] 尝试保存空状态');
      return;
    }

    try {
      await new Promise<void>((resolve, reject) => {
        chrome.runtime.sendMessage(
          { type: 'SAVE_PAGE_STATE', state: this.state },
          (response) => {
            if (response?.success) {
              resolve();
            } else {
              console.error('[Magnet保存] 保存页面状态失败:', {
                error: response?.error,
                response: response,
                currentState: this.state
              });
              reject(new Error('保存页面状态失败'));
            }
          }
        );
      });
    } catch (error) {
      console.error('[Magnet保存] 保存页面状态失败:', error);
      throw error;
    }
  }

  // 设置默认保存状态
  async setDefaultSaved(): Promise<void> {
    await this.ensureInitialized();
    if (!this.state) {
      console.error('[Magnet保存] 尝试设置空状态的默认保存标记');
      // 如果状态为空，尝试重新初始化
      await this.init();
      if (!this.state) {
        console.error('[Magnet保存] 重新初始化后状态仍为空');
        return;
      }
    }
    
    this.state.hasDefaultSave = true;
    this.state.lastUpdate = Date.now();
    await this.saveState();
  }

  // 检查是否已执行默认保存
  async hasDefaultSaved(): Promise<boolean> {
    await this.ensureInitialized();
    return this.state?.hasDefaultSave || false;
  }

  // 获取实际保存的磁力链接状态
  async getSavedMagnetStates(currentMagnets: MagnetInfo[]): Promise<Map<string, boolean>> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'GET_MAGNETS' }, (savedMagnets: MagnetInfo[]) => {
        const savedHashes = new Set(savedMagnets.map(m => m.magnet_hash));
        const states = new Map<string, boolean>();
        
        // 对当前页面的每个magnet，检查是否在已保存列表中
        currentMagnets.forEach(magnet => {
          states.set(magnet.magnet_hash, savedHashes.has(magnet.magnet_hash));
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
              console.error('清理页面状态失败');
              reject(new Error('清理页面状态失败'));
            }
          }
        );
      });
    } catch (error) {
      console.error('清理页面状态失败:', error);
      throw error;
    }
  }
} 