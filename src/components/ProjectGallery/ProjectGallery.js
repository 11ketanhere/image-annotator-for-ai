import React, { useState, useEffect } from 'react';
import './styles.css';
import {
  getAllProjects,
  getProjectImages,
  createProject,
  deleteProject,
  deleteImage
} from '../../services/storage';
import logo from '../../components/assets/images/brand-logo.png';
const ProjectGallery = ({ onImageSelect, onClose, selectedProject, onProjectSelect, onStartAnnotating }) => {
  const [projects, setProjects] = useState([]);
  const [projectImages, setProjectImages] = useState([]);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const allProjects = getAllProjects();
    setProjects(allProjects);
  };

  const handleProjectSelect = (project) => {
    onProjectSelect(project);
    const images = getProjectImages(project.id);
    setProjectImages(images);
  };

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    createProject(newProjectName);
    setNewProjectName('');
    setShowNewProjectForm(false);
    loadProjects();
  };

  const handleDeleteProject = (projectId) => {
    if (window.confirm('Are you sure you want to delete this project and all its images?')) {
      deleteProject(projectId);
      loadProjects();
      if (selectedProject?.id === projectId) {
        onProjectSelect(null);
        setProjectImages([]);
      }
    }
  };

  const handleDeleteImage = (imageId) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      deleteImage(imageId);
      if (selectedProject) {
        const updatedImages = getProjectImages(selectedProject.id);
        setProjectImages(updatedImages);
      }
    }
  };

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <img src={logo} alt="Brand Logo"className="brand-logo"/>
        <h2>Project Gallery</h2>
        {selectedProject && (
          <button 
            onClick={onStartAnnotating} 
            className="start-annotating-btn"
          >
            Start Annotating
          </button>
        )}
      </div>

      <div className="gallery-content">
        <div className="projects-panel">
          <div className="projects-header">
            <h3>Projects</h3>
            <button 
              onClick={() => setShowNewProjectForm(true)}
              className="new-project-btn"
            >
              + New Project
            </button>
          </div>

          {showNewProjectForm && (
            <form onSubmit={handleCreateProject} className="new-project-form">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Project name"
                autoFocus
              />
              <div className="form-actions">
                <button type="submit">Create</button>
                <button 
                  type="button" 
                  onClick={() => setShowNewProjectForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="projects-list">
            {projects.map(project => (
              <div 
                key={project.id} 
                className={`project-item ${selectedProject?.id === project.id ? 'selected' : ''}`}
                onClick={() => handleProjectSelect(project)}
              >
                <span className="project-name">{project.name}</span>
                <span className="project-image-count">
                  {project.imageIds.length} images
                </span>
                <button
                  className="delete-project-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProject(project.id);
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="images-panel">
          {selectedProject ? (
            <>
              <h3>{selectedProject.name}</h3>
              <div className="images-grid">
                {projectImages.map(image => (
                  <div key={image.id} className="image-item">
                    <img 
                      src={image.src} 
                      alt={image.name}
                      onClick={() => onImageSelect(image)}
                    />
                    <div className="image-info">
                      <span className="image-name">{image.name}</span>
                      <span className="image-date">
                        {new Date(image.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      className="delete-image-btn"
                      onClick={() => handleDeleteImage(image.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="no-project-selected">
              <p>Select a project to view its images</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectGallery;
