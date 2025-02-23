import React from 'react';
import './styles.css';

const Toolbar = ({ tool, onToolChange }) => {
  return (
    <div className="toolbar">
      <button
        className={`tool-button ${tool === 'box' ? 'active' : ''}`}
        onClick={() => onToolChange('box')}
        title="Box Tool"
      >
        □
      </button>
      <button
        className={`tool-button ${tool === 'polygon' ? 'active' : ''}`}
        onClick={() => onToolChange('polygon')}
        title="Polygon Tool"
      >
        △
      </button>
      <button
        className={`tool-button ${tool === 'keypoint' ? 'active' : ''}`}
        onClick={() => onToolChange('keypoint')}
        title="Keypoint Tool"
      >
        ●
      </button>
    </div>
  );
};

export default Toolbar;