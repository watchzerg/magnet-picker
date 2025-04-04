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
    console.log('[Magnet保存] 开始处理磁力链接，数量:', magnets.length);
    setCurrentMagnets(magnets);
    console.log('[Magnet保存] 调用showPanel前');
    await panelState.showPanel(magnets);
    console.log('[Magnet保存] 调用showPanel后');

    // 检查是否是首次打开页面（session级别）
    const isFirstOpen = !await panelState.pageStateManager.hasDefaultSaved();
    console.log('[Magnet保存] 是否首次打开页面:', isFirstOpen);

    if (isFirstOpen) {
      console.log('[Magnet保存] 本session首次打开，准备执行默认保存');
      const magnetsToSave = await magnetService.selectMagnetsToSave(magnets);
      console.log('[Magnet保存] 将要保存的磁力链接数量:', magnetsToSave.length);
      
      // 保存所有选中的磁力链接
      for (const magnet of magnetsToSave) {
        console.log('[Magnet保存] 正在保存:', {
          fileName: magnet.fileName,
          hash: magnet.magnet_hash,
          size: magnet.fileSize
        });
        const success = await magnetService.handleToggleSave(magnet, false);
        if (!success) {
          showToast('保存失败，请重试', 'error');
          break;
        }
      }
      
      await panelState.pageStateManager.setDefaultSaved();
      await panelState.showPanel(magnets);
      console.log('[Magnet保存] 首次打开保存完成');
      return;
    }

    // 检查当前页面的所有magnet是否都未保存
    const allUnsaved = await panelState.pageStateManager.areAllMagnetsUnsaved(magnets);
    console.log('[Magnet保存] 是否所有磁力链接都未保存:', allUnsaved);

    if (!allUnsaved) {
      console.log('[Magnet保存] 已有磁力链接处于保存状态，跳过默认保存');
      return;
    }

    console.log('[Magnet保存] 所有磁力链接都未保存，准备执行默认保存');
    const magnetsToSave = await magnetService.selectMagnetsToSave(magnets);
    console.log('[Magnet保存] 将要保存的磁力链接数量:', magnetsToSave.length);
    
    // 保存所有选中的磁力链接
    for (const magnet of magnetsToSave) {
      console.log('[Magnet保存] 正在保存:', {
        fileName: magnet.fileName,
        hash: magnet.magnet_hash,
        size: magnet.fileSize
      });
      const success = await magnetService.handleToggleSave(magnet, false);
      if (!success) {
        showToast('保存失败，请重试', 'error');
        break;
      }
    }
    
    await panelState.showPanel(magnets);
    console.log('[Magnet保存] 默认保存完成');
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
      console.log('[Magnet保存] 开始处理默认保存');
      
      // 确保页面状态已初始化
      console.log('[Magnet保存] 调用init前pageStateManager:', panelState.pageStateManager);
      await panelState.pageStateManager.init();
      console.log('[Magnet保存] 调用init后pageStateManager:', panelState.pageStateManager);
      
      // 获取当前页面的所有磁力链接
      const currentMagnets = Array.from(panelState.magnets.values());
      console.log('[Magnet保存] 当前页面磁力链接数量:', currentMagnets.length);
      
      // 获取已保存的磁力链接
      const savedStates = await panelState.pageStateManager.getSavedMagnetStates(currentMagnets);
      console.log('[Magnet保存] 获取已保存状态:', {
        当前页面磁力链接数: currentMagnets.length,
        已保存磁力链接数: Array.from(savedStates.values()).filter(v => v).length,
        当前页面已保存数: Array.from(savedStates.values()).filter(v => v).length
      });
      
      // 检查是否所有磁力链接都未保存
      const allUnsaved = await panelState.pageStateManager.areAllMagnetsUnsaved(currentMagnets);
      console.log('[Magnet保存] 是否所有磁力链接都未保存:', allUnsaved);
      
      if (!allUnsaved) {
        console.log('[Magnet保存] 已有部分磁力链接被保存，跳过默认保存');
        return;
      }
      
      // 使用selectMagnetsByScore选择要保存的磁力链接
      const magnetsToSave = await magnetService.selectMagnetsToSave(currentMagnets);
      console.log('[Magnet保存] 将要保存的磁力链接数量:', magnetsToSave.length);
      
      // 保存磁力链接
      for (const magnet of magnetsToSave) {
        console.log('[Magnet保存] 正在保存:', {
          fileName: magnet.fileName,
          hash: magnet.magnet_hash,
          size: magnet.fileSize
        });
        await magnetService.handleToggleSave(magnet, false);
      }
      
      // 标记已执行默认保存
      console.log('[Magnet保存] 调用setDefaultSaved前pageStateManager:', panelState.pageStateManager);
      await panelState.pageStateManager.setDefaultSaved();
      console.log('[Magnet保存] 调用setDefaultSaved后pageStateManager:', panelState.pageStateManager);
      console.log('[Magnet保存] 首次打开保存完成');
    } catch (error) {
      console.error('[Magnet保存] 默认保存失败:', error);
    }
  };

  return null; // 这是一个无UI的组件，只负责逻辑
}; 