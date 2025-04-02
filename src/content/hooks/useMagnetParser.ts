import { MagnetInfo } from '../../types/magnet';
import { parseFileSize } from '../../utils/magnet';

export function useMagnetParser() {
  const waitForMagnets = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const maxAttempts = 10;
      let attempts = 0;

      const checkMagnets = () => {
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
  };

  const findMagnets = async (): Promise<MagnetInfo[]> => {
    await waitForMagnets();

    const magnets: MagnetInfo[] = [];
    const rows = document.querySelectorAll('tr[onmouseover]');
    console.log('MagnetPicker: 找到行数:', rows.length);

    rows.forEach((row, index) => {
      const cells = row.querySelectorAll('td');
      console.log(`MagnetPicker: 第${index + 1}行单元格数:`, cells.length);

      if (cells.length >= 3) {
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
  };

  return {
    findMagnets,
    waitForMagnets
  };
} 