import React from 'react';
import { FloatingButton } from './FloatingButton';

interface ButtonContainerProps {
  onShowPanel: () => void;
}

export const ButtonContainer: React.FC<ButtonContainerProps> = ({ onShowPanel }) => {
  return <FloatingButton onClick={onShowPanel} />;
}; 