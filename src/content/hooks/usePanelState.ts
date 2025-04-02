import React from 'react';
import { createRoot, Root as ReactDOMRoot } from 'react-dom/client';
import { MagnetInfo } from '../../types/magnet';
import { MagnetPanel } from '../../components/MagnetPanel';
import { createPanelContainer } from '../utils/dom';
import { PageStateManager } from '../../utils/pageStateManager';
import { sortMagnetsByScore } from '../../utils/magnet';
import { MagnetService } from '../services/MagnetService';

export function usePanelState() {
  let panelContainer: HTMLDivElement | null = null;
  let root: ReactDOMRoot | null = null;
  let isPanelVisible = false;
  const pageStateManager = new PageStateManager(window.location.href);

  const showPanel = async (magnets: MagnetInfo[]): Promise<void> => {
    console.log('MagnetPicker: 准备显示面板');
    if (!panelContainer || !root) {
      console.error('MagnetPicker: 面板容器或根节点不存在，重新创建');
      panelContainer = createPanelContainer();
      document.body.appendChild(panelContainer);
      const innerContainer = panelContainer.querySelector('div');
      if (!innerContainer) throw new Error('Inner container not found');
      root = createRoot(innerContainer);
    }

    isPanelVisible = true;
    const savedStates = await pageStateManager.getSavedMagnetStates(magnets);
    const sortedMagnets = sortMagnetsByScore(magnets);

    if (!root) {
      console.error('MagnetPicker: root 不存在，无法渲染面板');
      return;
    }

    const panelProps = {
      magnets: sortedMagnets,
      savedStates,
      onClose: closePanel,
      onToggleSave: handleToggleSave
    };

    root.render(React.createElement(MagnetPanel, panelProps));

    if (panelContainer) {
      panelContainer.style.display = 'block';
    }

    // 添加点击事件监听器到 document
    const handleDocumentClick = (e: MouseEvent) => {
      if (panelContainer && panelContainer.contains(e.target as Node)) {
        return;
      }
      console.log('MagnetPicker: 点击面板外部，关闭面板');
      closePanel();
      document.removeEventListener('click', handleDocumentClick);
    };

    setTimeout(() => {
      document.addEventListener('click', handleDocumentClick);
      console.log('MagnetPicker: 添加了点击事件监听器');
    }, 100);
  };

  const closePanel = () => {
    if (!isPanelVisible) return;
    console.log('MagnetPicker: 关闭面板');
    isPanelVisible = false;
    if (root) {
      root.render(null);
    }
    if (panelContainer) {
      panelContainer.style.display = 'none';
    }
  };

  const handleToggleSave = async (magnet: MagnetInfo, isSaved: boolean) => {
    if (isSaved) {
      await MagnetService.removeMagnet(magnet);
    } else {
      await MagnetService.saveMagnet(magnet);
    }
  };

  const destroy = () => {
    closePanel();
    if (panelContainer) {
      panelContainer.remove();
      panelContainer = null;
    }
    root = null;
  };

  return {
    showPanel,
    closePanel,
    destroy,
    pageStateManager
  };
} 