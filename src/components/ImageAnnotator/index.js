import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Image, Line } from 'react-konva';

const ImageAnnotator = ({ imageUrl }) => {
  const [image, setImage] = useState(null);
  const [tool, setTool] = useState('box'); // 'box' or 'polygon'
  const [annotations, setAnnotations] = useState([]);
  const [currentAnnotation, setCurrentAnnotation] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const stageRef = useRef(null);

  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      setImage(img);
      setImageLoading(false);
      setImageError(false);
    };

    img.onerror = () => {
      setImageError(true);
      setImageLoading(false);
    };

    img.src = imageUrl;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl]);

  const handleMouseDown = (e) => {
    if (!tool) return;

    const pos = e.target.getStage().getPointerPosition();
    const newAnnotation = {
      type: tool,
      points: [pos.x, pos.y],
      id: Date.now().toString(),
    };

    setDrawing(true);
    setCurrentAnnotation(newAnnotation);
  };

  const handleMouseMove = (e) => {
    if (!drawing || !currentAnnotation) return;

    const pos = e.target.getStage().getPointerPosition();
    const newAnnotation = { ...currentAnnotation };

    if (tool === 'box') {
      newAnnotation.points = [
        currentAnnotation.points[0],
        currentAnnotation.points[1],
        pos.x,
        pos.y,
      ];
    } else if (tool === 'polygon') {
      newAnnotation.points = [
        ...currentAnnotation.points,
        pos.x,
        pos.y,
      ];
    }

    setCurrentAnnotation(newAnnotation);
  };

  const handleMouseUp = () => {
    if (!drawing || !currentAnnotation) return;

    setDrawing(false);
    setAnnotations([...annotations, currentAnnotation]);
    setCurrentAnnotation(null);
  };

  const renderAnnotation = (annotation) => {
    const props = {
      key: annotation.id,
      points: annotation.points,
      stroke: '#00ff00',
      strokeWidth: 2,
      lineJoin: 'round',
      closed: annotation.type === 'box',
    };

    return <Line {...props} />;
  };

  if (imageError) return <div className="error-message">Failed to load image. Please try again.</div>;
  if (imageLoading) return <div className="loading-message">Loading image...</div>;

  return (
    <div className="canvas-container">
      <div className="toolbar">
        <button
          className={tool === 'box' ? 'active' : ''}
          onClick={() => setTool('box')}
        >
          □
        </button>
        <button
          className={tool === 'polygon' ? 'active' : ''}
          onClick={() => setTool('polygon')}
        >
          △
        </button>
      </div>
      <Stage
        width={800}
        height={600}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        ref={stageRef}
      >
        <Layer>
          <Image
            image={image}
            width={800}
            height={600}
          />
          {annotations.map(renderAnnotation)}
          {currentAnnotation && renderAnnotation(currentAnnotation)}
        </Layer>
      </Stage>
    </div>
  );
};

export default ImageAnnotator;
