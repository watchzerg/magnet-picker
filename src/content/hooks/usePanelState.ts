import React, { useState, useCallback } from 'react';
import { createRoot, Root as ReactDOMRoot } from 'react-dom/client';
import { MagnetInfo } from '../../types/magnet';
import { MagnetPanel } from '../../components/MagnetPanel';
import { createPanelContainer } from '../utils/dom';
import { PageStateManager } from '../../utils/pageStateManager';
import { sortMagnetsByScore } from '../../utils/magnet';
import { showErrorMessage, showSuccessMessage } from '../utils/toast';

export const usePanelState = () => {
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [currentMagnets, setCurrentMagnets] = useState<MagnetInfo[]>([]);
  let panelContainer: HTMLDivElement | null = null;
  let root: ReactDOMRoot | null = null;
  const pageStateManager = new PageStateManager(window.location.href);

  const showPanel = useCallback(async (magnets: MagnetInfo[]) => {
    const sortedMagnets = await sortMagnetsByScore(magnets);
    setCurrentMagnets(sortedMagnets);
    setIsPanelVisible(true);

    if (!panelContainer || !root) {
      panelContainer = createPanelContainer();
      document.body.appendChild(panelContainer);
      const innerContainer = panelContainer.querySelector('div');
      if (!innerContainer) throw new Error('Inner container not found');
      root = createRoot(innerContainer);
    }

    const savedStates = await pageStateManager.getSavedMagnetStates(sortedMagnets);

    if (!root) {
      console.error('面板渲染失败：root不存在');
      return;
    }

    const panelProps = {
      magnets: sortedMagnets,
      savedStates,
      onClose: hidePanel,
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
      hidePanel();
      document.removeEventListener('click', handleDocumentClick);
    };

    setTimeout(() => {
      document.addEventListener('click', handleDocumentClick);
    }, 100);
  }, []);

  const hidePanel = useCallback(() => {
    setIsPanelVisible(false);
    if (root) {
      root.render(null);
    }
    if (panelContainer) {
      panelContainer.style.display = 'none';
    }
  }, []);

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
      const savedStates = await pageStateManager.getSavedMagnetStates(currentMagnets);
      const panelProps = {
        magnets: currentMagnets,
        savedStates,
        onClose: hidePanel,
        onToggleSave: handleToggleSave
      };

      if (root) {
        root.render(React.createElement(MagnetPanel, panelProps));
      }
    } catch (error) {
      showErrorMessage('操作失败，请重试');
    }
  }, [currentMagnets]);

  return {
    isPanelVisible,
    showPanel,
    hidePanel,
    pageStateManager
  };
}; 