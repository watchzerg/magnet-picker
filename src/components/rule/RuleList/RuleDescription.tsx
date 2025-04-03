import React from 'react';

const RuleDescription: React.FC = () => {
    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">规则配置说明</h3>
            <div className="space-y-3 text-blue-700">
                <p>
                    <span className="font-medium">1. 基础评分：</span>
                    每个磁链的初始评分等于文件大小（字节数）
                </p>
                <p>
                    <span className="font-medium">2. 规则修正：</span>
                    系统会根据您配置的规则对初始评分进行修正，计算最终评分
                </p>
                <p>
                    <span className="font-medium">3. 自动保存规则：</span>
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>优先保存最终评分超过10GB的磁链</li>
                    <li>如果数量不足3个，则从剩余磁链中选择评分超过5GB的，按体积从大到小保存，直到达到5个</li>
                    <li>如果仍不足5个，则从剩余磁链中按体积从大到小保存，直到达到3个</li>
                </ul>
                <p className="text-sm text-blue-600 mt-2">
                    提示：您可以通过配置不同的规则来调整磁链的最终评分，从而影响自动保存的结果
                </p>
            </div>
        </div>
    );
};

export default RuleDescription; 