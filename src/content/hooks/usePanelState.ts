import React, { useState, useCallback, useMemo, useRef } from 'react';
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
  const panelContainerRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<ReactDOMRoot | null>(null);
  
  const pageStateManager = useMemo(() => {
    return new PageStateManager(window.location.href);
  }, []);

  const showPanel = async (newMagnets: MagnetInfo[]) => {
    console.log('[Magnet Panel] 显示面板，磁力链接数量:', newMagnets.length);
    setIsPanelVisible(true);
    setMagnets(new Map(newMagnets.map(m => [m.magnet_hash, m])));
    
    // 获取保存状态
    const savedStates = await pageStateManager.getSavedMagnetStates(newMagnets);
    console.log('[Magnet Panel] 当前保存状态:', Object.fromEntries(savedStates));

    // 如果面板容器已存在，直接更新内容
    if (panelContainerRef.current) {
      const panelProps = {
        magnets: newMagnets,
        savedStates,
        onClose: hidePanel,
        onToggleSave: handleToggleSave
      };
      
      if (rootRef.current) {
        rootRef.current.render(React.createElement(MagnetPanel, panelProps));
        console.log('[Magnet Panel] 面板内容更新完成');
        return;
      }
    }

    // 创建新的面板容器
    const panelContainer = createPanelContainer();
    panelContainerRef.current = panelContainer;
    
    // 添加到页面
    document.body.appendChild(panelContainer);
    
    // 获取内部容器
    const innerContainer = panelContainer.querySelector('div');
    if (!innerContainer) {
      console.error('[Magnet Panel] 未找到内部容器');
      return;
    }
    
    // 创建React根节点
    const root = createRoot(innerContainer);
    rootRef.current = root;
    
    // 渲染面板
    const panelProps = {
      magnets: newMagnets,
      savedStates,
      onClose: hidePanel,
      onToggleSave: handleToggleSave
    };
    
    root.render(React.createElement(MagnetPanel, panelProps));
    
    // 显示面板
    panelContainer.style.display = 'block';
    console.log('[Magnet Panel] 面板显示完成');
  };

  const hidePanel = () => {
    console.log('[Magnet Panel] 隐藏面板');
    setIsPanelVisible(false);
    setMagnets(new Map());
    
    // 清理面板容器
    if (panelContainerRef.current) {
      panelContainerRef.current.remove();
      panelContainerRef.current = null;
    }
    rootRef.current = null;
  };

  const handleToggleSave = useCallback(async (magnet: MagnetInfo, isSaved: boolean) => {
    console.log(`[Magnet Panel] ${isSaved ? '移除' : '添加'}磁力链接:`, magnet.magnet_hash);
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
      console.log('[Magnet Panel] 更新后的保存状态:', Object.fromEntries(savedStates));
      
      const panelProps = {
        magnets: Array.from(magnets.values()),
        savedStates,
        onClose: hidePanel,
        onToggleSave: handleToggleSave
      };

      if (isPanelVisible && rootRef.current) {
        rootRef.current.render(React.createElement(MagnetPanel, panelProps));
        console.log('[Magnet Panel] 面板内容更新完成');
      }
    } catch (error) {
      console.error('[Magnet Panel] 操作失败:', error);
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