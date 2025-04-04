export interface MagnetInfo {
    magnet_link: string;      // Magnet链接
    fileName: string; // 文件名
    fileSize: number; // 文件大小（字节）
    date: string;     // 发布日期
    magnet_hash: string;     // Magnet哈希值
    saveTime: string; // 保存时间
    source_url: string; // 来源页面URL
    catalog_number: string; // 番号
}

export interface MagnetStorage {
    [magnet_hash: string]: MagnetInfo;
}

export interface StorageData {
    magnets: MagnetStorage;
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