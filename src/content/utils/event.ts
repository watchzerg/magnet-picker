import { DOMRefs } from '../types/content';

/**
 * 添加文档点击事件监听器
 */
export const addDocumentClickListener = (
  refs: DOMRefs,
  onOutsideClick: () => void
): void => {
  const handleDocumentClick = (e: MouseEvent) => {
    // 如果点击的是按钮，不关闭面板
    if (refs.button && refs.button.contains(e.target as Node)) {
      return;
    }
    
    // 如果点击的是面板内部，不关闭面板
    if (refs.panelContainer && refs.panelContainer.contains(e.target as Node)) {
      return;
    }

    onOutsideClick();
    document.removeEventListener('click', handleDocumentClick);
  };

  // 延迟添加事件监听器，避免立即触发
  setTimeout(() => {
    document.addEventListener('click', handleDocumentClick);
  }, 100);
};

/**
 * 移除文档点击事件监听器
 */
export const removeDocumentClickListener = (): void => {
  // 由于事件监听器在触发后会自动移除，这里不需要额外操作
}; 