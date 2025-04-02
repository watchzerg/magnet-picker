export interface MagnetInfo {
    url: string;      // Magnet链接
    fileName: string; // 文件名
    fileSize: number; // 文件大小（字节）
    date: string;     // 发布日期
    hash: string;     // Magnet哈希值
    saveTime: string; // 保存时间
}

export interface MagnetStorage {
    [hash: string]: MagnetInfo;
}

export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export interface MagnetListProps {
    magnets: MagnetInfo[];
    currentPage: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onDeleteMagnet: (hash: string) => void;
    onClearAll: () => void;
} 