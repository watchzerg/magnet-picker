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
    await panelState.showPanel(magnets);

    // 检查是否是首次打开页面（session级别）
    const isFirstOpen = !panelState.pageStateManager.hasDefaultSaved();
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

  return null; // 这是一个无UI的组件，只负责逻辑
}; 