import { PageState } from '../types';
import { MagnetInfo } from '../types/magnet';

export class PageStateManager {
  private url: string;
  private state: PageState | null = null;
  private initPromise: Promise<void> | null = null;

  constructor(url: string) {
    this.url = url;
    console.log('[Magnet保存] PageStateManager构造函数，URL:', url);
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
      console.log('[Magnet保存] 开始初始化页面状态，URL:', this.url);
      console.log('[Magnet保存] 初始化前this.state:', this.state);
      const state = await this.getState();
      console.log('[Magnet保存] 初始化页面状态:', {
        url: this.url,
        existingState: state,
        hasDefaultSave: state?.hasDefaultSave,
        lastUpdate: state?.lastUpdate,
        currentState: this.state
      });

      if (!state) {
        // 创建新的页面状态
        this.state = {
          url: this.url,
          hasDefaultSave: false,
          lastUpdate: Date.now()
        };
        console.log('[Magnet保存] 创建新的页面状态:', {
          newState: this.state,
          currentState: this.state
        });
        await this.saveState();
        console.log('[Magnet保存] 新页面状态保存完成，当前状态:', this.state);
      } else {
        this.state = state;
        console.log('[Magnet保存] 使用现有页面状态:', {
          hasDefaultSave: this.state.hasDefaultSave,
          lastUpdate: this.state.lastUpdate,
          currentState: this.state
        });
      }
      console.log('[Magnet保存] 初始化完成后的this.state:', this.state);
    } catch (error) {
      console.error('[Magnet保存] 初始化页面状态失败:', error);
      // 如果初始化失败，创建一个新的状态
      this.state = {
        url: this.url,
        hasDefaultSave: false,
        lastUpdate: Date.now()
      };
      console.log('[Magnet保存] 创建错误恢复状态:', {
        newState: this.state,
        currentState: this.state
      });
      await this.saveState();
      console.log('[Magnet保存] 错误恢复状态保存完成，当前状态:', this.state);
    }
  }

  // 获取当前页面状态
  async getState(): Promise<PageState | null> {
    try {
      console.log('[Magnet保存] 开始获取页面状态，URL:', this.url);
      console.log('[Magnet保存] getState前的this.state:', this.state);
      return new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { type: 'GET_PAGE_STATE', url: this.url },
          (response) => {
            if (response?.success) {
              console.log('[Magnet保存] 获取页面状态成功:', {
                state: response.state,
                hasDefaultSave: response.state?.hasDefaultSave,
                lastUpdate: response.state?.lastUpdate,
                currentState: this.state
              });
              // 设置this.state
              this.state = response.state;
              console.log('[Magnet保存] 设置this.state后的状态:', this.state);
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
      console.log('[Magnet保存] 开始保存页面状态:', {
        url: this.state.url,
        hasDefaultSave: this.state.hasDefaultSave,
        lastUpdate: this.state.lastUpdate,
        currentState: this.state
      });
      
      await new Promise<void>((resolve, reject) => {
        chrome.runtime.sendMessage(
          { type: 'SAVE_PAGE_STATE', state: this.state },
          (response) => {
            if (response?.success) {
              console.log('[Magnet保存] 保存页面状态成功:', {
                state: this.state,
                response: response,
                currentState: this.state
              });
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
    console.log('[Magnet保存] setDefaultSaved开始，当前this.state:', this.state);
    if (!this.state) {
      console.error('[Magnet保存] 尝试设置空状态的默认保存标记');
      // 如果状态为空，尝试重新初始化
      await this.init();
      console.log('[Magnet保存] 重新初始化后的this.state:', this.state);
      if (!this.state) {
        console.error('[Magnet保存] 重新初始化后状态仍为空');
        return;
      }
    }

    console.log('[Magnet保存] 设置默认保存标记，当前状态:', {
      hasDefaultSave: this.state.hasDefaultSave,
      lastUpdate: this.state.lastUpdate,
      currentState: this.state
    });
    
    this.state.hasDefaultSave = true;
    this.state.lastUpdate = Date.now();
    
    console.log('[Magnet保存] 更新后的状态:', {
      hasDefaultSave: this.state.hasDefaultSave,
      lastUpdate: this.state.lastUpdate,
      currentState: this.state
    });
    
    await this.saveState();
    console.log('[Magnet保存] 默认保存标记设置完成，最终状态:', this.state);
  }

  // 检查是否已执行默认保存
  async hasDefaultSaved(): Promise<boolean> {
    await this.ensureInitialized();
    console.log('[Magnet保存] hasDefaultSaved开始，当前this.state:', this.state);
    const result = this.state?.hasDefaultSave || false;
    console.log('[Magnet保存] 检查是否已执行默认保存:', {
      result,
      state: this.state,
      hasDefaultSave: this.state?.hasDefaultSave,
      lastUpdate: this.state?.lastUpdate,
      currentState: this.state
    });
    return result;
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
        
        console.log('[Magnet保存] 获取已保存状态:', {
          当前页面磁力链接数: currentMagnets.length,
          已保存磁力链接数: savedMagnets.length,
          当前页面已保存数: Array.from(states.values()).filter(v => v).length
        });
        
        resolve(states);
      });
    });
  }

  // 检查是否所有磁力链接都未保存
  async areAllMagnetsUnsaved(currentMagnets: MagnetInfo[]): Promise<boolean> {
    const savedStates = await this.getSavedMagnetStates(currentMagnets);
    const result = Array.from(savedStates.values()).every(state => !state);
    console.log('[Magnet保存] 检查是否所有磁力链接都未保存:', result);
    return result;
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
      console.error('清理页面状态失败');
    }
  }
} 