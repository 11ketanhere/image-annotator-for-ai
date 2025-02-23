import React, { useState, useEffect } from 'react';
import './styles.css';
import { CLASSIFICATIONS } from '../../constants';

const RightSidebar = ({
  annotations,
  selectedAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
  onCompleteAnnotation,
  onSelectAnnotation
}) => {
  const [formData, setFormData] = useState({
    label: '',
    classification: '',
    tags: ''
  });

  useEffect(() => {
    if (selectedAnnotation) {
      setFormData({
        label: selectedAnnotation.label || '',
        classification: selectedAnnotation.classification || '',
        tags: selectedAnnotation.tags?.join(', ') || ''
      });
    }
  }, [selectedAnnotation]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLabelSubmit = (e) => {
    e.preventDefault();
    if (!selectedAnnotation) return;

    const updatedData = {
      label: formData.label,
      classification: formData.classification,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    onUpdateAnnotation(selectedAnnotation.id, updatedData);
  };

  const handleRegionClick = (annotation) => {
    onSelectAnnotation(annotation);
  };

  return (
    <div className="right-sidebar">
      <div className="panel">
        <h3>Task Description</h3>
        <p>Annotate objects in the image</p>
      </div>

      {selectedAnnotation && (
        <div className="panel">
          <h3>Annotation Details</h3>
          <form onSubmit={handleLabelSubmit}>
            <div className="form-group">
              <label>Label:</label>
              <input
                name="label"
                type="text"
                value={formData.label}
                onChange={handleInputChange}
                placeholder="Enter label"
              />
            </div>
            
            <div className="form-group">
              <label>Classification:</label>
              <select
                name="classification"
                value={formData.classification}
                onChange={handleInputChange}
              >
                <option value="">Select classification</option>
                {CLASSIFICATIONS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Tags:</label>
              <input
                name="tags"
                type="text"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="Enter tags (comma separated)"
              />
            </div>

            <div className="form-actions">
              <button type="submit">Save Changes</button>
              <button 
                type="button" 
                onClick={() => onDeleteAnnotation(selectedAnnotation.id)}
                className="delete-button"
              >
                Delete
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="panel">
        <h3>Regions</h3>
        <div className="regions-list">
          {annotations.map((annotation, index) => (
            <div
              key={annotation.id}
              className={`region-item ${selectedAnnotation?.id === annotation.id ? 'selected' : ''}`}
              onClick={() => handleRegionClick(annotation)}
            >
              <span className="region-number">#{index + 1}</span>
              <span className="region-label">{annotation.label || 'Unlabeled'}</span>
              <span className="region-type">{annotation.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;