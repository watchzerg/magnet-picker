import { useState, useEffect } from 'react';
import { MagnetRule } from '../../types/rule';

export const useRules = () => {
    const [rules, setRules] = useState<MagnetRule[]>([]);

    useEffect(() => {
        chrome.storage.local.get(['magnetRules'], (result) => {
            if (result.magnetRules) {
                setRules(result.magnetRules);
            }
        });
    }, []);

    const handleRulesChange = (newRules: MagnetRule[]) => {
        chrome.storage.local.set({ magnetRules: newRules });
        setRules(newRules);
    };

    return {
        rules,
        handleRulesChange
    };
}; 