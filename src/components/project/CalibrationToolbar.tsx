
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Eraser, Check, Eye } from 'lucide-react';
import { useCalibration } from '@/hooks/useCalibration';
import { ElementType } from '@/types/project';
import { cn } from '@/lib/utils';

interface CalibrationToolbarProps {
  elementType: ElementType | null;
}

const CalibrationToolbar = ({ elementType }: CalibrationToolbarProps) => {
  const { completeCalibration, cancelCalibration, removeLastCalibrationPoint } = useCalibration();
  
  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className={cn(
          "px-3 py-1.5 rounded-full text-sm font-medium",
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
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 border-gray-300"
          onClick={() => console.log('Add more elements')}
        >
          <Plus className="w-4 h-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 border-gray-300"
          onClick={removeLastCalibrationPoint}
        >
          <Eraser className="w-4 h-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 border-gray-300"
        >
          <Eye className="w-4 h-4" />
        </Button>
        
        <Button
          variant="default"
          size="sm"
          className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600" 
          onClick={completeCalibration}
        >
          <Check className="w-4 h-4" />
          Valider
        </Button>
      </div>
    </div>
  );
};

export default CalibrationToolbar;
