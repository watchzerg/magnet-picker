/// <reference types="chrome"/>

import { MagnetInfo } from '../types/magnet';
import { formatFileSize } from '../utils/magnet';

document.addEventListener('DOMContentLoaded', async () => {
  const magnetList = document.getElementById('magnet-list');
  if (!magnetList) return;

  try {
    const magnets = await chrome.runtime.sendMessage({ type: 'GET_MAGNETS' });
    displayMagnets(magnets);
  } catch (error) {
    console.error('Error getting magnets:', error);
  }
});

function displayMagnets(magnets: MagnetInfo[]): void {
  const magnetList = document.getElementById('magnet-list');
  if (!magnetList) return;

  if (magnets.length === 0) {
    magnetList.innerHTML = '<p>暂无磁力链接</p>';
    return;
  }

  magnetList.innerHTML = magnets
    .map(
      (magnet) => `
        <div class="magnet-item">
          <a href="${magnet.magnet_link}" target="_blank">${magnet.fileName}</a>
          <div class="magnet-info">
            <span>${formatFileSize(magnet.fileSize)}</span>
            <span>${magnet.date}</span>
          </div>
        </div>
      `
    )
    .join('');
} 