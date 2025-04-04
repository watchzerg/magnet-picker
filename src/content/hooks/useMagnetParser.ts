import { useState, useCallback } from 'react';
import { MagnetInfo } from '../../types/magnet';
import { MagnetService } from '../services/MagnetService';
import { StorageService } from '../services/StorageService';
import { showErrorMessage } from '../utils/toast';

export const useMagnetParser = (magnetService: MagnetService, storageService: StorageService) => {
  const [magnets, setMagnets] = useState<MagnetInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savedStates, setSavedStates] = useState<Map<string, boolean>>(new Map());

  /**
   * 解析磁力链接
   */
  const parseMagnets = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const parsedMagnets = await magnetService.findMagnets();
      console.log('useMagnetParser: 设置磁力链接:', parsedMagnets.length);
      setMagnets(parsedMagnets);
      
      // 获取保存状态
      const states = await storageService.getSavedMagnetStates(parsedMagnets);
      setSavedStates(states);

      // 检查是否需要默认保存
      const state = await storageService.getState();
      if (!state?.hasDefaultSave) {
        const magnetsToSave = magnetService.selectMagnetsToSave(parsedMagnets);
        await storageService.setDefaultSaved();
        
        // 保存选中的磁力链接
        chrome.runtime.sendMessage({
          type: 'SAVE_MAGNETS',
          data: magnetsToSave
        }, response => {
          if (!response?.success) {
            console.error('Background: 保存磁力链接失败:', response?.error);
            showErrorMessage('保存失败，请重试');
          }
        });
      }
    } catch (error) {
      console.error('解析磁力链接失败:', error);
      showErrorMessage('解析失败，请重试');
    } finally {
      setIsLoading(false);
    }
  }, [magnetService, storageService, setMagnets, setSavedStates]);

  /**
   * 处理磁力链接的保存/取消保存
   */
  const handleToggleSave = useCallback(async (magnet: MagnetInfo, isSaved: boolean): Promise<void> => {
    await magnetService.handleToggleSave(magnet, isSaved);
    
    // 更新保存状态
    setSavedStates(prevStates => {
      const newStates = new Map(prevStates);
      newStates.set(magnet.magnet_hash, !isSaved);
      return newStates;
    });
  }, [magnetService]);

  return {
    magnets,
    isLoading,
    savedStates,
    parseMagnets,
    handleToggleSave
  };
}; 