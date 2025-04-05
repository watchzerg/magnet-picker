import React, { useState, useEffect } from 'react';
import { MagnetRule } from '../../types/rule';
import RuleList from './RuleList';

interface RuleManagerProps {
    initialRules: MagnetRule[];
    onRulesChange: (rules: MagnetRule[]) => void;
    initialSettings: any;
    onSettingsChange: (settings: any) => void;
}

const RuleManager: React.FC<RuleManagerProps> = ({
    initialRules,
    onRulesChange,
    initialSettings,
    onSettingsChange
}) => {
    console.log('RuleManager组件渲染，初始规则:', initialRules);
    const [rules, setRules] = useState<MagnetRule[]>(initialRules || []);

    useEffect(() => {
        console.log('RuleManager接收到新的initialRules:', initialRules);
        if (initialRules) {
            setRules(initialRules);
        }
    }, [initialRules]);

    const handleRulesChange = (newRules: MagnetRule[]) => {
        console.log('规则列表更新:', newRules);
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