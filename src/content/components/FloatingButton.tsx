import React from 'react';

interface FloatingButtonProps {
  onClick: () => void;
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({ onClick }) => {
  return (
    <button
      className="magnet-picker-button"
      onClick={onClick}
    >
      解析磁力链接
    </button>
  );
}; 