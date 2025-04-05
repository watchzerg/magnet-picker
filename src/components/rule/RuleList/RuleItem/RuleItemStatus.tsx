import React from 'react';

interface RuleItemStatusProps {
    enabled: boolean;
    ruleNumber: number;
}

const RuleItemStatus: React.FC<RuleItemStatusProps> = ({ enabled, ruleNumber }) => {
    return (
        <div className="min-w-[32px] h-[32px] flex items-center justify-center">
            {enabled ? (
                <div className="w-[28px] h-[28px] rounded-full bg-blue-100 text-blue-800 font-bold text-lg flex items-center justify-center">
                    {ruleNumber}
                </div>
            ) : (
                <div className="w-[28px] h-[28px] rounded-full bg-gray-100 text-gray-400 font-bold text-lg flex items-center justify-center">
                    -
                </div>
            )}
        </div>
    );
};

export default RuleItemStatus; 