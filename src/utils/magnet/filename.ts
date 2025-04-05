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
 * 检查文件名是否包含关键字，返回匹配到的关键字
 */
export const checkFilenameContains = (fileName: string, keywords: string[]): { matched: boolean; matchedKeyword?: string } => {
    const nameWithoutExt = getFileNameWithoutExtension(fileName).toLowerCase();
    const matchedKeyword = keywords.find(keyword => nameWithoutExt.includes(keyword.toLowerCase()));
    console.log(`[规则匹配] 文件名包含关键字检查 - 文件名: ${nameWithoutExt}, 关键字列表: [${keywords.join(', ')}], 匹配结果: ${!!matchedKeyword}${matchedKeyword ? `, 匹配关键字: ${matchedKeyword}` : ''}`);
    return {
        matched: !!matchedKeyword,
        matchedKeyword
    };
};

/**
 * 检查文件名后缀是否匹配，返回匹配到的后缀
 */
export const checkFilenameSuffix = (fileName: string, suffixes: string[]): { matched: boolean; matchedSuffix?: string } => {
    const nameWithoutExt = getFileNameWithoutExtension(fileName).toLowerCase();
    const matchedSuffix = suffixes.find(suffix => nameWithoutExt.endsWith(suffix.toLowerCase()));
    console.log(`[规则匹配] 文件名后缀检查 - 文件名: ${nameWithoutExt}, 后缀列表: [${suffixes.join(', ')}], 匹配结果: ${!!matchedSuffix}${matchedSuffix ? `, 匹配后缀: ${matchedSuffix}` : ''}`);
    return {
        matched: !!matchedSuffix,
        matchedSuffix
    };
};

/**
 * 检查文件扩展名是否匹配，返回匹配到的扩展名
 */
export const checkFileExtension = (fileName: string, extensions: string[]): { matched: boolean; matchedExtension?: string } => {
    const ext = getFileExtension(fileName).toLowerCase();
    const matchedExtension = ext && extensions.find(extension => ext === extension.toLowerCase());
    console.log(`[规则匹配] 文件扩展名检查 - 文件名: ${fileName}, 扩展名: ${ext}, 目标扩展名列表: [${extensions.join(', ')}], 匹配结果: ${!!matchedExtension}${matchedExtension ? `, 匹配扩展名: ${matchedExtension}` : ''}`);
    return {
        matched: ext !== '' && !!matchedExtension,
        matchedExtension
    };
};

export function checkFilenameRegex(pattern: string, filename: string): { matched: boolean; matches: string[] } {
  try {
    const regex = new RegExp(pattern);
    const matches = filename.match(regex);
    console.log(`[规则匹配] 文件名正则检查 - 文件名: ${filename}, 正则表达式: ${pattern}, 匹配结果: ${matches !== null}${matches ? `, 匹配内容: [${matches.join(', ')}]` : ''}`);
    return {
      matched: matches !== null,
      matches: matches ? matches : []
    };
  } catch (e: unknown) {
    const error = e as Error;
    console.error(`[规则匹配] 正则表达式错误 - 模式: ${pattern}, 错误: ${error.message}`);
    return {
      matched: false,
      matches: []
    };
  }
} 