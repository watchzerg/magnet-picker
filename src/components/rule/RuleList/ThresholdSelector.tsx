import React from 'react';
import { SCORE_UNITS, DEFAULT_REQUIRED_OPTIONS, DEFAULT_PREFERRED_OPTIONS } from '../../../constants/rule-settings';

interface ThresholdSelectorProps {
    type: 'required' | 'preferred';
    value: number;
    isCustom: boolean;
    customValue: string;
    customUnit: string;
    onValueChange: (value: string | number) => void;
    onCustomValueChange: (value: string, unit: string) => void;
}

const ThresholdSelector: React.FC<ThresholdSelectorProps> = ({
    type,
    value,
    isCustom,
    customValue,
    customUnit,
    onValueChange,
    onCustomValueChange
}) => {
    const options = type === 'required' ? DEFAULT_REQUIRED_OPTIONS : DEFAULT_PREFERRED_OPTIONS;
    const label = type === 'required' ? '必选阈值' : '优选阈值';

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                {label}
            </label>
            <div className="flex gap-2">
                <select
                    value={isCustom ? 'custom' : value}
                    onChange={(e) => onValueChange(e.target.value)}
                    className="block w-28 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                    {options.map(option => (
                        <option key={option.label} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {isCustom && (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={customValue}
                            onChange={(e) => onCustomValueChange(e.target.value, customUnit)}
                            className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                        <select
                            value={customUnit}
                            onChange={(e) => onCustomValueChange(customValue, e.target.value)}
                            className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                            {SCORE_UNITS.map(unit => (
                                <option key={unit.value} value={unit.value}>
                                    {unit.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ThresholdSelector; 