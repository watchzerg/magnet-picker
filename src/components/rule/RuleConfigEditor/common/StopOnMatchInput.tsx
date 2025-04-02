import React from 'react';

interface StopOnMatchInputProps {
    value: boolean;
    onChange: (value: boolean) => void;
}

const StopOnMatchInput: React.FC<StopOnMatchInputProps> = ({ value, onChange }) => {
    return (
        <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 min-w-[4rem]">
                中止规则
            </label>
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => onChange(e.target.checked)}
                    className="w-4 h-4"
                />
                <span className="text-sm text-gray-500">
                    匹配后停止执行后续规则
                </span>
            </div>
        </div>
    );
};

export default StopOnMatchInput; 