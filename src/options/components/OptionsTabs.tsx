import React, { useState } from 'react';
import { MagnetManagementTab } from './MagnetManagementTab';
import RuleList from '../../components/rule/RuleList/index';
import { useRules } from '../hooks/useRules';

export const OptionsTabs: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'management' | 'rules'>('management');
    const { rules, handleRulesChange } = useRules();

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Magnet Picker</h1>
            
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('management')}
                        className={`${
                            activeTab === 'management'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        磁力链接管理
                    </button>
                    <button
                        onClick={() => setActiveTab('rules')}
                        className={`${
                            activeTab === 'rules'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        磁链保存规则
                    </button>
                </nav>
            </div>

            <div className="mt-6">
                {activeTab === 'management' ? <MagnetManagementTab /> : <RuleList
                    rules={rules}
                    onChange={handleRulesChange}
                />}
            </div>
        </div>
    );
}; 