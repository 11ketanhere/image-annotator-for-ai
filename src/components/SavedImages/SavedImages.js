import React from 'react';
import './styles.css';

const SavedImages = ({ savedImages, onImageSelect, onImageDelete }) => {
  if (!savedImages || savedImages.length === 0) {
    return null;
  }

  const handleDelete = (e, image) => {
    e.stopPropagation(); // Prevent image selection when clicking delete
    onImageDelete(image.id);
  };

  return (
    <div className="saved-images-container">
      <h3>Saved Images</h3>
      <div className="saved-images-grid">
        {savedImages.map((image) => (
          <div key={image.id} className="saved-image-item" onClick={() => onImageSelect(image)}>
            <button 
              className="delete-image-btn"
              onClick={(e) => handleDelete(e, image)}
              title="Remove from saved images"
            >
              ×
            </button>
            <img src={image.src} alt={image.name} />
            <div className="saved-image-info">
              <span className="saved-image-name">{image.name}</span>
              <span className="saved-image-date">
                {new Date(image.timestamp).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedImages;
