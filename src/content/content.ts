/// <reference types="chrome"/>

import { MagnetInfo } from '../types/magnet';

class MagnetPicker {
  private button: HTMLButtonElement | null = null;

  constructor() {
    console.log('MagnetPicker: 初始化');
    this.init();
  }

  private init(): void {
    if (this.isValidPage()) {
      console.log('MagnetPicker: 有效页面，创建按钮');
      this.createFloatingButton();
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
        chrome.runtime.sendMessage({
          type: 'SAVE_MAGNETS',
          data: magnets
        }, (response) => {
          console.log('MagnetPicker: 保存结果:', response);
          if (response?.success) {
            this.showSuccessMessage(`成功保存 ${magnets.length} 个磁力链接`);
          } else {
            this.showErrorMessage('保存失败，请重试');
          }
        });
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

  private showSuccessMessage(message: string): void {
    const toast = document.createElement('div');
    toast.className = 'magnet-picker-toast magnet-picker-toast-success';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  private showErrorMessage(message: string): void {
    const toast = document.createElement('div');
    toast.className = 'magnet-picker-toast magnet-picker-toast-error';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
}

// 创建实例
new MagnetPicker(); 