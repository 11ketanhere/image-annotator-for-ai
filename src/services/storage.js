// Storage service for managing images and annotations
const PROJECTS_KEY = 'annotation_projects';
const IMAGES_KEY = 'annotated_images';

// Project management
export const createProject = (name, description = '') => {
  try {
    const projects = getAllProjects();
    const newProject = {
      id: Date.now(),
      name,
      description,
      createdAt: new Date().toISOString(),
      imageIds: []
    };
    projects.push(newProject);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    return newProject.id;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

export const getAllProjects = () => {
  try {
    const data = localStorage.getItem(PROJECTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting projects:', error);
    return [];
  }
};

export const getProjectById = (id) => {
  try {
    const projects = getAllProjects();
    return projects.find(p => p.id === id) || null;
  } catch (error) {
    console.error('Error getting project:', error);
    return null;
  }
};

export const updateProject = (id, updates) => {
  try {
    const projects = getAllProjects();
    const updatedProjects = projects.map(p =>
      p.id === id ? { ...p, ...updates } : p
    );
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

export const deleteProject = (id) => {
  try {
    const projects = getAllProjects();
    const project = projects.find(p => p.id === id);
    if (project) {
      // Delete all images in the project
      project.imageIds.forEach(imageId => deleteImage(imageId));
    }
    const filteredProjects = projects.filter(p => p.id !== id);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(filteredProjects));
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

export const saveImageData = (imageData, projectId) => {
  try {
    const existingData = localStorage.getItem(IMAGES_KEY);
    const images = existingData ? JSON.parse(existingData) : [];
    
    // Add new image data
    const newImage = {
      id: Date.now(),
      name: imageData.name || `Image ${images.length + 1}`,
      src: imageData.src,
      annotations: imageData.annotations,
      timestamp: new Date().toISOString(),
      width: imageData.width,
      height: imageData.height,
      projectId
    };
    
    images.push(newImage);
    localStorage.setItem(IMAGES_KEY, JSON.stringify(images));

    // Add image to project
    if (projectId) {
      const projects = getAllProjects();
      const updatedProjects = projects.map(p =>
        p.id === projectId
          ? { ...p, imageIds: [...p.imageIds, newImage.id] }
          : p
      );
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));
    }

    return newImage.id;
  } catch (error) {
    console.error('Error saving image data:', error);
    throw error;
  }
};

export const getAllImages = (projectId = null) => {
  try {
    const data = localStorage.getItem(IMAGES_KEY);
    const images = data ? JSON.parse(data) : [];
    return projectId
      ? images.filter(img => img.projectId === projectId)
      : images;
  } catch (error) {
    console.error('Error getting images:', error);
    return [];
  }
};

export const getImageById = (id) => {
  try {
    const images = getAllImages();
    return images.find(img => img.id === id) || null;
  } catch (error) {
    console.error('Error getting image:', error);
    return null;
  }
};

export const getProjectImages = (projectId) => {
  try {
    const project = getProjectById(projectId);
    if (!project) return [];
    
    const images = getAllImages();
    return project.imageIds
      .map(id => images.find(img => img.id === id))
      .filter(Boolean); // Remove any null values
  } catch (error) {
    console.error('Error getting project images:', error);
    return [];
  }
};

export const updateImageAnnotations = (id, annotations) => {
  try {
    const images = getAllImages();
    const updatedImages = images.map(img =>
      img.id === id ? { ...img, annotations } : img
    );
    localStorage.setItem(IMAGES_KEY, JSON.stringify(updatedImages));
  } catch (error) {
    console.error('Error updating annotations:', error);
    throw error;
  }
};

export const deleteImage = (id) => {
  try {
    // Remove from images list
    const images = getAllImages();
    const image = images.find(img => img.id === id);
    const filteredImages = images.filter(img => img.id !== id);
    localStorage.setItem(IMAGES_KEY, JSON.stringify(filteredImages));

    // Remove from project if it belongs to one
    if (image?.projectId) {
      const projects = getAllProjects();
      const updatedProjects = projects.map(p =>
        p.id === image.projectId
          ? { ...p, imageIds: p.imageIds.filter(imgId => imgId !== id) }
          : p
      );
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};