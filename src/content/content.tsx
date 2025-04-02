/// <reference types="chrome"/>

import { MagnetInfo } from '../types/magnet';
import { createRoot } from 'react-dom/client';
import { MagnetPanel } from '../components/MagnetPanel';
import { PageStateManager } from '../utils/pageStateManager';
import { parseFileSize } from '../utils/magnet';

class MagnetPicker {
  private button: HTMLButtonElement | null = null;
  private panelContainer: HTMLDivElement | null = null;
  private root: any = null;
  private isPanelVisible: boolean = false;
  private pageStateManager: PageStateManager;

  constructor() {
    console.log('MagnetPicker: 初始化');
    this.pageStateManager = new PageStateManager(window.location.href);
    this.init();
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
              fileSize: cells[1].textContent?.trim() || '',
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
      if (magnets.length > 0) {
        // 按文件大小排序（从大到小）
        const sortedMagnets = [...magnets].sort((a, b) => {
          const sizeA = parseFileSize(a.fileSize);
          const sizeB = parseFileSize(b.fileSize);
          return sizeB - sizeA;
        });

        // 检查是否需要执行默认保存
        if (!this.pageStateManager.hasDefaultSaved()) {
          // 保存前3个最大的文件
          const magnetsToSave = sortedMagnets.slice(0, 3);
          console.log('MagnetPicker: 准备保存前3个最大的磁力链接');
          
          // 保存磁力链接
          chrome.runtime.sendMessage({
            type: 'SAVE_MAGNETS',
            data: magnetsToSave
          }, async (response) => {
            console.log('MagnetPicker: 保存结果:', response);
            if (response?.success) {
              // 更新页面状态
              await this.pageStateManager.addSavedMagnets(magnetsToSave.map(m => m.hash));
              await this.pageStateManager.setDefaultSaved();
              // 显示信息面板
              this.showPanel(sortedMagnets);
            } else {
              this.showErrorMessage('保存失败，请重试');
            }
          });
        } else {
          // 直接显示面板，使用现有状态
          this.showPanel(sortedMagnets);
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

  private showPanel(magnets: MagnetInfo[]): void {
    console.log('MagnetPicker: 准备显示面板');
    if (!this.panelContainer || !this.root) {
      console.error('MagnetPicker: 面板容器或根节点不存在，重新创建');
      this.createPanelContainer();
    }

    // 设置面板可见状态
    this.isPanelVisible = true;

    const handleClose = () => {
      if (!this.isPanelVisible) return;
      console.log('MagnetPicker: 关闭面板');
      this.isPanelVisible = false;
      this.root.render(null);
      if (this.panelContainer) {
        this.panelContainer.style.display = 'none';
      }
    };

    // 处理保存和取消保存磁力链接
    const handleToggleSave = (magnet: MagnetInfo, isSaved: boolean) => {
      if (isSaved) {
        // 取消保存
        console.log('MagnetPicker: 取消保存磁力链接:', magnet.fileName);
        chrome.runtime.sendMessage({
          type: 'REMOVE_MAGNET',
          data: magnet
        }, async (response) => {
          if (response?.success) {
            await this.pageStateManager.removeSavedMagnet(magnet.hash);
            this.showPanel(magnets);
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
            await this.pageStateManager.addSavedMagnets([magnet.hash]);
            this.showPanel(magnets);
            this.showSuccessMessage('保存成功');
          } else {
            this.showErrorMessage('保存失败，请重试');
          }
        });
      }
    };

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
      handleClose();
      document.removeEventListener('click', handleDocumentClick);
    };

    // 延迟添加事件监听器，避免立即触发
    setTimeout(() => {
      document.addEventListener('click', handleDocumentClick);
      console.log('MagnetPicker: 添加了点击事件监听器');
    }, 100);

    // 确保面板容器可见
    if (this.panelContainer) {
      this.panelContainer.style.display = 'block';
      console.log('MagnetPicker: 设置面板容器为可见');
    }

    // 获取已保存的磁力链接列表
    const savedMagnetHashes = this.pageStateManager.getSavedMagnets();
    const savedMagnets = magnets.filter(m => savedMagnetHashes.includes(m.hash));

    console.log('MagnetPanel: 渲染面板组件');
    this.root.render(
      <MagnetPanel 
        magnets={magnets} 
        savedMagnets={savedMagnets}
        onClose={() => {
          handleClose();
          document.removeEventListener('click', handleDocumentClick);
        }}
        onToggleSave={handleToggleSave}
      />
    );
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
}

// 创建实例
new MagnetPicker(); 