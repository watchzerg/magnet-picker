import React from 'react';

interface TargetCountSelectorProps {
    value: number;
    onChange: (value: number) => void;
}

const TargetCountSelector: React.FC<TargetCountSelectorProps> = ({ value, onChange }) => {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                目标数量
            </label>
            <div className="flex items-center gap-4">
                <div className="w-12 text-center font-medium bg-gray-100 py-1 rounded">
                    {value}
                </div>
                <input
                    type="range"
                    min="1"
                    max="10"
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
            </div>
        </div>
    );
};

export default TargetCountSelector; 