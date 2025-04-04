import React, { useState, useCallback, useMemo } from 'react';
import { createRoot, Root as ReactDOMRoot } from 'react-dom/client';
import { MagnetInfo } from '../../types/magnet';
import { MagnetPanel } from '../../components/MagnetPanel';
import { createPanelContainer } from '../utils/dom';
import { PageStateManager } from '../../utils/pageStateManager';
import { sortMagnetsByScore } from '../../utils/magnet';
import { showErrorMessage, showSuccessMessage } from '../utils/toast';

export const usePanelState = () => {
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [magnets, setMagnets] = useState<Map<string, MagnetInfo>>(new Map());
  const pageStateManager = useMemo(() => {
    console.log('[Magnet保存] 创建PageStateManager实例，URL:', window.location.href);
    return new PageStateManager(window.location.href);
  }, []);

  const showPanel = async (newMagnets: MagnetInfo[]) => {
    console.log('[Magnet保存] 开始显示面板，磁力链接数量:', newMagnets.length);
    console.log('[Magnet保存] 当前pageStateManager:', pageStateManager);
    setIsPanelVisible(true);
    setMagnets(new Map(newMagnets.map(m => [m.magnet_hash, m])));
    
    // 获取保存状态
    const savedStates = await pageStateManager.getSavedMagnetStates(newMagnets);
    console.log('[Magnet保存] 获取到的保存状态:', {
      磁力链接数量: newMagnets.length,
      已保存数量: Array.from(savedStates.values()).filter(v => v).length
    });

    // 创建面板容器
    const panelContainer = createPanelContainer();
    console.log('[Magnet保存] 创建的面板容器:', panelContainer);
    
    // 添加到页面
    document.body.appendChild(panelContainer);
    console.log('[Magnet保存] 面板容器已添加到页面');
    
    // 获取内部容器
    const innerContainer = panelContainer.querySelector('div');
    if (!innerContainer) {
      console.error('[Magnet保存] 未找到内部容器');
      return;
    }
    console.log('[Magnet保存] 找到内部容器:', innerContainer);
    
    // 创建React根节点
    const root = createRoot(innerContainer);
    console.log('[Magnet保存] 创建React根节点');
    
    // 渲染面板
    const panelProps = {
      magnets: newMagnets,
      savedStates,
      onClose: hidePanel,
      onToggleSave: handleToggleSave
    };
    console.log('[Magnet保存] 准备渲染面板，参数:', panelProps);
    
    root.render(React.createElement(MagnetPanel, panelProps));
    console.log('[Magnet保存] 面板已渲染');
    
    // 显示面板
    panelContainer.style.display = 'block';
    console.log('[Magnet保存] 面板已显示');
  };

  const hidePanel = () => {
    console.log('[Magnet保存] 隐藏面板');
    setIsPanelVisible(false);
    setMagnets(new Map());
  };

  const handleToggleSave = useCallback(async (magnet: MagnetInfo, isSaved: boolean) => {
    try {
      if (isSaved) {
        await chrome.runtime.sendMessage({ type: 'DELETE_MAGNET', hash: magnet.magnet_hash });
        showSuccessMessage('已取消保存');
      } else {
        await chrome.runtime.sendMessage({ type: 'SAVE_MAGNET', magnet });
        showSuccessMessage('已保存');
      }

      // 更新面板显示
      const savedStates = await pageStateManager.getSavedMagnetStates(Array.from(magnets.values()));
      const panelProps = {
        magnets: Array.from(magnets.values()),
        savedStates,
        onClose: hidePanel,
        onToggleSave: handleToggleSave
      };

      if (isPanelVisible) {
        const panelContainer = createPanelContainer();
        document.body.appendChild(panelContainer);
        const innerContainer = panelContainer.querySelector('div');
        if (!innerContainer) throw new Error('Inner container not found');
        const root = createRoot(innerContainer);
        root.render(React.createElement(MagnetPanel, panelProps));
        panelContainer.style.display = 'block';
      }
    } catch (error) {
      showErrorMessage('操作失败，请重试');
    }
  }, [isPanelVisible, magnets, pageStateManager]);

  return {
    isPanelVisible,
    showPanel,
    hidePanel,
    magnets,
    pageStateManager,
    handleToggleSave
  };
}; 