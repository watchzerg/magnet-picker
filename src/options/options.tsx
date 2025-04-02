import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MagnetInfo } from '../types/magnet';
import { getMagnetsFromStorage, sortMagnetsBySize } from '../utils/magnet';
import { MagnetList } from '../components/magnet/MagnetList';
import RuleList from '../components/rule/RuleList';
import './options.css';
import { MagnetRule } from '../types/rule';

console.log('Options script loaded');

const ITEMS_PER_PAGE = 20;

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('React error boundary caught error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', color: 'red' }}>
                    <h2>组件渲染错误</h2>
                    <pre>{this.state.error?.message}</pre>
                    <pre>{this.state.error?.stack}</pre>
                </div>
            );
        }

        return this.props.children;
    }
}

// 磁力链接管理标签页组件
const MagnetManagementTab: React.FC = () => {
    const [magnets, setMagnets] = useState<MagnetInfo[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(false);

    useEffect(() => {
        console.log('MagnetManagementTab useEffect running');
        loadMagnets();
        
        const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
            if (changes.magnets) {
                console.log('Storage changed, reloading magnets...');
                loadMagnets();
            }
        };

        chrome.storage.onChanged.addListener(handleStorageChange);

        return () => {
            chrome.storage.onChanged.removeListener(handleStorageChange);
        };
    }, []);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        
        if (autoRefresh) {
            timer = setInterval(() => {
                console.log('Auto refreshing magnets...');
                loadMagnets();
            }, 5000);
        }

        return () => {
            if (timer) {
                clearInterval(timer);
            }
        };
    }, [autoRefresh]);

    const loadMagnets = async () => {
        try {
            console.log('Loading magnets from storage...');
            const magnetList = await getMagnetsFromStorage();
            if (magnetList.length > 0) {
                console.log('First magnet data format:', JSON.stringify(magnetList[0], null, 2));
            }
            console.log('Loaded magnets:', magnetList);
            const sortedMagnets = sortMagnetsBySize(magnetList);
            setMagnets(sortedMagnets);
        } catch (error) {
            console.error('加载磁力链接失败:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-8">加载中...</div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">磁力链接管理</h2>
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            className="form-checkbox h-5 w-5 text-blue-600"
                        />
                        <span>自动刷新</span>
                    </label>
                </div>
            </div>
            <MagnetList
                magnets={magnets}
                currentPage={currentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
                onDeleteMagnet={async (hash) => {
                    try {
                        const updatedMagnets = magnets.filter(m => m.hash !== hash);
                        await chrome.storage.local.set({ magnets: updatedMagnets });
                        setMagnets(updatedMagnets);
                    } catch (error) {
                        console.error('删除磁力链接失败:', error);
                    }
                }}
                onClearAll={async () => {
                    try {
                        await chrome.storage.local.set({ magnets: [] });
                        setMagnets([]);
                    } catch (error) {
                        console.error('清空磁力链接失败:', error);
                    }
                }}
            />
        </div>
    );
};

const Options: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'management' | 'rules'>('management');
    const [rules, setRules] = useState<MagnetRule[]>([]);

    // 从 Chrome Storage 加载规则
    useEffect(() => {
        chrome.storage.local.get(['magnetRules'], (result) => {
            if (result.magnetRules) {
                setRules(result.magnetRules);
            }
        });
    }, []);

    // 保存规则到 Chrome Storage
    const handleRulesChange = (newRules: MagnetRule[]) => {
        chrome.storage.local.set({ magnetRules: newRules });
        setRules(newRules);
    };

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

console.log('Initializing React app...');
try {
    const container = document.getElementById('root');
    if (container) {
        console.log('Found root container, creating React root...');
        const root = createRoot(container);
        console.log('Rendering React app...');
        root.render(
            <ErrorBoundary>
                <Options />
            </ErrorBoundary>
        );
        console.log('React app rendered');
    } else {
        console.error('Root container not found');
    }
} catch (error) {
    console.error('Error initializing React app:', error);
    const errorDisplay = document.getElementById('error-display');
    if (errorDisplay) {
        errorDisplay.innerHTML = `
            <div style="color: red; padding: 20px;">
                <h2>React 初始化错误</h2>
                <pre>${error instanceof Error ? error.message : String(error)}</pre>
                <pre>${error instanceof Error ? error.stack : ''}</pre>
            </div>
        `;
    }
} 