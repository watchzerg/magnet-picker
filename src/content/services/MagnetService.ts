import { MagnetInfo } from '../../types/magnet';
import { showToast } from '../utils/dom';

export class MagnetService {
  static async saveMagnet(magnet: MagnetInfo): Promise<boolean> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
        type: 'SAVE_MAGNETS',
        data: [magnet]
      }, (response) => {
        if (response?.success) {
          showToast('保存成功', 'success');
          resolve(true);
        } else {
          showToast('保存失败，请重试', 'error');
          resolve(false);
        }
      });
    });
  }

  static async removeMagnet(magnet: MagnetInfo): Promise<boolean> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
        type: 'REMOVE_MAGNET',
        data: magnet
      }, (response) => {
        if (response?.success) {
          showToast('已取消保存', 'success');
          resolve(true);
        } else {
          showToast('取消保存失败，请重试', 'error');
          resolve(false);
        }
      });
    });
  }

  static async saveMagnets(magnets: MagnetInfo[]): Promise<boolean> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
        type: 'SAVE_MAGNETS',
        data: magnets
      }, (response) => {
        if (response?.success) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }
} 