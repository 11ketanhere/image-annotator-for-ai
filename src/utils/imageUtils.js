export const loadImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          src: e.target.result,
          width: img.width,
          height: img.height
        });
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const saveAnnotatedImage = async (image, annotations) => {
  // Create a canvas to draw the image and annotations
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Set canvas size to match image
  canvas.width = image.width;
  canvas.height = image.height;
  
  // Draw the original image
  const img = new Image();
  img.src = image.src;
  await new Promise(resolve => {
    img.onload = resolve;
  });
  ctx.drawImage(img, 0, 0);
  
  // Draw annotations
  annotations.forEach(annotation => {
    ctx.strokeStyle = annotation.color;
    ctx.lineWidth = 2;
    
    if (annotation.type === 'box') {
      ctx.strokeRect(annotation.x, annotation.y, annotation.width, annotation.height);
    } else if (annotation.type === 'polygon') {
      ctx.beginPath();
      annotation.points.forEach((point, i) => {
        if (i === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.closePath();
      ctx.stroke();
    }
  });
  
  // Convert to blob and return
  return new Promise(resolve => {
    canvas.toBlob(resolve, 'image/png');
  });
};