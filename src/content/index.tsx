/// <reference types="chrome"/>

import React from 'react';
import { createRoot } from 'react-dom/client';
import { MagnetPicker } from './components/MagnetPicker';
import { MagnetService } from './services/MagnetService';
import { StorageService } from './services/StorageService';

// 创建服务实例
const magnetService = new MagnetService();
const storageService = new StorageService(window.location.href);

// 创建React根节点
const container = document.createElement('div');
document.body.appendChild(container);
const root = createRoot(container);

// 渲染组件
root.render(
  <MagnetPicker 
    magnetService={magnetService}
    storageService={storageService}
  />
); 