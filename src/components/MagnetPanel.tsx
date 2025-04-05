import React, { useEffect, useState } from 'react';
import { MagnetInfo } from '../types/magnet';
import { formatFileSize, calculateMagnetScores, formatScore } from '../utils/magnet';
import { 
  MagnetRule, 
  RuleType,
  FileSizeRuleConfig,
  FilenameContainsRuleConfig,
  FilenameSuffixRuleConfig,
  FileExtensionRuleConfig,
  FilenameRegexRuleConfig,
  ShareDateRuleConfig
} from '../types/rule';

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
  const [sortedMagnets, setSortedMagnets] = useState<MagnetInfo[]>([]);
  const [matchedRules, setMatchedRules] = useState<Map<string, number[]>>(new Map());
  const [matchedRuleDetails, setMatchedRuleDetails] = useState<Map<string, Map<number, string>>>(new Map());

  useEffect(() => {
    const loadScores = async () => {
      const scores = await calculateMagnetScores(magnets);
      setMagnetScores(scores);
      
      // 根据分数排序磁力链接
      const sorted = [...magnets].sort((a, b) => {
        const scoreA = scores.find(s => s.magnet.magnet_hash === a.magnet_hash)?.finalScore || 0;
        const scoreB = scores.find(s => s.magnet.magnet_hash === b.magnet_hash)?.finalScore || 0;
        return scoreB - scoreA;
      });
      setSortedMagnets(sorted);

      // 获取匹配的规则序号和详情
      const result = await chrome.storage.local.get(['magnetRules']);
      const rules: MagnetRule[] = result.magnetRules || [];
      const enabledRules = rules.filter(rule => rule.enabled);
      
      const newMatchedRules = new Map<string, number[]>();
      const newMatchedDetails = new Map<string, Map<number, string>>();

      magnets.forEach(magnet => {
        const matchedRuleNumbers: number[] = [];
        const ruleDetails = new Map<number, string>();

        enabledRules.forEach((rule, index) => {
          if (isRuleMatched(rule, magnet)) {
            const ruleNumber = index + 1;
            matchedRuleNumbers.push(ruleNumber);
            
            // 生成规则匹配细节
            switch (rule.type) {
              case RuleType.FILE_SIZE: {
                const config = rule.config as FileSizeRuleConfig;
                const condition = config.condition === 'greater' ? '大于' : '小于';
                const scoreChange = Number(((config.scoreMultiplier - 1) * 100).toFixed(0));
                const scoreText = `<span class="score-${scoreChange > 0 ? 'positive' : scoreChange < 0 ? 'negative' : 'neutral'}">${scoreChange > 0 ? '+' : ''}${scoreChange}%</span>`;
                const detail = `文件体积${condition} <span class="match-value">${formatFileSize(config.threshold)}</span>
评分修正：${scoreText}${config.stopOnMatch ? '\n⚡ 匹配后中止后续规则' : ''}`;
                ruleDetails.set(ruleNumber, detail);
                break;
              }
              case RuleType.FILENAME_CONTAINS: {
                const config = rule.config as FilenameContainsRuleConfig;
                const matchedKeyword = config.keywords.find(keyword => 
                  magnet.fileName.toLowerCase().includes(keyword.toLowerCase())
                );
                if (matchedKeyword) {
                  const scoreChange = Number(((config.scoreMultiplier - 1) * 100).toFixed(0));
                  const scoreText = `<span class="score-${scoreChange > 0 ? 'positive' : scoreChange < 0 ? 'negative' : 'neutral'}">${scoreChange > 0 ? '+' : ''}${scoreChange}%</span>`;
                  const detail = `文件名包含关键字：<span class="match-value">${matchedKeyword}</span>
评分修正：${scoreText}${config.stopOnMatch ? '\n⚡ 匹配后中止后续规则' : ''}`;
                  ruleDetails.set(ruleNumber, detail);
                }
                break;
              }
              case RuleType.FILENAME_SUFFIX: {
                const config = rule.config as FilenameSuffixRuleConfig;
                const matchedSuffix = config.suffixes.find(suffix => 
                  magnet.fileName.toLowerCase().endsWith(suffix.toLowerCase())
                );
                if (matchedSuffix) {
                  const scoreChange = Number(((config.scoreMultiplier - 1) * 100).toFixed(0));
                  const scoreText = `<span class="score-${scoreChange > 0 ? 'positive' : scoreChange < 0 ? 'negative' : 'neutral'}">${scoreChange > 0 ? '+' : ''}${scoreChange}%</span>`;
                  const detail = `文件名以后缀结尾：<span class="match-value">${matchedSuffix}</span>
评分修正：${scoreText}${config.stopOnMatch ? '\n⚡ 匹配后中止后续规则' : ''}`;
                  ruleDetails.set(ruleNumber, detail);
                }
                break;
              }
              case RuleType.FILE_EXTENSION: {
                const config = rule.config as FileExtensionRuleConfig;
                const fileExt = magnet.fileName.split('.').pop()?.toLowerCase() || '';
                const matchedExtension = config.extensions.find(ext => 
                  ext.toLowerCase() === fileExt
                );
                if (matchedExtension) {
                  const scoreChange = Number(((config.scoreMultiplier - 1) * 100).toFixed(0));
                  const scoreText = `<span class="score-${scoreChange > 0 ? 'positive' : scoreChange < 0 ? 'negative' : 'neutral'}">${scoreChange > 0 ? '+' : ''}${scoreChange}%</span>`;
                  const detail = `文件扩展名：<span class="match-value">${matchedExtension}</span>
评分修正：${scoreText}${config.stopOnMatch ? '\n⚡ 匹配后中止后续规则' : ''}`;
                  ruleDetails.set(ruleNumber, detail);
                }
                break;
              }
              case RuleType.FILENAME_REGEX: {
                const config = rule.config as FilenameRegexRuleConfig;
                try {
                  const regex = new RegExp(config.pattern);
                  if (regex.test(magnet.fileName)) {
                    const scoreChange = Number(((config.scoreMultiplier - 1) * 100).toFixed(0));
                    const scoreText = `<span class="score-${scoreChange > 0 ? 'positive' : scoreChange < 0 ? 'negative' : 'neutral'}">${scoreChange > 0 ? '+' : ''}${scoreChange}%</span>`;
                    const detail = `文件名匹配正则：<span class="match-value">${config.pattern}</span>
评分修正：${scoreText}${config.stopOnMatch ? '\n⚡ 匹配后中止后续规则' : ''}`;
                    ruleDetails.set(ruleNumber, detail);
                  }
                } catch {
                  // 忽略无效的正则表达式
                }
                break;
              }
              case RuleType.SHARE_DATE: {
                const config = rule.config as ShareDateRuleConfig;
                const condition = config.condition === 'after' ? '晚于' : 
                                config.condition === 'before' ? '早于' : '等于';
                const scoreChange = Number(((config.scoreMultiplier - 1) * 100).toFixed(0));
                const scoreText = `<span class="score-${scoreChange > 0 ? 'positive' : scoreChange < 0 ? 'negative' : 'neutral'}">${scoreChange > 0 ? '+' : ''}${scoreChange}%</span>`;
                const detail = `分享日期${condition} <span class="match-value">${config.date}</span>
评分修正：${scoreText}${config.stopOnMatch ? '\n⚡ 匹配后中止后续规则' : ''}`;
                ruleDetails.set(ruleNumber, detail);
                break;
              }
            }
          }
        });

        newMatchedRules.set(magnet.magnet_hash, matchedRuleNumbers);
        newMatchedDetails.set(magnet.magnet_hash, ruleDetails);
      });

      setMatchedRules(newMatchedRules);
      setMatchedRuleDetails(newMatchedDetails);
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
        {sortedMagnets.map((magnet) => {
          const saved = isMagnetSaved(magnet);
          const score = magnetScores.find(s => s.magnet.magnet_hash === magnet.magnet_hash)?.finalScore || 0;
          const matchedRuleNumbers = matchedRules.get(magnet.magnet_hash) || [];
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
                  <span className="magnet-item-score">评分: {formatScore(score)}</span>
                  <span className="magnet-item-date">发布日期: {magnet.date}</span>
                </div>
                {matchedRuleNumbers.length > 0 && (
                  <div className="magnet-item-rules">
                    <span className="magnet-item-rules-label">匹配规则:</span>
                    <div className="magnet-item-rules-numbers">
                      {matchedRuleNumbers.map(number => (
                        <div 
                          key={number} 
                          className="magnet-item-rule-number"
                          data-tooltip={matchedRuleDetails.get(magnet.magnet_hash)?.get(number)}
                          dangerouslySetInnerHTML={{
                            __html: `<span>${number}</span><div class="tooltip-content">${matchedRuleDetails.get(magnet.magnet_hash)?.get(number)}</div>`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 判断规则是否匹配
const isRuleMatched = (rule: MagnetRule, magnet: MagnetInfo): boolean => {
  const { type, config } = rule;
  
  switch (type) {
    case RuleType.FILE_SIZE: {
      const fileSizeConfig = config as FileSizeRuleConfig;
      return fileSizeConfig.condition === 'greater' 
        ? magnet.fileSize > fileSizeConfig.threshold
        : magnet.fileSize < fileSizeConfig.threshold;
    }
    case RuleType.FILENAME_CONTAINS: {
      const containsConfig = config as FilenameContainsRuleConfig;
      return containsConfig.keywords.some(keyword => 
        magnet.fileName.toLowerCase().includes(keyword.toLowerCase())
      );
    }
    case RuleType.FILENAME_SUFFIX: {
      const suffixConfig = config as FilenameSuffixRuleConfig;
      return suffixConfig.suffixes.some(suffix => 
        magnet.fileName.toLowerCase().endsWith(suffix.toLowerCase())
      );
    }
    case RuleType.FILE_EXTENSION: {
      const extensionConfig = config as FileExtensionRuleConfig;
      const fileExt = magnet.fileName.split('.').pop()?.toLowerCase() || '';
      return extensionConfig.extensions.some(ext => 
        ext.toLowerCase() === fileExt
      );
    }
    case RuleType.FILENAME_REGEX: {
      const regexConfig = config as FilenameRegexRuleConfig;
      try {
        const regex = new RegExp(regexConfig.pattern);
        return regex.test(magnet.fileName);
      } catch {
        return false;
      }
    }
    case RuleType.SHARE_DATE: {
      const dateConfig = config as ShareDateRuleConfig;
      const magnetDate = new Date(magnet.date);
      const ruleDate = new Date(dateConfig.date);
      
      switch (dateConfig.condition) {
        case 'before':
          return magnetDate < ruleDate;
        case 'after':
          return magnetDate > ruleDate;
        case 'equal':
          return magnetDate.toDateString() === ruleDate.toDateString();
        default:
          return false;
      }
    }
    default:
      return false;
  }
}; 