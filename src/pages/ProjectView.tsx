
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Element, Plan, Projet, Surface } from '@/types/metr';
import Header from '@/components/project/Header';
import LeftPanel from '@/components/project/LeftPanel';
import CentralPanel from '@/components/project/CentralPanel';
import RightPanel from '@/components/project/RightPanel';
import NewProjectModal from '@/components/project/NewProjectModal';
import ProjectToolbar from '@/components/project/ProjectToolbar';
import ProjectLayout from '@/components/project/ProjectLayout';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import CalibrationGuide from '@/components/project/CalibrationGuide';
import { CalibrationProvider, useCalibrationContext } from '@/contexts/CalibrationContext';
import MeasurementProvider from '@/contexts/MeasurementContext';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

// Component principal enveloppé par les Providers
const ProjectView = () => {
  return (
    <CalibrationProvider>
      <MeasurementProvider>
        <ProjectViewContent />
      </MeasurementProvider>
    </CalibrationProvider>
  );
};

// Contenu principal qui utilise les contextes
const ProjectViewContent = () => {
  const { id } = useParams();
  const [projet, setProjet] = useState<Projet | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [selectedSurface, setSelectedSurface] = useState<Surface | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);

  // Utiliser le contexte de calibration partagé
  const { 
    isCalibrating, 
    calibrationStep,
    startCalibration
  } = useCalibrationContext();

  // Initialize project data (this would come from API in a real app)
  useEffect(() => {
    // Simulate loading project data
    setTimeout(() => {
      const demoProjet: Projet = {
        id: id || 'demo-project',
        nom: 'Projet de démonstration',
        plans: [],
        ouvrages: [],
        surfaces: [],
      };
      setProjet(demoProjet);
    }, 500);
  }, [id]);

  // Handle project creation
  const handleCreateProject = (projectName: string) => {
    const newProjet: Projet = {
      id: `project-${Date.now()}`,
      nom: projectName,
      plans: [],
      ouvrages: [],
      surfaces: [],
    };
    setProjet(newProjet);
    setIsNewProjectModalOpen(false);
  };

  // Handle calibration start
  const handleStartCalibration = () => {
    startCalibration();
  };

  // Add a new plan to the project
  const handlePlanUploaded = async (newPlan: Plan) => {
    if (!projet) return;
    
    const updatedProjet = {
      ...projet,
      plans: [...(projet.plans || []), newPlan],  // Add safety check for plans
      currentPlanIndex: (projet.plans || []).length,  // Add safety check for plans
    };
    
    setProjet(updatedProjet);
    
    // Auto-start calibration when a new plan is uploaded
    setTimeout(() => {
      startCalibration();
    }, 500);
  };

  // Handle calibration completion
  const handleCalibrationComplete = () => {
    console.log('Calibration complete');
  };

  // Add new ouvrage to the project
  const handleAddOuvrage = (ouvrage: any) => {
    if (!projet) return;
    
    // Initialize empty arrays if they don't exist
    const projectOuvrages = projet.ouvrages || [];
    const projectSurfaces = projet.surfaces || [];
    
    // If the ouvrage is associated with a surface, update surface's ouvragesIds
    if (selectedSurface && ouvrage.surfaceId) {
      const updatedSurfaces = projectSurfaces.map(surface => 
        surface.id === selectedSurface.id
          ? { 
              ...surface, 
              ouvragesIds: [...(surface.ouvragesIds || []), ouvrage.id] 
            }
          : surface
      );
      
      setProjet({
        ...projet,
        ouvrages: [...projectOuvrages, ouvrage],
        surfaces: updatedSurfaces,
      });
    } else {
      setProjet({
        ...projet,
        ouvrages: [...projectOuvrages, ouvrage],
      });
    }
  };

  // Remove an ouvrage from the project
  const handleRemoveOuvrage = (ouvrageId: string) => {
    if (!projet) return;
    
    // Initialize empty arrays if they don't exist
    const projectOuvrages = projet.ouvrages || [];
    const projectSurfaces = projet.surfaces || [];
    
    // Also remove the ouvrage from any surface that references it
    const updatedSurfaces = projectSurfaces.map(surface => ({
      ...surface,
      ouvragesIds: (surface.ouvragesIds || []).filter(id => id !== ouvrageId)
    }));
    
    setProjet({
      ...projet,
      ouvrages: projectOuvrages.filter(o => o.id !== ouvrageId),
      surfaces: updatedSurfaces,
    });
  };

  // Handle element selection from the plan
  const handleElementSelected = (element: Element) => {
    // When a room (piece) is selected, create or select a surface for it
    if (element.type === 'piece') {
      const projectSurfaces = projet?.surfaces || [];
      const existingSurface = projectSurfaces.find(s => s.pieceId === element.id);
      
      if (existingSurface) {
        setSelectedSurface(existingSurface);
      } else if (projet) {
        // Create a new surface for this piece
        const newSurface: Surface = {
          id: `surface-${Date.now()}`,
          pieceId: element.id,
          nom: `Pièce ${projectSurfaces.length ? projectSurfaces.length + 1 : 1}`,
          type: 'sol',
          superficie: ((element.width || 0) * (element.height || 0)) / 10000, // Convert to m²
          unite: 'm²',
          ouvragesIds: [],
        };
        
        const updatedSurfaces = [...projectSurfaces, newSurface];
        
        setProjet({
          ...projet,
          surfaces: updatedSurfaces,
        });
        
        setSelectedSurface(newSurface);
      }
    }
  };

  if (!projet) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // Determine if side panels should be hidden during calibration
  const hidePanels = isCalibrating && calibrationStep > 0;

  return (
    <ProjectLayout>
      <Header projet={projet} onNewProject={() => setIsNewProjectModalOpen(true)} />
      <ProjectToolbar onCalibrationStart={handleStartCalibration} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - hidden during calibration */}
        {!hidePanels && (
          <LeftPanel 
            projet={projet}
            selectedSurface={selectedSurface}
            onAddOuvrage={handleAddOuvrage}
          />
        )}
        
        {/* Central panel - expands during calibration */}
        <div className={`flex-1 transition-all duration-300 ${hidePanels ? 'w-full' : ''}`}>
          <CentralPanel 
            projet={projet}
            plan={plan}
            setPlan={setPlan}
            isCalibrating={isCalibrating}
            calibrationStep={calibrationStep}
            onPlanUploaded={handlePlanUploaded}
            onCalibrationComplete={handleCalibrationComplete}
            onElementSelected={handleElementSelected}
            selectedSurface={selectedSurface}
            hoveredElementId={hoveredElementId}
          />
        </div>
        
        {/* Right panel - hidden during calibration */}
        {!hidePanels && (
          <RightPanel 
            projet={projet}
            onElementHover={setHoveredElementId}
            selectedSurface={selectedSurface}
            setSelectedSurface={setSelectedSurface}
          />
        )}
      </div>
      
      {/* Calibration Dialog - Show for introduction (step 0) and instructions (step 1) */}
      <Dialog 
        open={isCalibrating && (calibrationStep === 0 || calibrationStep === 1)} 
        onOpenChange={() => {}}
      >
        <DialogContent className="p-0 border-0 max-w-xl">
          <DialogTitle className="sr-only">Calibration Guide</DialogTitle>
          <CalibrationGuide onClose={() => console.log('Close calibration guide')} />
        </DialogContent>
      </Dialog>
      
      <NewProjectModal 
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onCreateProject={handleCreateProject}
      />
    </ProjectLayout>
  );
};

export default ProjectView;
