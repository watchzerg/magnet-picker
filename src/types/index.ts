export interface MagnetInfo {
  url: string;      // 磁力链接
  fileName: string; // 文件名
  fileSize: string; // 文件大小
  date: string;     // 发布日期
}

export interface Message {
  type: 'PARSE_MAGNETS' | 'SAVE_MAGNETS' | 'GET_MAGNETS' | 'REMOVE_MAGNET';
  data?: any;
}

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