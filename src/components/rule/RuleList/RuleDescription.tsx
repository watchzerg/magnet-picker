import React from 'react';

const RuleDescription: React.FC = () => {
    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">规则配置说明</h3>
            <div className="space-y-4">
                {/* 基础规则说明 */}
                <div className="space-y-2">
                    <div className="text-blue-800">
                        <span className="font-medium">1. 基础评分：</span>
                        <span className="text-gray-600">每个磁链的初始评分等于文件大小（字节数）</span>
                    </div>
                    <div className="text-blue-800">
                        <span className="font-medium">2. 规则修正：</span>
                        <span className="text-gray-600">系统会根据您配置的规则对初始评分进行修正，计算最终评分</span>
                    </div>
                </div>

                {/* 操作说明 */}
                <div className="space-y-2">
                    <div className="text-gray-600">
                        <span className="font-medium text-blue-800">• 规则启用/禁用：</span>
                        点击"规则已启用/禁用"按钮可以切换规则的启用状态
                    </div>
                    <div className="text-gray-600">
                        <span className="font-medium text-blue-800">• 匹配中止：</span>
                        点击"启用/禁用匹配中止"按钮可以控制是否在匹配成功后中止后续规则的匹配
                    </div>
                </div>

                {/* 自动保存规则 */}
                <div className="space-y-2">
                    <div className="font-medium text-blue-800">3. 自动保存规则：</div>
                    <div className="pl-4 space-y-2 text-gray-600">
                        <div>• 优先保存最终评分超过<span className="font-bold text-blue-800">必选阈值</span>（默认10G）的磁链</div>
                        <div>• 如果磁链数量不足<span className="font-bold text-blue-800">目标数量</span>（默认5），则从剩余磁链中选择评分超过<span className="font-bold text-blue-800">优选阈值</span>（默认5G）的，按体积从大到小保存，直到达到目标数量</div>
                        <div>• 如果仍不足<span className="font-bold text-blue-800">目标数量</span>，则从剩余磁链中按体积从大到小保存，直到达到目标数量</div>
                    </div>
                    <div className="pl-4 text-gray-500 text-sm">
                        提示：您可以通过配置不同的规则来调整磁链的最终评分，从而影响自动保存的结果
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RuleDescription; 