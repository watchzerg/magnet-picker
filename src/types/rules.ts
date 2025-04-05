export type RuleType = 'filename' | 'extension' | 'date';

export interface Rule {
  id: string;
  type: RuleType;
  pattern: string;
  weight: number;
  enabled: boolean;
  description: string;
} 