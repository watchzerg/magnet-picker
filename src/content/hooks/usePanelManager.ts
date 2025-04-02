import { useState, useCallback, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { PanelContainer } from '../components/PanelContainer';
import { ButtonContainer } from '../components/ButtonContainer';
import { MagnetInfo } from '../../types/magnet';
import { DOMRefs } from '../types/content';
import { createPanelContainer, cleanupDOMRefs } from '../utils/dom';
import { addDocumentClickListener, removeDocumentClickListener } from '../utils/event';
import React from 'react';

export const usePanelManager = () => {
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [refs, setRefs] = useState<DOMRefs>({
    button: null,
    panelContainer: null,
    root: null
  });

  /**
   * 初始化UI元素
   */
  const initializeUI = useCallback(() => {
    // 创建浮动按钮
    const buttonContainer = document.createElement('div');
    document.body.appendChild(buttonContainer);
    const buttonRoot = createRoot(buttonContainer);
    buttonRoot.render(React.createElement(ButtonContainer, { onShowPanel: () => setIsPanelVisible(true) }));
    
    // 创建面板容器
    const panelContainer = createPanelContainer();
    
    // 创建React根节点
    const root = createRoot(panelContainer.querySelector('div')!);
    
    setRefs({
      button: buttonContainer,
      panelContainer,
      root
    });
  }, []);

  /**
   * 显示面板
   */
  const showPanel = useCallback((magnets: MagnetInfo[], savedStates: Map<string, boolean>, onClose: () => void, onToggleSave: (magnet: MagnetInfo, isSaved: boolean) => void) => {
    if (!refs.root) return;

    setIsPanelVisible(true);
    
    // 渲染面板组件
    refs.root.render(React.createElement(PanelContainer, {
      magnets,
      savedStates,
      onClose,
      onToggleSave
    }));

    // 添加点击事件监听器
    addDocumentClickListener(refs, onClose);
  }, [refs]);

  /**
   * 关闭面板
   */
  const closePanel = useCallback(() => {
    if (!isPanelVisible) return;

    setIsPanelVisible(false);
    if (refs.root) {
      refs.root.render(null);
    }
    if (refs.panelContainer) {
      refs.panelContainer.style.display = 'none';
    }
  }, [isPanelVisible, refs]);

  /**
   * 清理资源
   */
  const cleanup = useCallback(() => {
    cleanupDOMRefs(refs);
    removeDocumentClickListener();
  }, [refs]);

  /**
   * 组件卸载时清理
   */
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    isPanelVisible,
    refs,
    initializeUI,
    showPanel,
    closePanel,
    cleanup
  };
}; 