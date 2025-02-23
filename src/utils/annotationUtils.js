export const getMousePosition = (event, svg) => {
  const CTM = svg.getScreenCTM();
  return {
    x: (event.clientX - CTM.e) / CTM.a,
    y: (event.clientY - CTM.f) / CTM.d
  };
};

export const createBox = (startPoint, endPoint) => ({
  type: 'box',
  x: Math.min(startPoint.x, endPoint.x),
  y: Math.min(startPoint.y, endPoint.y),
  width: Math.abs(endPoint.x - startPoint.x),
  height: Math.abs(endPoint.y - startPoint.y)
});

export const createPolygon = (points) => ({
  type: 'polygon',
  points: [...points]
});

export const createKeypoint = (point) => ({
  type: 'keypoint',
  x: point.x,
  y: point.y
});