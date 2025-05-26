
import React, { useRef, useEffect, useState } from 'react';
import { Element, Plan, Projet, Surface } from '@/types/metr';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { processUploadedDWG, highlightSimilarElements } from '@/utils/plan-utils';
import PlanSelector from '@/components/project/PlanSelector';
import PlanViewer from '@/components/project/PlanViewer';
import { Upload } from 'lucide-react';

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
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
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
  
  // Handle file input change
  const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    await handleFileUpload(files[0]);
    // Reset the file input value so the same file can be uploaded again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Trigger file input click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle drag events
  useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (!dropZone) return;
    
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    };
    
    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      // Only set dragging to false if we're leaving the drop zone entirely
      if (!dropZone.contains(e.relatedTarget as Node)) {
        setIsDragging(false);
      }
    };
    
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        handleFileUpload(e.dataTransfer.files[0]);
      }
    };
    
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);
    
    return () => {
      dropZone.removeEventListener('dragover', handleDragOver);
      dropZone.removeEventListener('dragleave', handleDragLeave);
      dropZone.removeEventListener('drop', handleDrop);
    };
  }, []);

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
      {plan && (
        <PlanViewer 
          projectId={projet.id}
          isCalibrating={isCalibrating}
          plan={plan}
          onElementSelected={onElementSelected}
          selectedSurface={selectedSurface?.id}
          hoveredElementId={hoveredElementId}
        />
      )}
      
      {/* Instructions for uploading plan if no plan is selected */}
      {!plan && !isCalibrating && (
        <div 
          ref={dropZoneRef}
          className={`absolute inset-0 flex items-center justify-center bg-white transition-colors ${
            isDragging ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''
          }`}
        >
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Importer un plan</h2>
            <p className="text-gray-600 mb-6">
              Glissez et déposez votre fichier DWG ici ou cliquez pour sélectionner un fichier.
            </p>
            <Button
              onClick={handleUploadClick}
              className="bg-metrBlue hover:bg-blue-800 text-white"
            >
              Sélectionner un fichier DWG
            </Button>
            {isDragging && (
              <div className="mt-4 text-blue-600 font-medium">
                Relâchez le fichier pour l'importer
              </div>
            )}
          </div>
        </div>
      )}
      
      <input 
        ref={fileInputRef}
        type="file" 
        accept=".dwg" 
        className="hidden"
        onChange={handleFileInputChange}
      />
    </div>
  );
};

export default CentralPanel;
