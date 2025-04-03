import React, { useState } from 'react';
import { ShareDateRuleConfig } from '../../../types/rule';
import ScoreMultiplierSelect from './common/ScoreMultiplierInput';

interface ShareDateEditorProps {
    config: ShareDateRuleConfig;
    onChange: (config: ShareDateRuleConfig) => void;
}

const ShareDateEditor: React.FC<ShareDateEditorProps> = ({ config, onChange }) => {
    const [dateValue, setDateValue] = useState(config.date || '');

    const handleDateChange = (date: string) => {
        setDateValue(date);
        onChange({
            ...config,
            date
        });
    };

    return (
        <div className="flex items-center justify-between gap-4">
            {/* 左侧：条件选择 */}
            <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                    条件
                </label>
                <select
                    value={config.condition}
                    onChange={(e) => onChange({
                        ...config,
                        condition: e.target.value as 'before' | 'equal' | 'after'
                    })}
                    className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                    <option value="before">早于</option>
                    <option value="equal">等于</option>
                    <option value="after">晚于</option>
                </select>
                <input
                    type="date"
                    value={dateValue}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
            </div>
            
            {/* 右侧：得分系数 */}
            <ScoreMultiplierSelect
                value={config.scoreMultiplier}
                onChange={(value) => onChange({ ...config, scoreMultiplier: value })}
            />
        </div>
    );
};

export default ShareDateEditor; 