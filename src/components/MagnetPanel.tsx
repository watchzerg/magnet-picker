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
import { MagnetScore, MagnetPanelProps } from '../types/magnet/magnet';
import { MagnetHeader } from './magnet/MagnetHeader';
import { MagnetItem } from './magnet/MagnetItem';
import { isRuleMatched } from '../utils/magnet/rule-matcher';

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
      <MagnetHeader count={magnets.length} onClose={onClose} />
      
      <div className="magnet-panel-content">
        {sortedMagnets.map((magnet) => {
          const saved = isMagnetSaved(magnet);
          const score = magnetScores.find(s => s.magnet.magnet_hash === magnet.magnet_hash)?.finalScore || 0;
          const matchedRuleNumbers = matchedRules.get(magnet.magnet_hash) || [];
          const matchedDetails = matchedRuleDetails.get(magnet.magnet_hash) || new Map();
          
          return (
            <MagnetItem
              key={magnet.magnet_hash}
              magnet={magnet}
              saved={saved}
              score={score}
              matchedRuleNumbers={matchedRuleNumbers}
              matchedRuleDetails={matchedDetails}
              onClick={() => handleMagnetClick(magnet, saved)}
            />
          );
        })}
      </div>
    </div>
  );
}; 