import React from 'react';
import { ChevronRight } from 'lucide-react';
import { MagnetRule } from '../../../../types/rule';
import { generateRuleOverview } from '../../../../utils/rule/rule-overview';
import { getRulePreview } from '../../utils/rule-utils';
import { validateRule } from '../../utils/validation';

interface RuleItemPreviewProps {
    rule: MagnetRule;
    isValid: boolean;
    rules: MagnetRule[];
}

const RuleItemPreview: React.FC<RuleItemPreviewProps> = ({ rule, isValid, rules }) => {
    const ruleOverview = isValid ? generateRuleOverview(rule) : null;
    const { message: errorMessage } = validateRule(rule.type, rule.config, rule, rules);

    return (
        <div className="text-gray-500 flex-1 flex items-center">
            {ruleOverview && (
                <div className="bg-blue-50 rounded-lg flex items-center overflow-hidden">
                    <div className="px-3 py-1.5 font-medium text-blue-700">
                        {ruleOverview.condition}
                    </div>
                    <div className="px-1 text-blue-300">
                        <ChevronRight className="w-4 h-4" />
                    </div>
                    <div className="px-3 py-1.5 font-medium text-green-700 bg-green-50/50">
                        {ruleOverview.scoreMultiplier}%
                    </div>
                </div>
            )}
            {!isValid && errorMessage && (
                <span className="ml-2 text-red-500 text-sm">
                    {errorMessage}
                </span>
            )}
        </div>
    );
};

export default RuleItemPreview; 