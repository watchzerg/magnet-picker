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
                <button
                    onClick={() => onChange(!value)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        value 
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    {value ? '已启用' : '已禁用'}
                </button>
                <span className="text-sm text-gray-500">
                    匹配后停止执行后续规则
                </span>
            </div>
        </div>
    );
};

export default StopOnMatchInput; 