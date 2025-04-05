import { MagnetInfo } from '../../types/magnet';
import { parseFileSize } from '../../utils/magnet/size';
import { selectMagnetsByScore, sortMagnetsByScore } from '../../utils/magnet/scoring';
import { showErrorMessage, showSuccessMessage } from '../utils/toast';
import { parseCatalogNumber } from '../../utils/titleParser';

export class MagnetService {
  /**
   * 查找页面上的磁力链接
   */
  public async findMagnets(): Promise<MagnetInfo[]> {
    // 等待磁力链接加载完成
    await this.waitForMagnets();

    // 获取页面标题并解析番号
    const titleElement = document.querySelector('h3');
    const title = titleElement?.textContent?.trim() || '';
    const catalogNumber = parseCatalogNumber(title);

    const magnets: MagnetInfo[] = [];
    // 查找所有包含磁力链接的行
    const rows = document.querySelectorAll('tr[onmouseover]');

    rows.forEach((row) => {
      const cells = row.querySelectorAll('td');

      if (cells.length >= 3) {
        // 从第一个单元格中获取磁力链接
        const firstCell = cells[0];
        const magnetLink = firstCell.querySelector('a[href^="magnet:"]');
        
        if (magnetLink) {
          const magnetUrl = magnetLink.getAttribute('href') || '';
          const hashMatch = magnetUrl.match(/btih:([A-Fa-f0-9]{40})/);
          const hash = hashMatch ? hashMatch[1].toUpperCase() : '';
          
          const magnetInfo: MagnetInfo = {
            magnet_link: magnetUrl,
            fileName: magnetLink.textContent?.trim() || '',
            fileSize: parseFileSize(cells[1].textContent?.trim() || '0'),
            date: cells[2].textContent?.trim() || '',
            magnet_hash: hash,
            saveTime: new Date().toISOString(),
            source_url: window.location.href,
            catalog_number: catalogNumber || ''
          };
          magnets.push(magnetInfo);
        }
      }
    });

    return magnets;
  }

  /**
   * 等待磁力链接加载完成
   */
  private async waitForMagnets(): Promise<void> {
    let retries = 0;
    const maxRetries = 10;
    const retryInterval = 500;

    while (retries < maxRetries) {
      const rows = document.querySelectorAll('tr[onmouseover]');
      if (rows.length > 0) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, retryInterval));
      retries++;
    }

    throw new Error('等待磁力链接加载超时');
  }

  /**
   * 解析并处理磁力链接
   */
  public async parseMagnets(): Promise<MagnetInfo[]> {
    try {
      // 解析页面上的所有磁力链接
      const magnets = await this.findMagnets();

      if (magnets.length === 0) {
        showErrorMessage('未找到磁力链接，请确保页面已完全加载');
        return [];
      }

      return await sortMagnetsByScore(magnets);
    } catch (error) {
      showErrorMessage('解析出错，请重试');
      return [];
    }
  }

  /**
   * 选择要保存的磁力链接
   */
  public async selectMagnetsToSave(magnets: MagnetInfo[]): Promise<MagnetInfo[]> {
    return await selectMagnetsByScore(magnets);
  }

  /**
   * 切换磁力链接的保存状态
   */
  public async handleToggleSave(magnet: MagnetInfo, isSaved: boolean): Promise<boolean> {
    try {
      if (isSaved) {
        await chrome.runtime.sendMessage({ type: 'DELETE_MAGNET', hash: magnet.magnet_hash });
        showSuccessMessage('已取消保存');
      } else {
        await chrome.runtime.sendMessage({ type: 'SAVE_MAGNET', magnet });
        showSuccessMessage('已保存');
      }
      return true;
    } catch (error) {
      showErrorMessage('操作失败，请重试');
      return false;
    }
  }
} 