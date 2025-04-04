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
    return savedStates.get(magnet.magnet_hash) || false;
  };

  const handleMagnetClick = (magnet: MagnetInfo, isSaved: boolean) => {
    onToggleSave(magnet, isSaved);
  };

  return (
    <div 
      className="magnet-panel"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div className="magnet-panel-header">
        <h3 className="magnet-panel-title">
          磁力链接 ({magnets.length})
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
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
          const saved = isMagnetSaved(magnet);
          const score = magnetScores.find(s => s.magnet.magnet_hash === magnet.magnet_hash)?.finalScore || 0;
          return (
            <div
              key={magnet.magnet_hash}
              className={`magnet-item ${saved ? 'saved' : ''}`}
              onClick={() => handleMagnetClick(magnet, saved)}
            >
              <div className="magnet-item-title">
                <a
                  href={magnet.magnet_link}
                  className={`magnet-item-download ${saved ? 'magnet-item-download-saved' : ''}`}
                  onClick={(e) => e.stopPropagation()}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {magnet.fileName}
                </a>
                <span className={`magnet-item-badge ${saved ? '' : 'magnet-item-badge-unsaved'}`}>
                  {saved ? '已保存' : '未保存'}
                </span>
              </div>
              <div className="magnet-item-info">
                <div className="magnet-item-metrics">
                  <span className="magnet-item-size">大小: {formatFileSize(magnet.fileSize)}</span>
                  <span className="magnet-item-score">评分: {formatFileSize(score)}</span>
                </div>
                <span>{magnet.date}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 