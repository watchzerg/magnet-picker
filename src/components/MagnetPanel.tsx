import React, { useEffect, useState } from 'react';
import { MagnetInfo } from '../types/magnet';
import { formatFileSize, calculateMagnetScores } from '../utils/magnet';

interface MagnetScore {
  magnet: MagnetInfo;
  defaultScore: number;
  finalScore: number;
}

interface MagnetPanelProps {
  magnets: MagnetInfo[];
  savedStates: Map<string, boolean>;
  onClose: () => void;
  onToggleSave: (magnet: MagnetInfo, isSaved: boolean) => void;
}

export const MagnetPanel: React.FC<MagnetPanelProps> = ({ 
  magnets, 
  savedStates, 
  onClose,
  onToggleSave 
}) => {
  console.log('MagnetPanel: 渲染面板，磁力链接数量:', magnets.length);
  
  const [magnetScores, setMagnetScores] = useState<MagnetScore[]>([]);

  useEffect(() => {
    const loadScores = async () => {
      const scores = await calculateMagnetScores(magnets);
      setMagnetScores(scores);
    };
    loadScores();
  }, [magnets]);
  
  // 判断磁力链接是否已保存
  const isMagnetSaved = (magnet: MagnetInfo) => {
    return savedStates.get(magnet.hash) || false;
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
          const score = magnetScores.find((s: MagnetScore) => s.magnet.hash === magnet.hash);
          return (
            <div
              key={magnet.hash}
              className={`magnet-item ${isSaved ? 'magnet-item-saved' : 'magnet-item-unsaved'}`}
              onClick={() => handleMagnetClick(magnet, isSaved)}
            >
              <div className="magnet-item-title">
                {magnet.fileName}
                <span className={`magnet-item-badge ${isSaved ? '' : 'magnet-item-badge-unsaved'}`}>
                  {isSaved ? '已保存' : '未保存'}
                </span>
              </div>
              <div className="magnet-item-info">
                <div className="magnet-item-metrics">
                  <span className="magnet-item-size">大小: {formatFileSize(magnet.fileSize)}</span>
                  <span className="magnet-item-score">评分: {formatFileSize(score?.finalScore || 0)}</span>
                </div>
                <span>{magnet.date}</span>
                <a
                  href={magnet.url}
                  className={`magnet-item-download ${isSaved ? 'magnet-item-download-saved' : ''}`}
                  onClick={(e) => e.stopPropagation()}
                  target="_blank"
                  rel="noopener noreferrer"
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