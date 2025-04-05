import React from 'react';
import { MagnetPanel } from '../../components/magnet/MagnetPanel';
import { MagnetInfo } from '../../types/magnet';

interface PanelContainerProps {
  magnets: MagnetInfo[];
  savedStates: Map<string, boolean>;
  onClose: () => void;
  onToggleSave: (magnet: MagnetInfo, isSaved: boolean) => void;
}

export const PanelContainer: React.FC<PanelContainerProps> = ({
  magnets,
  savedStates,
  onClose,
  onToggleSave
}) => {
  return (
    <MagnetPanel
      magnets={magnets}
      savedStates={savedStates}
      onClose={onClose}
      onToggleSave={onToggleSave}
    />
  );
}; 