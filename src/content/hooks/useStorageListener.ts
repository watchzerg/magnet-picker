import { MagnetInfo } from '../../types/magnet';

export function useStorageListener(
  currentMagnets: MagnetInfo[],
  isPanelVisible: boolean,
  onMagnetsUpdate: (savedStates: { [key: string]: boolean }) => void
) {
  const storageChangeListener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
    if (changes.magnets && isPanelVisible) {
      console.log('MagnetPicker: 检测到磁力链接存储变化，更新面板状态');
      // 重新获取当前磁力链接的保存状态并更新面板
      chrome.storage.local.get(['magnets'], (result) => {
        const magnets = result.magnets || [];
        const savedStates: { [key: string]: boolean } = {};
        
        currentMagnets.forEach(magnet => {
          savedStates[magnet.hash] = magnets.some((m: MagnetInfo) => m.hash === magnet.hash);
        });
        
        onMagnetsUpdate(savedStates);
      });
    }
  };

  chrome.storage.onChanged.addListener(storageChangeListener);

  return () => {
    chrome.storage.onChanged.removeListener(storageChangeListener);
  };
} 