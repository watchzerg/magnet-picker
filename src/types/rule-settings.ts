export interface RuleSettings {
    requiredThreshold: number;
    preferredThreshold: number;
    targetCount: number;
}

export interface RuleSettingsProps {
    initialSettings: RuleSettings;
    onSettingsChange: (settings: RuleSettings) => void;
} 