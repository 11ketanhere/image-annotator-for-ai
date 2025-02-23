import React from 'react';
import { getAllImages, deleteImage } from '../../services/storage';
import './Gallery.css';

const Gallery = ({ onImageSelect }) => {
  const [images, setImages] = React.useState([]);

  React.useEffect(() => {
    loadImages();
  }, []);

  const loadImages = () => {
    const savedImages = getAllImages();
    setImages(savedImages);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    deleteImage(id);
    loadImages();
  };

  return (
    <div className="gallery">
      <h2>Saved Images</h2>
      <div className="gallery-grid">
        {images.map((image) => (
          <div
            key={image.id}
            className="gallery-item"
            onClick={() => onImageSelect(image)}
          >
            <img src={image.src} alt={image.name} />
            <div className="gallery-item-overlay">
              <span>{image.name}</span>
              <button onClick={(e) => handleDelete(image.id, e)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;