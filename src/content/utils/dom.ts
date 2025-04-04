import { DOMRefs } from '../types/content';

/**
 * 创建浮动按钮
 */
export const createFloatingButton = (onClick: () => void): HTMLButtonElement => {
  const button = document.createElement('button');
  button.className = 'magnet-picker-button';
  button.textContent = '解析磁力链接';
  button.addEventListener('click', onClick);
  document.body.appendChild(button);
  return button;
};

/**
 * 创建面板容器
 */
export const createPanelContainer = (): HTMLDivElement => {
  // 移除已存在的面板容器
  const existingContainer = document.getElementById('magnet-picker-panel');
  if (existingContainer) {
    existingContainer.remove();
  }

  // 创建新的面板容器
  const panelContainer = document.createElement('div');
  panelContainer.id = 'magnet-picker-panel';
  panelContainer.style.position = 'fixed';
  panelContainer.style.top = '0';
  panelContainer.style.right = '0';
  panelContainer.style.zIndex = '999999';
  panelContainer.style.display = 'block';
  panelContainer.style.width = '100%';
  panelContainer.style.height = '100%';
  panelContainer.style.pointerEvents = 'none';
  
  // 创建一个内部容器用于实际内容
  const innerContainer = document.createElement('div');
  innerContainer.style.position = 'absolute';
  innerContainer.style.top = '20px';
  innerContainer.style.right = '20px';
  innerContainer.style.width = '360px';
  innerContainer.style.maxHeight = '60vh';
  innerContainer.style.overflow = 'auto';
  innerContainer.style.pointerEvents = 'auto';
  innerContainer.style.backgroundColor = '#ffffff';
  innerContainer.style.borderRadius = '12px';
  innerContainer.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
  innerContainer.style.padding = '16px';
  innerContainer.style.fontSize = '14px';
  
  panelContainer.appendChild(innerContainer);
  document.body.appendChild(panelContainer);
  
  return panelContainer;
};

/**
 * 清理DOM引用
 */
export const cleanupDOMRefs = (refs: DOMRefs): void => {
  if (refs.button) {
    refs.button.remove();
    refs.button = null;
  }
  if (refs.panelContainer) {
    refs.panelContainer.remove();
    refs.panelContainer = null;
  }
  refs.root = null;
};

export function showToast(message: string, type: 'success' | 'error'): void {
  const toast = document.createElement('div');
  toast.className = `magnet-picker-toast magnet-picker-toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

export function isValidPage(): boolean {
  const url = window.location.href;
  const pattern = /^https:\/\/www\.javbus\.com\/[a-zA-Z]+-\d+$/;
  return pattern.test(url);
} 