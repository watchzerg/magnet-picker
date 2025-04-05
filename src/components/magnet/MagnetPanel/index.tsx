import React from 'react';
import { MagnetInfo } from '../../../types/magnet';
import { MagnetHeader } from '../MagnetHeader';
import { MagnetList } from './MagnetList';
import { useMagnetPanel } from '../../../hooks/useMagnetPanel';

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
  const {
    magnetScores,
    sortedMagnets,
    matchedRules,
    matchedRuleDetails
  } = useMagnetPanel(magnets);

  return (
    <div 
      className="magnet-panel"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <MagnetHeader count={magnets.length} onClose={onClose} />
      
      <MagnetList
        magnets={sortedMagnets}
        savedStates={savedStates}
        magnetScores={magnetScores}
        matchedRules={matchedRules}
        matchedRuleDetails={matchedRuleDetails}
        onToggleSave={onToggleSave}
      />
    </div>
  );
}; 