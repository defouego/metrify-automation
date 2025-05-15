
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useCalibrationContext } from '@/contexts/CalibrationContext';
import CalibrationToolbar from '@/components/project/CalibrationToolbar';
import { ElementType } from '@/types/project';
import { toast } from 'sonner';

interface PlanViewerProps {
  projectId?: string;
  isCalibrating: boolean;
  hoveredElementId?: string | null;
}

const PlanViewer = ({ projectId, isCalibrating, hoveredElementId }: PlanViewerProps) => {
  const [scale, setScale] = useState(1);
  const { 
    calibrationStep, 
    addCalibrationPoint, 
    currentElementType,
    currentTypePoints 
  } = useCalibrationContext();
  
  // Mock function to represent what would be done by the external plan rendering service
  const renderPlan = () => {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Visualisation du Plan</h3>
          <p className="text-gray-500 mb-4">
            {projectId ? `Projet ID: ${projectId}` : 'Aucun projet sélectionné'}
          </p>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 bg-gray-50">
            <p className="text-gray-400">
              Le rendu graphique du plan sera intégré ici.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              (Composant externe à intégrer)
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Handle click on the plan during calibration
  const handlePlanClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCalibrating || calibrationStep !== 2) return;
    
    // Get click coordinates relative to the plan viewer
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Add calibration point
    addCalibrationPoint(x, y);
    toast.success(`Élément ${currentElementType} ajouté à la position (${Math.round(x)}, ${Math.round(y)})`);
  };

  return (
    <div 
      className={cn(
        "flex-1 relative overflow-hidden", 
        "bg-white", 
        isCalibrating && calibrationStep === 2 && "cursor-crosshair"
      )}
      onClick={handlePlanClick}
    >
      {renderPlan()}
      
      {/* Tooltip de démonstration */}
      <div 
        className="absolute left-1/2 top-1/3 transform -translate-x-1/2 -translate-y-1/2 
                  bg-white p-2 rounded-md shadow-md border border-gray-200 opacity-0 hover:opacity-100
                  transition-opacity duration-200 pointer-events-none"
      >
        <p className="text-sm font-medium">Mur Nord</p>
        <p className="text-xs text-gray-500">L: 4.50m - H: 2.80m</p>
      </div>
      
      {/* Éléments de sélection de démonstration */}
      <div 
        className={cn(
          "absolute left-1/3 top-1/2 w-24 h-24 border-2 border-blue-500 rounded-sm pointer-events-none transition-all duration-200",
          hoveredElementId === "element-1" ? "bg-blue-300/50" : "bg-blue-100/20"
        )}
        data-element-id="element-1"
      ></div>
      
      <div 
        className={cn(
          "absolute right-1/3 top-2/3 w-16 h-32 border-2 border-yellow-500 rounded-sm pointer-events-none transition-all duration-200",
          hoveredElementId === "element-2" ? "bg-yellow-300/50" : "bg-yellow-100/20"
        )}
        data-element-id="element-2"
      ></div>
      
      {/* Calibration toolbar that appears at the bottom during calibration */}
      {isCalibrating && calibrationStep === 2 && (
        <CalibrationToolbar elementType={currentElementType} />
      )}
    </div>
  );
};

export default PlanViewer;
