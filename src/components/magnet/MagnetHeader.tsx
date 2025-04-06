import React from 'react';

interface MagnetHeaderProps {
  count: number;
  onClose: () => void;
}

export const MagnetHeader: React.FC<MagnetHeaderProps> = ({ count, onClose }) => {
  return (
    <div className="magnet-panel-header">
      <h3 className="magnet-panel-title">
        当前页面磁链 ({count})
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
  );
}; 