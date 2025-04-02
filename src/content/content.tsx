/// <reference types="chrome"/>

import { createRoot, Root as ReactDOMRoot } from 'react-dom/client';
import { MagnetInfo } from '../types/magnet';
import { MagnetPanel } from '../components/MagnetPanel';
import { PageStateManager } from '../utils/pageStateManager';
import { parseFileSize, selectMagnetsByScore, sortMagnetsByScore } from '../utils/magnet';

class MagnetPicker {
  private button: HTMLButtonElement | null = null;
  private panelContainer: HTMLDivElement | null = null;
  private root: ReactDOMRoot | null = null;
  private isPanelVisible: boolean = false;
  private pageStateManager: PageStateManager;
  private currentMagnets: MagnetInfo[] = [];
  private storageChangeListener: ((changes: { [key: string]: chrome.storage.StorageChange }) => void) | null = null;

  constructor() {
    console.log('MagnetPicker: 初始化');
    this.pageStateManager = new PageStateManager(window.location.href);
    this.initStorageListener();
    this.init();
  }

  private initStorageListener() {
    this.storageChangeListener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.magnets && this.isPanelVisible) {
        console.log('MagnetPicker: 检测到磁力链接存储变化，更新面板状态');
        // 重新获取当前磁力链接的保存状态并更新面板
        this.pageStateManager.getSavedMagnetStates(this.currentMagnets).then(savedStates => {
          if (this.root && this.panelContainer) {
            this.root.render(
              <MagnetPanel
                magnets={sortMagnetsByScore(this.currentMagnets)}
                savedStates={savedStates}
                onClose={() => this.closePanel()}
                onToggleSave={this.handleToggleSave.bind(this)}
              />
            );
          }
        });
      }
    };

    chrome.storage.onChanged.addListener(this.storageChangeListener);
  }

  private closePanel() {
    if (!this.isPanelVisible) return;
    console.log('MagnetPicker: 关闭面板');
    this.isPanelVisible = false;
    if (this.root) {
      this.root.render(null);
    }
    if (this.panelContainer) {
      this.panelContainer.style.display = 'none';
    }
  }

  private handleToggleSave(magnet: MagnetInfo, isSaved: boolean) {
    if (isSaved) {
      // 取消保存
      console.log('MagnetPicker: 取消保存磁力链接:', magnet.fileName);
      chrome.runtime.sendMessage({
        type: 'REMOVE_MAGNET',
        data: magnet
      }, async (response) => {
        if (response?.success) {
          this.showSuccessMessage('已取消保存');
        } else {
          this.showErrorMessage('取消保存失败，请重试');
        }
      });
    } else {
      // 保存
      console.log('MagnetPicker: 保存磁力链接:', magnet.fileName);
      chrome.runtime.sendMessage({
        type: 'SAVE_MAGNETS',
        data: [magnet]
      }, async (response) => {
        if (response?.success) {
          this.showSuccessMessage('保存成功');
        } else {
          this.showErrorMessage('保存失败，请重试');
        }
      });
    }
  }

  public destroy() {
    console.log('MagnetPicker: 销毁实例');
    if (this.storageChangeListener) {
      chrome.storage.onChanged.removeListener(this.storageChangeListener);
    }
    this.closePanel();
    if (this.button) {
      this.button.remove();
      this.button = null;
    }
    if (this.panelContainer) {
      this.panelContainer.remove();
      this.panelContainer = null;
    }
    this.root = null;
  }

  private async init(): Promise<void> {
    if (this.isValidPage()) {
      console.log('MagnetPicker: 有效页面，创建按钮');
      await this.pageStateManager.init();
      this.createFloatingButton();
      this.createPanelContainer();
    } else {
      console.log('MagnetPicker: 无效页面，URL:', window.location.href);
    }
  }

  private isValidPage(): boolean {
    const url = window.location.href;
    const pattern = /^https:\/\/www\.javbus\.com\/[A-Z]+-\d+$/;
    return pattern.test(url);
  }

  private createFloatingButton(): void {
    this.button = document.createElement('button');
    this.button.className = 'magnet-picker-button';
    this.button.textContent = '解析磁力链接';
    this.button.addEventListener('click', () => {
      console.log('MagnetPicker: 按钮被点击');
      this.parseMagnets();
    });
    document.body.appendChild(this.button);
    console.log('MagnetPicker: 浮动按钮已创建');
  }

  private createPanelContainer(): void {
    console.log('MagnetPicker: 开始创建面板容器');
    
    // 移除已存在的面板容器
    const existingContainer = document.getElementById('magnet-picker-panel');
    if (existingContainer) {
      console.log('MagnetPicker: 移除已存在的面板容器');
      existingContainer.remove();
    }

    // 创建新的面板容器
    this.panelContainer = document.createElement('div');
    this.panelContainer.id = 'magnet-picker-panel';
    this.panelContainer.style.position = 'fixed';
    this.panelContainer.style.top = '0';
    this.panelContainer.style.right = '0';
    this.panelContainer.style.zIndex = '999999';
    this.panelContainer.style.display = 'block';
    this.panelContainer.style.width = '100%';
    this.panelContainer.style.height = '100%';
    this.panelContainer.style.pointerEvents = 'none';
    
    // 创建一个内部容器用于实际内容
    const innerContainer = document.createElement('div');
    innerContainer.style.position = 'absolute';
    innerContainer.style.top = '20px';
    innerContainer.style.right = '20px';
    innerContainer.style.width = '360px';
    innerContainer.style.maxHeight = '60vh';
    innerContainer.style.overflow = 'auto';
    innerContainer.style.pointerEvents = 'auto';
    innerContainer.style.backgroundColor = '#ffffff';
    innerContainer.style.borderRadius = '12px';
    innerContainer.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
    innerContainer.style.padding = '16px';
    innerContainer.style.fontSize = '14px';
    
    this.panelContainer.appendChild(innerContainer);
    document.body.appendChild(this.panelContainer);
    
    // 创建 React 根节点
    this.root = createRoot(innerContainer);
    console.log('MagnetPicker: 面板容器已创建并添加到页面');
  }

  private async parseMagnets(): Promise<void> {
    console.log('MagnetPicker: 开始解析磁力链接');

    try {
      // 解析页面上的所有磁力链接
      const magnets = await this.findMagnets();
      console.log('MagnetPicker: 找到磁力链接:', magnets.length);

      if (magnets.length > 0) {
        // 先显示面板，确保状态与全局同步
        await this.showPanel(magnets);

        // 检查是否是本session首次打开
        if (!this.pageStateManager.hasDefaultSaved()) {
          console.log('MagnetPicker: 本session首次打开，执行默认保存');
          // 使用新的评分筛选机制选择磁力链接
          const magnetsToSave = selectMagnetsByScore(magnets);
          
          // 保存磁力链接
          chrome.runtime.sendMessage({
            type: 'SAVE_MAGNETS',
            data: magnetsToSave
          }, async (response) => {
            if (response?.success) {
              // 更新页面状态，标记已在本session中打开
              await this.pageStateManager.setDefaultSaved();
              // 重新显示面板以更新状态
              await this.showPanel(magnets);
            } else {
              this.showErrorMessage('保存失败，请重试');
            }
          });
        } else {
          // 检查是否所有磁力链接都未保存
          const allUnsaved = await this.pageStateManager.areAllMagnetsUnsaved(magnets);
          if (allUnsaved) {
            console.log('MagnetPicker: 所有磁力链接都未保存，执行默认保存');
            const magnetsToSave = selectMagnetsByScore(magnets);
            
            chrome.runtime.sendMessage({
              type: 'SAVE_MAGNETS',
              data: magnetsToSave
            }, async (response) => {
              if (response?.success) {
                // 重新显示面板以更新状态
                await this.showPanel(magnets);
              } else {
                this.showErrorMessage('保存失败，请重试');
              }
            });
          } else {
            console.log('MagnetPicker: 已有磁力链接处于保存状态，无需执行默认保存');
          }
        }
      } else {
        console.log('MagnetPicker: 未找到磁力链接');
        this.showErrorMessage('未找到磁力链接，请确保页面已完全加载');
      }
    } catch (error) {
      console.error('MagnetPicker: 解析出错:', error);
      this.showErrorMessage('解析出错，请重试');
    }
  }

  private async showPanel(magnets: MagnetInfo[]): Promise<void> {
    console.log('MagnetPicker: 准备显示面板');
    if (!this.panelContainer || !this.root) {
      console.error('MagnetPicker: 面板容器或根节点不存在，重新创建');
      this.createPanelContainer();
    }

    // 保存当前磁力链接列表
    this.currentMagnets = magnets;

    // 设置面板可见状态
    this.isPanelVisible = true;

    // 获取实际的保存状态
    const savedStates = await this.pageStateManager.getSavedMagnetStates(magnets);

    // 按评分排序磁力链接
    const sortedMagnets = sortMagnetsByScore(magnets);
    console.log('MagnetPicker: 按评分排序后的磁力链接:', sortedMagnets);

    // 确保 root 存在
    if (!this.root) {
      console.error('MagnetPicker: root 不存在，无法渲染面板');
      return;
    }

    // 渲染面板
    this.root.render(
      <MagnetPanel
        magnets={sortedMagnets}
        savedStates={savedStates}
        onClose={() => this.closePanel()}
        onToggleSave={this.handleToggleSave.bind(this)}
      />
    );

    if (this.panelContainer) {
      this.panelContainer.style.display = 'block';
    }

    // 添加点击事件监听器到 document
    const handleDocumentClick = (e: MouseEvent) => {
      // 如果点击的是按钮，不关闭面板
      if (this.button && this.button.contains(e.target as Node)) {
        return;
      }
      
      // 如果点击的是面板内部，不关闭面板
      if (this.panelContainer && this.panelContainer.contains(e.target as Node)) {
        return;
      }

      console.log('MagnetPicker: 点击面板外部，关闭面板');
      this.closePanel();
      document.removeEventListener('click', handleDocumentClick);
    };

    // 延迟添加事件监听器，避免立即触发
    setTimeout(() => {
      document.addEventListener('click', handleDocumentClick);
      console.log('MagnetPicker: 添加了点击事件监听器');
    }, 100);
  }

  private showErrorMessage(message: string): void {
    console.error('MagnetPicker: 显示错误消息:', message);
    const toast = document.createElement('div');
    toast.className = 'magnet-picker-toast magnet-picker-toast-error';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  private showSuccessMessage(message: string): void {
    console.log('MagnetPicker: 显示成功消息:', message);
    const toast = document.createElement('div');
    toast.className = 'magnet-picker-toast magnet-picker-toast-success';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  private async findMagnets(): Promise<MagnetInfo[]> {
    // 等待磁力链接加载完成
    await this.waitForMagnets();

    const magnets: MagnetInfo[] = [];
    // 查找所有包含磁力链接的行
    const rows = document.querySelectorAll('tr[onmouseover]');
    console.log('MagnetPicker: 找到行数:', rows.length);

    rows.forEach((row, index) => {
      const cells = row.querySelectorAll('td');
      console.log(`MagnetPicker: 第${index + 1}行单元格数:`, cells.length);

      if (cells.length >= 3) {
        // 从第一个单元格中获取磁力链接
        const firstCell = cells[0];
        const magnetLink = firstCell.querySelector('a[href^="magnet:"]');
        const hdTag = firstCell.querySelector('.btn-primary.disabled');
        
        if (magnetLink) {
          const magnetUrl = magnetLink.getAttribute('href') || '';
          const hashMatch = magnetUrl.match(/btih:([A-Fa-f0-9]{40})/);
          const hash = hashMatch ? hashMatch[1].toUpperCase() : '';
          
          const magnetInfo: MagnetInfo = {
            url: magnetUrl,
            fileName: `${magnetLink.textContent?.trim() || ''}${hdTag ? ' [HD]' : ''}`,
            fileSize: parseFileSize(cells[1].textContent?.trim() || '0'),
            date: cells[2].textContent?.trim() || '',
            hash: hash,
            saveTime: new Date().toISOString()
          };
          console.log('MagnetPicker: 解析到磁力链接:', magnetInfo);
          magnets.push(magnetInfo);
        }
      }
    });

    console.log('MagnetPicker: 解析完成，找到磁力链接数:', magnets.length);
    return magnets;
  }

  private waitForMagnets(): Promise<void> {
    return new Promise((resolve, reject) => {
      const maxAttempts = 10;
      let attempts = 0;

      const checkMagnets = () => {
        // 检查是否存在包含磁力链接的行
        const magnetRows = document.querySelectorAll('tr[onmouseover]');
        if (magnetRows.length > 0) {
          console.log('MagnetPicker: 找到磁力链接行');
          resolve();
        } else {
          attempts++;
          if (attempts >= maxAttempts) {
            reject(new Error('找不到磁力链接'));
          } else {
            console.log('MagnetPicker: 等待磁力链接加载...', attempts);
            setTimeout(checkMagnets, 1000);
          }
        }
      };

      checkMagnets();
    });
  }
}

// 创建实例
new MagnetPicker(); 