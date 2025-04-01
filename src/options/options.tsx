import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MagnetInfo } from '../types/magnet';
import { getMagnetsFromStorage, sortMagnetsBySize } from '../utils/magnet';
import { MagnetList } from '../components/MagnetList';
import './options.css';

console.log('Options script loaded');

const ITEMS_PER_PAGE = 30;

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

const OptionsPage: React.FC = () => {
    console.log('OptionsPage component rendering');
    const [magnets, setMagnets] = useState<MagnetInfo[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('OptionsPage useEffect running');
        loadMagnets();
    }, []);

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

    const handleDeleteMagnet = async (hash: string) => {
        try {
            const updatedMagnets = magnets.filter(m => m.hash !== hash);
            await chrome.storage.local.set({ magnets: updatedMagnets });
            setMagnets(updatedMagnets);
        } catch (error) {
            console.error('删除磁力链接失败:', error);
        }
    };

    const handleClearAll = async () => {
        try {
            await chrome.storage.local.set({ magnets: [] });
            setMagnets([]);
        } catch (error) {
            console.error('清空磁力链接失败:', error);
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="text-center py-8">加载中...</div>
            </div>
        );
    }

    return (
        <div className="container">
            <h1 className="text-2xl font-bold mb-6">Magnet Picker 设置</h1>
            <div className="tabs">
                <div className="tab active">磁力链接浏览</div>
                <div className="tab">选取规则配置</div>
            </div>
            <MagnetList
                magnets={magnets}
                currentPage={currentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
                onDeleteMagnet={handleDeleteMagnet}
                onClearAll={handleClearAll}
            />
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
                <OptionsPage />
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