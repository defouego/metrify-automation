
import React, { createContext, useState, ReactNode, useContext } from 'react';
import { ItemUnit } from '@/types/library';
import { Surface } from '@/types/metr';
import { toast } from 'sonner';

type MeasurementType = 'linear' | 'area' | 'count' | 'manual' | null;

interface MeasurementContextValue {
  isStarted: boolean;
  measurementType: MeasurementType;
  currentItemId: string | null;
  measurementValue: number;
  defaultHeight: number;
  startMeasurement: (itemId: string, unitType: ItemUnit) => void;
  completeMeasurement: (value: number, surfaceId?: string) => void;
  cancelMeasurement: () => void;
  setDefaultHeight: (value: number) => void;
}

export const MeasurementContext = createContext<MeasurementContextValue>({
  isStarted: false,
  measurementType: null,
  currentItemId: null,
  measurementValue: 0,
  defaultHeight: 2.5, // Default wall height (m)
  startMeasurement: () => {},
  completeMeasurement: () => {},
  cancelMeasurement: () => {},
  setDefaultHeight: () => {},
});

export const MeasurementProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isStarted, setIsStarted] = useState(false);
  const [measurementType, setMeasurementType] = useState<MeasurementType>(null);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [measurementValue, setMeasurementValue] = useState<number>(0);
  const [defaultHeight, setDefaultHeight] = useState<number>(2.5);

  // Determine measurement type based on unit
  const getMeasurementTypeFromUnit = (unit: ItemUnit): MeasurementType => {
    switch (unit) {
      case 'ML':
        return 'linear';
      case 'M2':
        return 'area';
      case 'U':
      case 'PCE':
        return 'count';
      default:
        return 'manual';
    }
  };

  // Start measurement process
  const startMeasurement = (itemId: string, unitType: ItemUnit) => {
    const type = getMeasurementTypeFromUnit(unitType);
    setIsStarted(true);
    setMeasurementType(type);
    setCurrentItemId(itemId);
    setMeasurementValue(0);
    
    toast.info(
      type === 'linear' 
        ? "Cliquez sur deux points pour mesurer une distance" 
        : type === 'area' 
          ? "Dessinez le contour d'une surface à mesurer"
          : type === 'count'
            ? "Cliquez sur les éléments à compter"
            : "Entrez une valeur manuellement"
    );
  };

  // Complete measurement process
  const completeMeasurement = (value: number, surfaceId?: string) => {
    setMeasurementValue(value);
    
    // In a real implementation, here you would update the project data
    toast.success(`Mesure terminée: ${value.toFixed(2)} ${
      measurementType === 'linear' ? 'ml' : 
      measurementType === 'area' ? 'm²' : 
      'unités'
    }`);
    
    setIsStarted(false);
    setMeasurementType(null);
    setCurrentItemId(null);
  };

  // Cancel measurement
  const cancelMeasurement = () => {
    setIsStarted(false);
    setMeasurementType(null);
    setCurrentItemId(null);
    setMeasurementValue(0);
    
    toast.info("Mesure annulée");
  };

  // Update default wall height
  const updateDefaultHeight = (value: number) => {
    setDefaultHeight(value);
    toast.info(`Hauteur par défaut définie à ${value.toFixed(2)}m`);
  };

  return (
    <MeasurementContext.Provider
      value={{
        isStarted,
        measurementType,
        currentItemId,
        measurementValue,
        defaultHeight,
        startMeasurement,
        completeMeasurement,
        cancelMeasurement,
        setDefaultHeight: updateDefaultHeight,
      }}
    >
      {children}
    </MeasurementContext.Provider>
  );
};

export const useMeasurement = () => useContext(MeasurementContext);

export default MeasurementProvider;
