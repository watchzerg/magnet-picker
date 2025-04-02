import { MagnetInfo } from '../../types/magnet';
import { parseFileSize } from '../../utils/magnet/size';
import { selectMagnetsByScore, sortMagnetsByScore } from '../../utils/magnet/scoring';
import { showErrorMessage, showSuccessMessage } from '../utils/toast';

export class MagnetService {
  /**
   * 查找页面上的磁力链接
   */
  public async findMagnets(): Promise<MagnetInfo[]> {
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

  /**
   * 等待磁力链接加载完成
   */
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

  /**
   * 处理磁力链接的保存/取消保存
   */
  async handleToggleSave(magnet: MagnetInfo, isSaved: boolean): Promise<boolean> {
    try {
      // 发送消息到后台保存磁力链接
      const response = await new Promise<{ success: boolean; error?: string }>((resolve) => {
        chrome.runtime.sendMessage({
          type: 'SAVE_MAGNETS',
          data: [magnet]
        }, response => {
          resolve(response || { success: false, error: 'No response from background' });
        });
      });

      if (!response.success) {
        console.error('保存磁力链接失败:', response.error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('保存磁力链接出错:', error);
      return false;
    }
  }

  /**
   * 解析并处理磁力链接
   */
  public async parseMagnets(): Promise<MagnetInfo[]> {
    console.log('MagnetPicker: 开始解析磁力链接');

    try {
      // 解析页面上的所有磁力链接
      const magnets = await this.findMagnets();
      console.log('MagnetPicker: 找到磁力链接:', magnets.length);

      if (magnets.length === 0) {
        console.log('MagnetPicker: 未找到磁力链接');
        showErrorMessage('未找到磁力链接，请确保页面已完全加载');
        return [];
      }

      return sortMagnetsByScore(magnets);
    } catch (error) {
      console.error('MagnetPicker: 解析出错:', error);
      showErrorMessage('解析出错，请重试');
      return [];
    }
  }

  /**
   * 选择要保存的磁力链接
   */
  public selectMagnetsToSave(magnets: MagnetInfo[]): MagnetInfo[] {
    return selectMagnetsByScore(magnets);
  }
} 