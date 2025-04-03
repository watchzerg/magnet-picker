import React, { useEffect, useRef, useState } from 'react';
import { MagnetInfo } from '../../types/magnet';
import { createFloatingButton, isValidPage, showToast } from '../utils/dom';
import { useMagnetParser } from '../hooks/useMagnetParser';
import { usePanelState } from '../hooks/usePanelState';
import { useStorageListener } from '../hooks/useStorageListener';
import { MagnetService } from '../services/MagnetService';
import { StorageService } from '../services/StorageService';
import { selectMagnetsByScore } from '../../utils/magnet';

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
      console.log('MagnetPicker: 磁力链接状态已更新:', magnetParser.magnets.length);
      handleMagnetsUpdate(magnetParser.magnets);
      isParsingRef.current = false;
    }
  }, [magnetParser.magnets]);

  // 监听storage变化
  useStorageListener(
    storageService,
    currentMagnets,
    async (savedStates: Map<string, boolean>) => {
      console.log('MagnetPicker: 存储状态变化，更新面板');
      await panelState.showPanel(currentMagnets);
    }
  );

  useEffect(() => {
    const init = async () => {
      if (isValidPage()) {
        console.log('MagnetPicker: 有效页面，创建按钮');
        await panelState.pageStateManager.init();
        const button = createFloatingButton(() => {
          console.log('MagnetPicker: 按钮被点击');
          parseMagnets();
        });
        if (button) {
          buttonRef.current = button;
          document.body.appendChild(button);
          console.log('MagnetPicker: 浮动按钮已创建');
        }
      } else {
        console.log('MagnetPicker: 无效页面，URL:', window.location.href);
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
    console.log('MagnetPicker: 处理磁力链接更新:', magnets.length);
    setCurrentMagnets(magnets);
    await panelState.showPanel(magnets);

    if (!panelState.pageStateManager.hasDefaultSaved()) {
      console.log('MagnetPicker: 本session首次打开，执行默认保存');
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
    } else {
      const allUnsaved = await panelState.pageStateManager.areAllMagnetsUnsaved(magnets);
      if (allUnsaved) {
        console.log('MagnetPicker: 所有磁力链接都未保存，执行默认保存');
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
      } else {
        console.log('MagnetPicker: 已有磁力链接处于保存状态，无需执行默认保存');
      }
    }
  };

  const parseMagnets = async () => {
    try {
      isParsingRef.current = true;
      await magnetParser.parseMagnets();
    } catch (error) {
      console.error('MagnetPicker: 解析出错:', error);
      showToast('解析出错，请重试', 'error');
      isParsingRef.current = false;
    }
  };

  return null; // 这是一个无UI的组件，只负责逻辑
}; 