import React, { createContext, useContext, ReactNode } from 'react';
import { useCalibration } from '@/hooks/useCalibration';
import { ElementType, CalibrationPoint } from '@/types/project';

// Définir le type pour le contexte
type CalibrationContextType = {
  isCalibrating: boolean;
  calibrationStep: number;
  calibrationPoints: CalibrationPoint[];
  currentElementType: ElementType | null;
  currentStepIndex: number;
  currentStepName: string;
  totalSteps: number;
  currentTypePoints: CalibrationPoint[];
  startCalibration: () => void;
  beginCalibrationStep: () => void;
  addCalibrationPoint: (x: number, y: number) => void;
  setRealDimensions: (width?: number, height?: number, length?: number) => void;
  completeCalibration: () => void;
  cancelCalibration: () => void;
  removeLastCalibrationPoint: () => void;
};

// Créer le contexte avec une valeur par défaut undefined
const CalibrationContext = createContext<CalibrationContextType | undefined>(undefined);

// Créer un hook personnalisé pour utiliser le contexte
export const useCalibrationContext = () => {
  const context = useContext(CalibrationContext);
  if (context === undefined) {
    throw new Error('useCalibrationContext must be used within a CalibrationProvider');
  }
  return context;
};

// Props pour le Provider
interface CalibrationProviderProps {
  children: ReactNode;
}

// Composant Provider qui utilise le hook useCalibration
export const CalibrationProvider: React.FC<CalibrationProviderProps> = ({ children }) => {
  // Une seule instance de useCalibration
  const calibration = useCalibration();

  return (
    <CalibrationContext.Provider value={calibration}>
      {children}
    </CalibrationContext.Provider>
  );
}; 