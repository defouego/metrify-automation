import { useState, useCallback, useEffect } from 'react';
import { CalibrationPoint, ElementType } from '@/types/project';
import { toast } from 'sonner';

export function useCalibration() {
  // Initialize with calibration already complete
  const [isCalibrating, setIsCalibrating] = useState(false);
  // Calibration steps:
  // 0: Not calibrating
  // 1: Showing instructions
  // 2: User selecting elements on plan
  // 3: Setting real dimensions
  // 4: Review and complete
  const [calibrationStep, setCalibrationStep] = useState(0);
  const [calibrationPoints, setCalibrationPoints] = useState<CalibrationPoint[]>([]);
  const [currentElementType, setCurrentElementType] = useState<ElementType | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  // The sequence of element types to calibrate
  const calibrationSequence: ElementType[] = ['door', 'window', 'wall', 'room'];
  
  const startCalibration = useCallback(() => {
    setIsCalibrating(true);
    setCalibrationStep(1); // Show instructions
    setCurrentStepIndex(0);
    setCurrentElementType(calibrationSequence[0]);
    console.log("Starting calibration");
  }, []);
  
  const completeCalibration = useCallback(() => {
    // Move to the next element type in the sequence
    const nextStepIndex = currentStepIndex + 1;
    
    if (nextStepIndex < calibrationSequence.length) {
      // Go to the next calibration step
      setCurrentStepIndex(nextStepIndex);
      setCurrentElementType(calibrationSequence[nextStepIndex]);
      setCalibrationStep(1); // Show instructions again for next step
      toast.success(`Étape de calibration complétée! Passons à l'étape suivante.`);
      console.log("Completed calibration for current element, moving to next step");
    } else {
      // Complete the whole calibration process
      setCalibrationStep(0);
      setIsCalibrating(false);
      setCurrentElementType(null);
      setCurrentStepIndex(0);
      toast.success('Calibration terminée avec succès!');
      console.log("Calibration fully completed");
    }
  }, [currentStepIndex, calibrationSequence]);
  
  const beginCalibrationStep = useCallback(() => {
    // Si nous sommes à l'étape 0 (pré-calibration) ou à l'étape 1 (instructions), passer à l'étape 2 (sélection)
    console.log("beginCalibrationStep appelé, calibrationStep actuel =", calibrationStep);
    if (calibrationStep === 0 || calibrationStep === 1) {
      console.log("Moving to selection mode");
      setCalibrationStep(2);
      // Vérifier que le state est bien mis à jour
      setTimeout(() => {
        console.log("Après setCalibrationStep(2), calibrationStep devrait être 2");
      }, 0);
    } 
    // Si nous sommes déjà à l'étape 2 (sélection), valider et passer à l'élément suivant
    else if (calibrationStep === 2) {
      console.log("Completing current element selection");
      completeCalibration(); // Passer à l'élément suivant
    }
  }, [calibrationStep, completeCalibration]);
  
  const addCalibrationPoint = useCallback((x: number, y: number) => {
    if (!currentElementType) return;
    
    setCalibrationPoints(prev => [
      ...prev,
      {
        type: currentElementType,
        x,
        y,
        realDimension: {}
      }
    ]);
    console.log("Added calibration point at", x, y, "for", currentElementType);
  }, [currentElementType]);
  
  const removeLastCalibrationPoint = useCallback(() => {
    setCalibrationPoints(prev => {
      if (prev.length === 0) return prev;
      console.log("Removing last calibration point");
      return prev.slice(0, prev.length - 1);
    });
  }, []);
  
  const setRealDimensions = useCallback((width?: number, height?: number, length?: number) => {
    setCalibrationPoints(prev => {
      const lastIndex = prev.length - 1;
      if (lastIndex < 0) return prev;
      
      const newPoints = [...prev];
      newPoints[lastIndex] = {
        ...newPoints[lastIndex],
        realDimension: {
          width,
          height,
          length
        }
      };
      return newPoints;
    });
    
    setCalibrationStep(4); // Move to review step
    console.log("Set real dimensions and moved to review step");
  }, []);
  
  const cancelCalibration = useCallback(() => {
    setCalibrationStep(1); // Retourner à l'écran d'instruction
    console.log("Cancelling current selection and returning to instruction screen");
  }, []);
  
  const getCurrentCalibrationStepName = useCallback(() => {
    switch (currentElementType) {
      case 'door':
        return 'portes';
      case 'window':
        return 'fenêtres';
      case 'wall':
        return 'murs';
      case 'room':
        return 'pièces';
      default:
        return '';
    }
  }, [currentElementType]);
  
  // Filter calibration points to only show points for the current element type
  const getCurrentTypePoints = useCallback(() => {
    return calibrationPoints.filter(point => point.type === currentElementType);
  }, [calibrationPoints, currentElementType]);

  return {
    isCalibrating,
    calibrationStep,
    calibrationPoints,
    currentElementType,
    currentStepIndex,
    currentStepName: getCurrentCalibrationStepName(),
    totalSteps: calibrationSequence.length,
    currentTypePoints: getCurrentTypePoints(),
    startCalibration,
    beginCalibrationStep,
    addCalibrationPoint,
    setRealDimensions,
    completeCalibration,
    cancelCalibration,
    removeLastCalibrationPoint
  };
}
