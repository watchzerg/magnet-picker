import React, { useState } from 'react';
import { MagnetRule } from '../../types/rule';
import RuleList from './RuleList';

interface RuleManagerProps {
    initialRules: MagnetRule[];
    initialSettings: {
        requiredThreshold: number;
        preferredThreshold: number;
        targetCount: number;
    };
    onRulesChange: (rules: MagnetRule[]) => void;
    onSettingsChange: (settings: {
        requiredThreshold: number;
        preferredThreshold: number;
        targetCount: number;
    }) => void;
}

const RuleManager: React.FC<RuleManagerProps> = ({
    initialRules,
    initialSettings,
    onRulesChange,
    onSettingsChange
}) => {
    const [rules, setRules] = useState<MagnetRule[]>(initialRules);

    const handleRulesChange = (newRules: MagnetRule[]) => {
        setRules(newRules);
        onRulesChange(newRules);
    };

    return (
        <div>
            <RuleList
                rules={rules}
                onChange={handleRulesChange}
                onSettingsChange={onSettingsChange}
                initialSettings={initialSettings}
            />
        </div>
    );
};

export default RuleManager; 