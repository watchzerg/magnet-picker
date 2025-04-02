import React from 'react';
import { MagnetInfo } from '../types/magnet';

interface MagnetPanelProps {
  magnets: MagnetInfo[];
  savedMagnets: MagnetInfo[];
  onClose: () => void;
  onToggleSave: (magnet: MagnetInfo, isSaved: boolean) => void;
}

export const MagnetPanel: React.FC<MagnetPanelProps> = ({ 
  magnets, 
  savedMagnets, 
  onClose,
  onToggleSave 
}) => {
  console.log('MagnetPanel: 渲染面板，磁力链接数量:', magnets.length);
  
  // 判断磁力链接是否已保存
  const isMagnetSaved = (magnet: MagnetInfo) => {
    return savedMagnets.some(saved => saved.hash === magnet.hash);
  };

  const handleMagnetClick = (magnet: MagnetInfo, isSaved: boolean) => {
    console.log(`MagnetPanel: ${isSaved ? '取消保存' : '保存'}磁力链接:`, magnet.fileName);
    onToggleSave(magnet, isSaved);
  };

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
        {magnets.map((magnet) => {
          const isSaved = isMagnetSaved(magnet);
          return (
            <div 
              key={magnet.hash}
              className={`magnet-item ${isSaved ? 'magnet-item-saved' : 'magnet-item-unsaved'}`}
              onClick={() => handleMagnetClick(magnet, isSaved)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleMagnetClick(magnet, isSaved);
                }
              }}
            >
              <div className="magnet-item-content">
                <div className="magnet-item-header">
                  <span className="magnet-item-title">
                    {magnet.fileName}
                  </span>
                  {isSaved ? (
                    <span className="magnet-item-badge">
                      已保存 - 点击取消
                    </span>
                  ) : (
                    <span className="magnet-item-badge magnet-item-badge-unsaved">
                      点击保存
                    </span>
                  )}
                </div>
                <div className="magnet-item-info">
                  <span>{magnet.fileSize}</span>
                  <span>•</span>
                  <span>Hash: {magnet.hash.slice(0, 6)}</span>
                  <a
                    href={magnet.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
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
            </div>
          );
        })}
      </div>
    </div>
  );
}; 