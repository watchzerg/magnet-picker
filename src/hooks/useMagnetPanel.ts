import { useState, useEffect } from 'react';
import { MagnetInfo } from '../types/magnet';
import { MagnetRule } from '../types/rule';
import { calculateMagnetScores, MagnetScore } from '../utils/magnet/scoring';
import { isRuleMatched, generateRuleDetail } from '../utils/magnet/rule-matcher';

export const useMagnetPanel = (magnets: MagnetInfo[]) => {
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
        const scoreA = scores.find((s: MagnetScore) => s.magnet.magnet_hash === a.magnet_hash)?.finalScore || 0;
        const scoreB = scores.find((s: MagnetScore) => s.magnet.magnet_hash === b.magnet_hash)?.finalScore || 0;
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
            ruleDetails.set(ruleNumber, generateRuleDetail(rule, magnet));
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

  return {
    magnetScores,
    sortedMagnets,
    matchedRules,
    matchedRuleDetails
  };
}; 