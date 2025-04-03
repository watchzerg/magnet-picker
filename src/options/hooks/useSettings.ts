import { useState, useEffect } from 'react';

interface MagnetSettings {
    requiredThreshold: number;
    preferredThreshold: number;
    targetCount: number;
}

const DEFAULT_SETTINGS: MagnetSettings = {
    requiredThreshold: 10 * 1024 * 1024 * 1024, // 10G-score
    preferredThreshold: 5 * 1024 * 1024 * 1024, // 5G-score
    targetCount: 5
};

export const useSettings = () => {
    const [settings, setSettings] = useState<MagnetSettings>(DEFAULT_SETTINGS);

    useEffect(() => {
        chrome.storage.local.get(['magnetSettings'], (result) => {
            if (result.magnetSettings) {
                setSettings(result.magnetSettings);
            }
        });
    }, []);

    const handleSettingsChange = (newSettings: MagnetSettings) => {
        chrome.storage.local.set({ magnetSettings: newSettings });
        setSettings(newSettings);
    };

    return {
        settings,
        handleSettingsChange
    };
}; 