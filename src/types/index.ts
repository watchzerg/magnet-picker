import { MagnetInfo } from './magnet';

// 消息类型定义
export type Message = 
  | { type: 'GET_PAGE_STATE'; url: string }
  | { type: 'SAVE_PAGE_STATE'; state: PageState }
  | { type: 'SAVE_MAGNETS'; data: MagnetInfo[] }
  | { type: 'GET_MAGNETS' }
  | { type: 'REMOVE_MAGNET'; data: MagnetInfo }
  | { type: 'PARSE_MAGNETS' }
  | { type: 'CLEANUP_PAGE_STATES'; maxAge: number };

export interface StorageData {
  magnets: MagnetInfo[];
}

// 页面状态接口
export interface PageState {
  url: string;             // 页面URL
  savedMagnets: string[];  // 已保存的磁力链接哈希值
  hasDefaultSave: boolean; // 是否已执行过默认保存
  lastUpdate: number;      // 最后更新时间戳
}

// 会话存储中的状态数据
export interface SessionState {
  [url: string]: PageState;
} 