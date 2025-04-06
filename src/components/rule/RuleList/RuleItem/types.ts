import { MagnetRule } from '../../../../types/rule';
import { DraggableProvided } from 'react-beautiful-dnd';

export interface RuleItemProps {
    rule: MagnetRule;
    index: number;
    isExpanded: boolean;
    isValid: boolean;
    onToggleExpand: (ruleId: string) => void;
    onToggleRule: (index: number) => void;
    onDelete: (index: number) => void;
    onChange: (index: number, rule: MagnetRule) => void;
    ruleNumber: number;
    rules: MagnetRule[];
}

export interface RuleItemHeaderProps extends RuleItemProps {
    provided: DraggableProvided;
} 