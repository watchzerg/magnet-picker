import React from 'react';
import { MagnetInfo } from '../../../types/magnet';
import { MagnetItem } from '../MagnetItem';
import { MagnetScore } from '../../../utils/magnet/scoring';

interface MagnetListProps {
  magnets: MagnetInfo[];
  savedStates: Map<string, boolean>;
  magnetScores: MagnetScore[];
  matchedRules: Map<string, number[]>;
  matchedRuleDetails: Map<string, Map<number, string>>;
  onToggleSave: (magnet: MagnetInfo, isSaved: boolean) => void;
}

export const MagnetList: React.FC<MagnetListProps> = ({
  magnets,
  savedStates,
  magnetScores,
  matchedRules,
  matchedRuleDetails,
  onToggleSave
}) => {
  const isMagnetSaved = (magnet: MagnetInfo) => {
    return savedStates.get(magnet.magnet_hash) || false;
  };

  return (
    <div className="magnet-panel-content">
      {magnets.map((magnet) => {
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
            onClick={() => onToggleSave(magnet, saved)}
          />
        );
      })}
    </div>
  );
}; 