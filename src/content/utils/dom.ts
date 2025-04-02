import { MagnetInfo } from '../../types/magnet';

export function createFloatingButton(): HTMLButtonElement {
  const button = document.createElement('button');
  button.className = 'magnet-picker-button';
  button.textContent = '解析磁力链接';
  return button;
}

export function createPanelContainer(): HTMLDivElement {
  const container = document.createElement('div');
  container.id = 'magnet-picker-panel';
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.right = '0';
  container.style.zIndex = '999999';
  container.style.display = 'block';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.pointerEvents = 'none';
  
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
  
  container.appendChild(innerContainer);
  return container;
}

export function showToast(message: string, type: 'success' | 'error'): void {
  const toast = document.createElement('div');
  toast.className = `magnet-picker-toast magnet-picker-toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

export function isValidPage(): boolean {
  const url = window.location.href;
  const pattern = /^https:\/\/www\.javbus\.com\/[A-Z]+-\d+$/;
  return pattern.test(url);
} 