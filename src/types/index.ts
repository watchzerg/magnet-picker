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