/**
 * 从视频标题中解析番号（catalog number）
 * @param title 视频标题
 * @returns 解析出的番号，如果没有找到则返回 null
 * 
 * @example
 * parseCatalogNumber("SSPD-102 処刑遊戯2013 瞳リョウ") // 返回 "SSPD-102"
 * parseCatalogNumber("无效的标题") // 返回 null
 */
export function parseCatalogNumber(title: string): string | null {
  if (!title) return null;

  // 正则表达式匹配番号格式
  const regex = /^[A-Za-z][A-Za-z0-9]{1,5}-[0-9]{2,6}(?![0-9])/;
  const match = title.match(regex);

  return match ? match[0] : null;
}

/**
 * 检查字符串是否是有效的番号格式
 * @param code 要检查的字符串
 * @returns 是否是有效的番号格式
 * 
 * @example
 * isValidCatalogNumber("SSPD-102") // 返回 true
 * isValidCatalogNumber("无效的番号") // 返回 false
 */
export function isValidCatalogNumber(code: string): boolean {
  if (!code) return false;

  const regex = /^[A-Za-z][A-Za-z0-9]{1,5}-[0-9]{2,6}(?![0-9])/;
  return regex.test(code);
} 