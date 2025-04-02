import { ToastProps } from '../types/content';

/**
 * 显示Toast消息
 */
export const showToast = (message: string, type: 'success' | 'error'): void => {
  const toast = document.createElement('div');
  toast.className = `magnet-picker-toast magnet-picker-toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
};

/**
 * 显示成功消息
 */
export const showSuccessMessage = (message: string): void => {
  showToast(message, 'success');
};

/**
 * 显示错误消息
 */
export const showErrorMessage = (message: string): void => {
  showToast(message, 'error');
}; 