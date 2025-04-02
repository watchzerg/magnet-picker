import React from 'react';
import { MagnetInfo } from '../types/magnet';

interface MagnetPanelProps {
  magnets: MagnetInfo[];
  savedMagnets: MagnetInfo[];
  onClose: () => void;
}

export const MagnetPanel: React.FC<MagnetPanelProps> = ({ magnets, savedMagnets, onClose }) => {
  console.log('MagnetPanel: 渲染面板，磁力链接数量:', magnets.length);
  
  // 按文件大小排序（从大到小）
  const sortedMagnets = [...magnets].sort((a, b) => {
    const sizeA = parseFloat(a.fileSize.replace(/[^0-9.]/g, ''));
    const sizeB = parseFloat(b.fileSize.replace(/[^0-9.]/g, ''));
    return sizeB - sizeA;
  });

  // 判断磁力链接是否已保存
  const isMagnetSaved = (magnet: MagnetInfo) => {
    return savedMagnets.some(saved => saved.hash === magnet.hash);
  };

  console.log('MagnetPanel: 排序后的磁力链接:', sortedMagnets);

  return (
    <div 
      className="magnet-panel"
      onClick={(e) => {
        e.stopPropagation();
        console.log('MagnetPanel: 点击面板内部');
      }}
    >
      <div className="magnet-panel-header">
        <h3 className="magnet-panel-title">
          磁力链接 ({magnets.length})
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            console.log('MagnetPanel: 点击关闭按钮');
            onClose();
          }}
          className="magnet-panel-close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="magnet-panel-content">
        {sortedMagnets.map((magnet) => {
          const isSaved = isMagnetSaved(magnet);
          return (
            <div 
              key={magnet.hash}
              className={`magnet-item ${isSaved ? 'magnet-item-saved' : 'magnet-item-unsaved'}`}
            >
              <div className="magnet-item-content">
                <div className="magnet-item-header">
                  <span className="magnet-item-title">
                    {magnet.fileName}
                  </span>
                  {isSaved && (
                    <span className="magnet-item-badge">
                      已保存
                    </span>
                  )}
                </div>
                <div className="magnet-item-info">
                  <span>{magnet.fileSize}</span>
                  <span>•</span>
                  <span>Hash: {magnet.hash.slice(0, 6)}</span>
                </div>
                <a
                  href={magnet.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    console.log('MagnetPanel: 点击下载链接:', magnet.fileName);
                  }}
                  className={`magnet-item-download ${
                    isSaved ? 'magnet-item-download-saved' : 'magnet-item-download-unsaved'
                  }`}
                  title="下载"
                >
                  下载
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 