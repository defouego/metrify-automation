
import { useState, useCallback } from 'react';
import { CalibrationPoint, ElementType } from '@/types/project';

export function useCalibration() {
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationStep, setCalibrationStep] = useState(0);
  const [calibrationPoints, setCalibrationPoints] = useState<CalibrationPoint[]>([]);
  const [currentElementType, setCurrentElementType] = useState<ElementType | null>(null);
  
  const startCalibration = useCallback(() => {
    setIsCalibrating(true);
    setCalibrationStep(1);
    setCurrentElementType(null);
  }, []);
  
  const selectElementType = useCallback((type: ElementType) => {
    setCurrentElementType(type);
    setCalibrationStep(2);
  }, []);
  
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
    setCalibrationStep(3);
  }, [currentElementType]);
  
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
    
    setCalibrationStep(4);
  }, []);
  
  const completeCalibration = useCallback(() => {
    setCalibrationStep(0);
    setIsCalibrating(false);
    setCurrentElementType(null);
    // Here we would normally save the calibration data
  }, []);
  
  const cancelCalibration = useCallback(() => {
    setCalibrationStep(0);
    setIsCalibrating(false);
    setCurrentElementType(null);
    // Optionally reset the last added point
    setCalibrationPoints(prev => {
      if (prev.length === 0) return prev;
      return prev.slice(0, prev.length - 1);
    });
  }, []);
  
  return {
    isCalibrating,
    calibrationStep,
    calibrationPoints,
    currentElementType,
    startCalibration,
    selectElementType,
    addCalibrationPoint,
    setRealDimensions,
    completeCalibration,
    cancelCalibration
  };
}
