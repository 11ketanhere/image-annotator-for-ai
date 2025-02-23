import React, { useRef, useEffect } from 'react';
import { getMousePosition } from '../../utils/annotationUtils';
import './styles.css';

const Canvas = ({
  image,
  annotations,
  currentAnnotation,
  tool,
  onAnnotationStart,
  onAnnotationUpdate,
  onAnnotationComplete,
  onAnnotationSelect,
  showAnnotations, 
}) => {
  const svgRef = useRef(null);

  const handleMouseDown = (e) => {
    const point = getMousePosition(e, svgRef.current);
    onAnnotationStart(point);
  };

  const handleMouseMove = (e) => {
    if (!currentAnnotation) return;
    const point = getMousePosition(e, svgRef.current);
    onAnnotationUpdate(point);
  };

  const handleMouseUp = () => {
    if (tool !== 'polygon') {
      onAnnotationComplete();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && currentAnnotation?.type === 'polygon') {
      onAnnotationComplete();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentAnnotation]);

  const handleCompletePolygon = () => {
    if (currentAnnotation?.type === 'polygon' && currentAnnotation.points.length >= 3) {
      onAnnotationComplete();
    }
  };

  return (
    <div className="canvas-wrapper">
      <div className="canvas-content">
        <svg
          ref={svgRef}
          className="annotation-canvas"
          width={image?.width || 800}
          height={image?.height || 600}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain'
          }}
          viewBox={`0 0 ${image?.width || 800} ${image?.height || 600}`}
          preserveAspectRatio="xMidYMid meet"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {image && (
            <image 
              href={image.src} 
              x="0"
              y="0"
              width={image.width} 
              height={image.height}
              preserveAspectRatio="xMidYMid meet"
            />
          )}
        
          {/* Render existing annotations */}
          {showAnnotations &&  annotations.map((annotation, index) => (
            <g 
              key={annotation.id}
              onClick={() => onAnnotationSelect(annotation)}
              style={{ cursor: 'pointer' }}
            >
              {annotation.type === 'box' && (
                <rect
                  x={annotation.x}
                  y={annotation.y}
                  width={annotation.width}
                  height={annotation.height}
                  stroke={annotation.color}
                  strokeWidth="2"
                  fill="none"
                />
              )}
              {annotation.type === 'polygon' && (
                <>
                  <polygon
                    points={annotation.points.map(p => `${p.x},${p.y}`).join(' ')}
                    stroke={annotation.color}
                    strokeWidth="2"
                    fill="none"
                  />
                  {annotation.points.map((point, i) => (
                    <circle
                      key={i}
                      cx={point.x}
                      cy={point.y}
                      r="4"
                      fill={annotation.color}
                    />
                  ))}
                </>
              )}
              {annotation.type === 'keypoint' && (
                <circle
                  cx={annotation.x}
                  cy={annotation.y}
                  r="5"
                  fill={annotation.color}
                />
              )}
              {(annotation.label || annotation.classification) && (
                <text
                  x={annotation.x}
                  y={annotation.y - 5}
                  fill={annotation.color}
                  fontSize="12"
                  style={{ pointerEvents: 'none' }}
                >
                  {annotation.label || annotation.classification}
                </text>
              )}
            </g>
          ))}

          {/* Render current annotation being drawn */}
          {currentAnnotation && (
            <g>
              {currentAnnotation.type === 'box' && (
                <rect
                  x={currentAnnotation.x}
                  y={currentAnnotation.y}
                  width={currentAnnotation.width}
                  height={currentAnnotation.height}
                  stroke={currentAnnotation.color}
                  strokeWidth="2"
                  fill="none"
                />
              )}
              {currentAnnotation.type === 'polygon' && (
                <>
                  <polyline
                    points={currentAnnotation.points.map(p => `${p.x},${p.y}`).join(' ')}
                    stroke={currentAnnotation.color}
                    strokeWidth="2"
                    fill="none"
                  />
                  {currentAnnotation.points.map((point, i) => (
                    <circle
                      key={i}
                      cx={point.x}
                      cy={point.y}
                      r="4"
                      fill={currentAnnotation.color}
                    />
                  ))}
                </>
              )}
            </g>
          )}
        </svg>

        {/* Polygon controls */}
        {currentAnnotation?.type === 'polygon' && (
          <div className="polygon-controls">
            <div className="polygon-instructions">
              Click to add points. Press ESC or click "Complete" when done.
              {currentAnnotation.points.length < 3 && (
                <span className="polygon-warning">
                  Add at least 3 points to complete the polygon.
                </span>
              )}
            </div>
            {currentAnnotation.points.length >= 3 && (
              <button
                className="complete-polygon-btn"
                onClick={handleCompletePolygon}
              >
                Complete Polygon
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Canvas;