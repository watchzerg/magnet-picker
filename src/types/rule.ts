export interface MagnetRule {
    id: string;           // 规则唯一标识
    enabled: boolean;     // 是否启用
    stopOnMatch: boolean; // 匹配后是否中止后续规则
    order: number;        // 规则顺序
}

export type MagnetRules = MagnetRule[]; 