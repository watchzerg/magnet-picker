import React from 'react';
import { MagnetInfo } from '../../types/magnet';
import { formatFileSize, formatScore } from '../../utils/magnet';

interface MagnetItemProps {
  magnet: MagnetInfo;
  saved: boolean;
  score: number;
  matchedRuleNumbers: number[];
  matchedRuleDetails: Map<number, string>;
  onClick: () => void;
}

export const MagnetItem: React.FC<MagnetItemProps> = ({
  magnet,
  saved,
  score,
  matchedRuleNumbers,
  matchedRuleDetails,
  onClick
}) => {
  return (
    <div
      className={`magnet-item ${saved ? 'saved' : ''}`}
      onClick={onClick}
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
          <span className="magnet-item-score">评分: {formatScore(score)}</span>
          <span className="magnet-item-date">发布日期: {magnet.date}</span>
        </div>
        {matchedRuleNumbers.length > 0 && (
          <div className="magnet-item-rules">
            <span className="magnet-item-rules-label">匹配详情:</span>
            <div className="magnet-item-rules-numbers">
              {matchedRuleNumbers.map(number => (
                <div 
                  key={number} 
                  className="magnet-item-rule-number"
                  data-tooltip={matchedRuleDetails.get(number)}
                  dangerouslySetInnerHTML={{
                    __html: `<span>${number}</span><div class="tooltip-content">${matchedRuleDetails.get(number)}</div>`
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 