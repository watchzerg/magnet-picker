export * from './validation';
export * from './hash';
export * from './size';
export * from './scoring';
export * from './storage';
export * from './filename';
export * from './date';
export * from './rule-matcher';

/**
 * 格式化评分为人类可读的格式
 */
export const formatScore = (score: number): string => {
  if (score === 0) return '0 Score';
  
  const units = ['', 'K', 'M', 'G', 'T'];
  const base = 1024;
  const exponent = Math.min(Math.floor(Math.log(score) / Math.log(base)), units.length - 1);
  const value = (score / Math.pow(base, exponent)).toFixed(2);
  
  return `${value} ${units[exponent]}-Score`;
}; 