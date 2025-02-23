import React from 'react';
import './styles.css';

const LeftSidebar = ({
  tool,
  onToolChange,
  onSave,
  onDownload,
  onUndo,
  onRedo,
  onToggleGallery,
  canUndo,
  canRedo,
  showGallery
}) => {
  return (
    <div className="left-sidebar">
      <div className="tool-section">
        <h3>Drawing Tools</h3>
        <div className="tool-button">
          <button
            onClick={() => onToolChange('box')}
            className={tool === 'box' ? 'active' : ''}
            title="Bounding Box"
          >
            <span className="tool-icon">□</span>
            Box
          </button>
        </div>
        <div className="tool-button">
          <button
            onClick={() => onToolChange('polygon')}
            className={tool === 'polygon' ? 'active' : ''}
            title="Polygon"
          >
            <span className="tool-icon">△</span>
            Polygon
          </button>
        </div>
        <div className="tool-button">
          <button
            onClick={() => onToolChange('keypoint')}
            className={tool === 'keypoint' ? 'active' : ''}
            title="Keypoint"
          >
            <span className="tool-icon">●</span>
            Keypoint
          </button>
        </div>
      </div>

      <div className="tool-section">
        <h3>Actions</h3>
        <div className="tool-button">
          <button
            onClick={onToggleGallery}
            className={showGallery ? 'active' : ''}
            title={showGallery ? 'Back to Editor' : 'View Gallery'}
          >
            {showGallery ? '← Back' : 'Gallery'}
          </button>
        </div>
        <div className="tool-button">
          <button onClick={onSave} title="Save to Gallery">
            Save
          </button>
        </div>
        <div className="tool-button">
          <button onClick={onDownload} title="Download Annotated Image">
            Download
          </button>
        </div>
      </div>

      <div className="tool-section">
        <h3>History</h3>
        <div className="history-controls">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="history-button"
            title="Undo"
          >
            ↩ Undo
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="history-button"
            title="Redo"
          >
            ↪ Redo
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;