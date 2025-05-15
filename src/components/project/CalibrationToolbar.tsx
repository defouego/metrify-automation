import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Eraser, Check, Eye } from 'lucide-react';
import { useCalibrationContext } from '@/contexts/CalibrationContext';
import { ElementType } from '@/types/project';
import { cn } from '@/lib/utils';

interface CalibrationToolbarProps {
  elementType: ElementType | null;
}

const CalibrationToolbar = ({ elementType }: CalibrationToolbarProps) => {
  const { beginCalibrationStep, completeCalibration, removeLastCalibrationPoint, setRealDimensions } = useCalibrationContext();
  
  return (
    <div className="absolute bottom-8 right-8 flex flex-col gap-4 items-end">
      {/* Type indicator */}
      <div className={cn(
        "px-3 py-1.5 rounded-full text-sm font-medium shadow-md",
        elementType === 'door' && "bg-blue-100 text-blue-700",
        elementType === 'window' && "bg-green-100 text-green-700",
        elementType === 'wall' && "bg-amber-100 text-amber-700",
        elementType === 'room' && "bg-purple-100 text-purple-700",
      )}>
        {elementType === 'door' && 'Porte'}
        {elementType === 'window' && 'Fenêtre'}
        {elementType === 'wall' && 'Mur'}
        {elementType === 'room' && 'Pièce'}
      </div>
      
      {/* Floating buttons */}
      <div className="flex gap-2 shadow-lg rounded-full bg-white/90 p-2">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-10 w-10 border-gray-300 bg-white hover:bg-gray-50"
          onClick={() => beginCalibrationStep()}
          title="Ajouter un élément"
        >
          <Plus className="w-4 h-4" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-10 w-10 border-gray-300 bg-white hover:bg-gray-50"
          onClick={removeLastCalibrationPoint}
          title="Supprimer le dernier élément"
        >
          <Eraser className="w-4 h-4" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-10 w-10 border-gray-300 bg-white hover:bg-gray-50"
          onClick={() => setRealDimensions(100, 250)}
          title="Aperçu des dimensions"
        >
          <Eye className="w-4 h-4" />
        </Button>
        
        <Button
          variant="default"
          className="rounded-full bg-orange-500 hover:bg-orange-600 px-4" 
          onClick={completeCalibration}
          title="Valider et passer à l'étape suivante"
        >
          <Check className="w-4 h-4 mr-1" />
          Valider
        </Button>
      </div>
    </div>
  );
};

export default CalibrationToolbar;
