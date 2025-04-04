import React, { useEffect, useRef, useState } from 'react';
import { MagnetInfo } from '../../types/magnet';
import { createFloatingButton, isValidPage, showToast } from '../utils/dom';
import { useMagnetParser } from '../hooks/useMagnetParser';
import { usePanelState } from '../hooks/usePanelState';
import { useStorageListener } from '../hooks/useStorageListener';
import { MagnetService } from '../services/MagnetService';
import { StorageService } from '../services/StorageService';

interface MagnetPickerProps {
  magnetService: MagnetService;
  storageService: StorageService;
}

export const MagnetPicker: React.FC<MagnetPickerProps> = ({ magnetService, storageService }) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [currentMagnets, setCurrentMagnets] = useState<MagnetInfo[]>([]);
  const magnetParser = useMagnetParser(magnetService, storageService);
  const panelState = usePanelState();
  const isParsingRef = useRef(false);

  // 监听magnets状态变化
  useEffect(() => {
    if (magnetParser.magnets.length > 0 && isParsingRef.current) {
      handleMagnetsUpdate(magnetParser.magnets);
      isParsingRef.current = false;
    }
  }, [magnetParser.magnets]);

  // 监听storage变化
  useStorageListener(
    storageService,
    currentMagnets,
    async (savedStates: Map<string, boolean>) => {
      await panelState.showPanel(currentMagnets);
    }
  );

  useEffect(() => {
    const init = async () => {
      if (isValidPage()) {
        await panelState.pageStateManager.init();
        const button = createFloatingButton(() => {
          parseMagnets();
        });
        if (button) {
          buttonRef.current = button;
          document.body.appendChild(button);
        }
      }
    };

    init();

    return () => {
      if (buttonRef.current) {
        buttonRef.current.remove();
      }
    };
  }, []);

  const handleMagnetsUpdate = async (magnets: MagnetInfo[]) => {
    setCurrentMagnets(magnets);
    await panelState.showPanel(magnets);

    // 检查是否是首次打开页面（session级别）
    const isFirstOpen = !await panelState.pageStateManager.hasDefaultSaved();

    if (isFirstOpen) {
      const magnetsToSave = await magnetService.selectMagnetsToSave(magnets);
      
      // 保存所有选中的磁力链接
      for (const magnet of magnetsToSave) {
        const success = await magnetService.handleToggleSave(magnet, false);
        if (!success) {
          showToast('保存失败，请重试', 'error');
          break;
        }
      }
      
      await panelState.pageStateManager.setDefaultSaved();
      await panelState.showPanel(magnets);
      return;
    }

    // 检查当前页面的所有magnet是否都未保存
    const allUnsaved = await panelState.pageStateManager.areAllMagnetsUnsaved(magnets);

    if (!allUnsaved) {
      return;
    }

    const magnetsToSave = await magnetService.selectMagnetsToSave(magnets);
    
    // 保存所有选中的磁力链接
    for (const magnet of magnetsToSave) {
      const success = await magnetService.handleToggleSave(magnet, false);
      if (!success) {
        showToast('保存失败，请重试', 'error');
        break;
      }
    }
    
    await panelState.showPanel(magnets);
  };

  const parseMagnets = async () => {
    try {
      isParsingRef.current = true;
      await magnetParser.parseMagnets();
    } catch (error) {
      console.error('解析出错，请重试');
      showToast('解析出错，请重试', 'error');
      isParsingRef.current = false;
    }
  };

  // 处理默认保存
  const handleDefaultSave = async () => {
    try {
      // 确保页面状态已初始化
      await panelState.pageStateManager.init();
      
      // 获取当前页面的所有磁力链接
      const currentMagnets = Array.from(panelState.magnets.values());
      
      // 获取已保存的磁力链接
      const savedStates = await panelState.pageStateManager.getSavedMagnetStates(currentMagnets);
      
      // 检查是否所有磁力链接都未保存
      const allUnsaved = await panelState.pageStateManager.areAllMagnetsUnsaved(currentMagnets);
      
      if (!allUnsaved) {
        return;
      }
      
      // 使用selectMagnetsByScore选择要保存的磁力链接
      const magnetsToSave = await magnetService.selectMagnetsToSave(currentMagnets);
      
      // 保存磁力链接
      for (const magnet of magnetsToSave) {
        await magnetService.handleToggleSave(magnet, false);
      }
      
      // 标记已执行默认保存
      await panelState.pageStateManager.setDefaultSaved();
    } catch (error) {
      console.error('[Magnet保存] 默认保存失败:', error);
    }
  };

  return null; // 这是一个无UI的组件，只负责逻辑
}; 