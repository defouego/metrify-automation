
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Element, Plan, Projet, Surface } from '@/types/metr';
import { useCalibrationContext } from '@/contexts/CalibrationContext';
import PlanViewer from './PlanViewer';

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
  return (
    <div 
      className={cn(
        "flex flex-col h-full",
        isCalibrating && "bg-gray-50"
      )}
    >
      <PlanViewer 
        projectId={projet.id} 
        isCalibrating={isCalibrating} 
        hoveredElementId={hoveredElementId}
      />
    </div>
  );
};

export default CentralPanel;
