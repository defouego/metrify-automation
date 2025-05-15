
import React, { useRef, useEffect, useState } from 'react';
import { Canvas as FabricCanvas, Rect } from 'fabric';
import { Element, Plan, Projet, Surface } from '@/types/metr';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { processUploadedDWG, highlightSimilarElements } from '@/utils/plan-utils';
import PlanSelector from '@/components/project/PlanSelector';
import PlanViewer from '@/components/project/PlanViewer';

interface CentralPanelProps {
  projet: Projet;
  plan: Plan | null;
  setPlan: React.Dispatch<React.SetStateAction<Plan | null>>;
  isCalibrating: boolean;
  calibrationStep: number;
  onPlanUploaded: (plan: Plan) => void;
  onCalibrationComplete: () => void;
  onElementSelected: (element: Element) => void;
  selectedSurface: Surface | null;
  hoveredElementId: string | null;
}

const CentralPanel: React.FC<CentralPanelProps> = ({ 
  projet,
  plan,
  setPlan,
  isCalibrating,
  calibrationStep,
  onPlanUploaded,
  onCalibrationComplete,
  onElementSelected,
  selectedSurface,
  hoveredElementId
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Check if file is DWG
    if (!file.name.toLowerCase().endsWith('.dwg')) {
      toast.error("Le fichier doit être au format DWG");
      return;
    }
    
    try {
      toast.info("Traitement du fichier DWG en cours...");
      
      // Process the uploaded DWG file (simulated in this demo)
      const newPlan = await processUploadedDWG(file);
      
      // Update state
      setPlan(newPlan);
      onPlanUploaded(newPlan);
      
      toast.success("Plan importé avec succès");
    } catch (error) {
      console.error("Error processing DWG file:", error);
      toast.error("Erreur lors du traitement du fichier");
    }
  };
  
  // Trigger file input click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle plan selection
  const handleSelectPlan = (selectedPlan: Plan) => {
    setPlan(selectedPlan);
    toast.info(`Plan "${selectedPlan.nom}" sélectionné`);
  };
  
  return (
    <div className="relative flex-1 h-full overflow-hidden">
      {plan && (
        <PlanSelector 
          projet={projet}
          currentPlan={plan}
          onSelectPlan={handleSelectPlan}
          onUploadPlan={handleUploadClick}
        />
      )}
      
      {/* Plan Viewer Component */}
      <PlanViewer 
        projectId={projet.id}
        isCalibrating={isCalibrating}
      />
      
      {/* Instructions for uploading plan if no plan is selected */}
      {!plan && !isCalibrating && (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Importer un plan</h2>
            <p className="text-gray-600 mb-6">
              Commencez par importer votre plan au format DWG pour démarrer votre métré.
            </p>
            <Button
              onClick={handleUploadClick}
              className="bg-metrBlue hover:bg-blue-800 text-white"
            >
              Importer un plan DWG
            </Button>
          </div>
        </div>
      )}
      
      <input 
        ref={fileInputRef}
        type="file" 
        accept=".dwg" 
        className="hidden"
        onChange={handleFileUpload}
      />
    </div>
  );
};

export default CentralPanel;
