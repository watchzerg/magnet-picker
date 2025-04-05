import { MagnetInfo } from '../../types/magnet';
import { 
    FilenameContainsRuleConfig, 
    FilenameSuffixRuleConfig, 
    FileExtensionRuleConfig 
} from '../../types/rule';

/**
 * 获取文件名（不含扩展名）
 */
export const getFileNameWithoutExtension = (fileName: string): string => {
    const lastDotIndex = fileName.lastIndexOf('.');
    return lastDotIndex === -1 ? fileName : fileName.substring(0, lastDotIndex);
};

/**
 * 获取文件扩展名（小写）
 */
export const getFileExtension = (fileName: string): string => {
    const lastDotIndex = fileName.lastIndexOf('.');
    return lastDotIndex === -1 ? '' : fileName.substring(lastDotIndex + 1).toLowerCase();
};

/**
 * 检查文件名是否包含关键字
 */
export const checkFilenameContains = (fileName: string, keywords: string[]): boolean => {
    const nameWithoutExt = getFileNameWithoutExtension(fileName);
    return keywords.some(keyword => nameWithoutExt.includes(keyword));
};

/**
 * 检查文件名后缀是否匹配
 */
export const checkFilenameSuffix = (fileName: string, suffixes: string[]): boolean => {
    const nameWithoutExt = getFileNameWithoutExtension(fileName);
    return suffixes.some(suffix => nameWithoutExt.endsWith(suffix));
};

/**
 * 检查文件扩展名是否匹配
 */
export const checkFileExtension = (fileName: string, extensions: string[]): boolean => {
    const ext = getFileExtension(fileName);
    return ext !== '' && extensions.some(extension => ext === extension.toLowerCase());
}; 