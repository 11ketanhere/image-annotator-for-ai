import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import LeftSidebar from "./components/Sidebar/LeftSidebar";
import RightSidebar from "./components/Sidebar/RightSidebar";
import Canvas from "./components/ImageAnnotator/Canvas";
import SavedImages from "./components/SavedImages/SavedImages";
import ProjectGallery from "./components/ProjectGallery/ProjectGallery";
import { COLORS } from "./constants";
import { loadImage, saveAnnotatedImage } from "./utils/imageUtils";
import {
  saveImageData,
  updateImageAnnotations,
  getAllImages,
  deleteImage,
  getAllProjects,
} from "./services/storage";
import Header from "./components/Common/Header";

function App() {
  const [image, setImage] = useState(null);
  const [tool, setTool] = useState("box");
  const [annotations, setAnnotations] = useState([]);
  const [currentAnnotation, setCurrentAnnotation] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentImageId, setCurrentImageId] = useState(null);
  const [savedImages, setSavedImages] = useState([]);
  const [showGallery, setShowGallery] = useState(true); // Start with gallery open
  const [currentProject, setCurrentProject] = useState(null);
  const [showAnnotator, setShowAnnotator] = useState(false); // Control annotator visibility
  const [projects, setProjects] = useState([]); // Add projects state

  useEffect(() => {
    // Load saved images and projects on component mount
    loadSavedImages();
    loadProjects();
  }, []);

  const loadSavedImages = () => {
    if (currentProject) {
      setSavedImages(getAllImages(currentProject.id));
    } else {
      setSavedImages([]);
    }
  };

  const loadProjects = () => {
    const allProjects = getAllProjects();
    setProjects(allProjects);
  };

  const handleDeleteImage = (imageId) => {
    if (window.confirm("Are you sure you want to delete this image?")) {
      deleteImage(imageId);
      loadSavedImages(); // Refresh the saved images list
    }
  };

  const svgRef = useRef(null);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file && currentProject) {
      try {
        const imageData = await loadImage(file);
        setImage(imageData);
        // Reset annotations and history when loading new image
        setAnnotations([]);
        setHistory([]);
        setHistoryIndex(-1);
        setCurrentAnnotation(null);
        setSelectedAnnotation(null);
        setCurrentImageId(null);
        setShowAnnotator(true);
        setShowGallery(false);
      } catch (error) {
        console.error("Error loading image:", error);
      }
    } else if (!currentProject) {
      alert("Please select a project first before uploading an image.");
    }
  };

  const handleAnnotationStart = (point) => {
    if (!image) return;

    if (tool === "box") {
      setIsDrawing(true);
      setCurrentAnnotation({
        type: "box",
        id: Date.now(),
        x: point.x,
        y: point.y,
        width: 0,
        height: 0,
        color: COLORS.BOX,
        visible: true,
      });
    } else if (tool === "polygon") {
      if (!currentAnnotation) {
        setIsDrawing(true);
        setCurrentAnnotation({
          type: "polygon",
          id: Date.now(),
          points: [point],
          color: COLORS.POLYGON,
          visible: true,
        });
      } else {
        // Add new point to existing polygon
        setCurrentAnnotation({
          ...currentAnnotation,
          points: [...currentAnnotation.points, point],
        });
      }
    } else if (tool === "keypoint") {
      const newAnnotation = {
        type: "keypoint",
        id: Date.now(),
        x: point.x,
        y: point.y,
        color: COLORS.KEYPOINT,
        visible: true,
      };
      addAnnotation(newAnnotation);
      setSelectedAnnotation(newAnnotation);
    }
  };

  const handleAnnotationUpdate = (point) => {
    if (!isDrawing || !currentAnnotation) return;

    if (tool === "box") {
      setCurrentAnnotation({
        ...currentAnnotation,
        width: point.x - currentAnnotation.x,
        height: point.y - currentAnnotation.y,
      });
    }
  };

  const handleAnnotationComplete = () => {
    if (!currentAnnotation) return;

    if (
      currentAnnotation.type === "polygon" &&
      currentAnnotation.points.length < 3
    ) {
      // Don't complete polygon with less than 3 points
      return;
    }

    setIsDrawing(false);
    const annotation = { ...currentAnnotation };

    // For polygons, close the shape by adding the first point again
    if (annotation.type === "polygon") {
      annotation.points = [...annotation.points, annotation.points[0]];
    }

    addAnnotation(annotation);
    setSelectedAnnotation(annotation);
    setCurrentAnnotation(null);
  };

  const addAnnotation = (annotation) => {
    const newAnnotations = [...annotations, annotation];
    setAnnotations(newAnnotations);

    // Update history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newAnnotations);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUpdateAnnotation = (id, updates) => {
    const updatedAnnotations = annotations.map((ann) =>
      ann.id === id ? { ...ann, ...updates } : ann
    );
    setAnnotations(updatedAnnotations);

    // Update history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(updatedAnnotations);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    // If this is a saved image, update storage
    if (currentImageId) {
      updateImageAnnotations(currentImageId, updatedAnnotations);
    }
  };

  const handleDeleteAnnotation = (id) => {
    setAnnotations(annotations.filter((ann) => ann.id !== id));
    setSelectedAnnotation(null);
  };

  const handleSave = async () => {
    if (!image || !currentProject) {
      alert("Please select a project first");
      return;
    }

    try {
      const imageId = await saveImageData(
        {
          name: image.name,
          src: image.src,
          annotations: annotations,
          width: image.width,
          height: image.height,
        },
        currentProject.id
      );

      // Reset the state
      setImage(null);
      setAnnotations([]);
      setCurrentAnnotation(null);
      setSelectedAnnotation(null);
      setHistory([]);
      setHistoryIndex(-1);

      // Return to gallery view
      setShowAnnotator(false);
      setShowGallery(true);

      // Update saved images list
      setSavedImages(getAllImages(currentProject.id));
    } catch (error) {
      console.error("Error saving image:", error);
    }
  };

  const handleDownload = async () => {
    if (!image || annotations.length === 0) return;

    try {
      const blob = await saveAnnotatedImage(image, annotations);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "annotated-image.png";
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  const handleSavedImageSelect = (savedImage) => {
    setImage({
      src: savedImage.src,
      width: savedImage.width,
      height: savedImage.height,
      name: savedImage.name,
    });
    setAnnotations(savedImage.annotations || []);
    setCurrentAnnotation(null);
    setSelectedAnnotation(null);
    setHistory([savedImage.annotations || []]);
    setHistoryIndex(0);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setAnnotations(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setAnnotations(history[historyIndex + 1]);
    }
  };

  const handleCompleteAnnotation = (id, details) => {
    const updatedAnnotations = annotations.map((ann) =>
      ann.id === id ? { ...ann, ...details, completed: true } : ann
    );
    setAnnotations(updatedAnnotations);
    setSelectedAnnotation(null);
  };

  return (
    <>
      <Header projectName={currentProject?.name || "Image Annotation"} />
      <div className="app">
        {showGallery ? (
          <ProjectGallery
            onProjectSelect={(project) => {
              setCurrentProject(project);
              if (project) {
                setSavedImages(getAllImages(project.id));
              } else {
                setSavedImages([]);
              }
            }}
            onImageSelect={(image) => {
              setImage({
                src: image.src,
                width: image.width,
                height: image.height,
                name: image.name,
              });
              setAnnotations(image.annotations || []);
              setHistory([image.annotations || []]);
              setHistoryIndex(0);
              setShowGallery(false);
              setShowAnnotator(true);
            }}
            selectedProject={currentProject}
            onStartAnnotating={() => {
              if (currentProject) {
                setShowGallery(false);
                setShowAnnotator(true);
              }
            }}
          />
        ) : showAnnotator ? (
          <>
            <LeftSidebar
              tool={tool}
              onToolChange={setTool}
              onSave={handleSave}
              onDownload={handleDownload}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onToggleGallery={() => {
                setShowGallery(true);
                setShowAnnotator(false);
              }}
              showGallery={showGallery}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < history.length - 1}
            />

            <div className="main-content">
              <div className="canvas-container">
                {!image && (
                  <div className="upload-prompt">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <p>Upload an image to begin annotation</p>
                  </div>
                )}
                {image && (
                  <Canvas
                    image={image}
                    annotations={annotations}
                    currentAnnotation={currentAnnotation}
                    tool={tool}
                    onAnnotationStart={handleAnnotationStart}
                    onAnnotationUpdate={handleAnnotationUpdate}
                    onAnnotationComplete={handleAnnotationComplete}
                    onAnnotationSelect={setSelectedAnnotation}
                  />
                )}
              </div>
            </div>

            <RightSidebar
              annotations={annotations}
              selectedAnnotation={selectedAnnotation}
              onUpdateAnnotation={handleUpdateAnnotation}
              onDeleteAnnotation={handleDeleteAnnotation}
              onCompleteAnnotation={handleCompleteAnnotation}
              onSelectAnnotation={setSelectedAnnotation}
            />
          </>
        ) : (
          // Initial state - show gallery
          <ProjectGallery
            onProjectSelect={(project) => {
              setCurrentProject(project);
              setShowGallery(true);
            }}
            selectedProject={currentProject}
          />
        )}
      </div>
    </>
  );
}

export default App;
