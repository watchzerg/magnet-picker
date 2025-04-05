import { MagnetRule } from '../types/rule';

export const useRuleDragDrop = (
    rules: MagnetRule[],
    onChange: (rules: MagnetRule[]) => void
) => {
    const handleDragEnd = (result: any) => {
        if (!result.destination) return;

        const newRules = [...rules];
        const [removed] = newRules.splice(result.source.index, 1);
        newRules.splice(result.destination.index, 0, removed);

        // 更新规则顺序
        newRules.forEach((rule, index) => {
            rule.order = index;
        });

        onChange(newRules);
    };

    return {
        handleDragEnd
    };
}; 