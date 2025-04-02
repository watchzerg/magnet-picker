import { MagnetInfo } from '../../types/magnet';
import { Root as ReactDOMRoot } from 'react-dom/client';

// 内容脚本特有的类型定义
export interface ContentScriptState {
  isPanelVisible: boolean;
  currentMagnets: MagnetInfo[];
}

export interface PanelProps {
  magnets: MagnetInfo[];
  savedStates: Map<string, boolean>;
  onClose: () => void;
  onToggleSave: (magnet: MagnetInfo, isSaved: boolean) => void;
}

export interface ToastProps {
  message: string;
  type: 'success' | 'error';
  duration?: number;
  onClose: () => void;
}

// DOM元素引用类型
export interface DOMRefs {
  button: HTMLDivElement | null;
  panelContainer: HTMLDivElement | null;
  root: ReactDOMRoot | null;
} 