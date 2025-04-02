import { useEffect } from 'react';
import { MagnetInfo } from '../../types/magnet';
import { StorageService } from '../services/StorageService';

export const useStorageListener = (
  storageService: StorageService,
  currentMagnets: MagnetInfo[],
  onStorageChange: (savedStates: Map<string, boolean>) => void
) => {
  useEffect(() => {
    const handleStorageChange = async (changes: { [key: string]: chrome.storage.StorageChange }) => {
      // 检查是否是磁力链接相关的存储变化
      if ('magnets' in changes) {
        console.log('StorageListener: 检测到磁力链接存储变化');
        // 重新获取所有磁力链接的保存状态
        const states = await storageService.getSavedMagnetStates(currentMagnets);
        onStorageChange(states);
      }
    };

    // 添加存储变化监听器
    chrome.storage.onChanged.addListener(handleStorageChange);
    console.log('StorageListener: 添加了存储变化监听器');

    // 清理函数
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
      console.log('StorageListener: 移除了存储变化监听器');
    };
  }, [storageService, currentMagnets, onStorageChange]);
}; 