import React from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OptionsTabs } from './components/OptionsTabs';
import './options.css';

console.log('Options script loaded');

console.log('Initializing React app...');
try {
    const container = document.getElementById('root');
    if (container) {
        console.log('Found root container, creating React root...');
        const root = createRoot(container);
        console.log('Rendering React app...');
        root.render(
            <ErrorBoundary>
                <OptionsTabs />
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