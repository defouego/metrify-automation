import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  MousePointer,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Ruler,
  Pencil,
  Eraser,
  Move,
  Plus,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

type Tool =
  | 'select'
  | 'move'
  | 'zoomIn'
  | 'zoomOut'
  | 'fullscreen'
  | 'measure'
  | 'draw'
  | 'erase'
  | 'calibrate';

interface ProjectToolbarProps {
  onCalibrationStart?: () => void;
}

const ProjectToolbar = ({ onCalibrationStart }: ProjectToolbarProps) => {
  const [activeTool, setActiveTool] = useState<Tool>('select');

  const handleToolClick = (tool: Tool) => {
    setActiveTool(tool);
    if (tool === 'calibrate' && onCalibrationStart) {
      onCalibrationStart();
    }
  };

  return (
    <div
      className="absolute bottom-0 left-0 right-0 h-14 bg-white border-t border-gray-200 
                 flex items-center px-4 justify-center space-x-3 shadow-sm"
    >
      {/* Sélection & Déplacement */}
      <ToolButton
        icon={MousePointer}
        tooltip="Sélection"
        isActive={activeTool === 'select'}
        onClick={() => handleToolClick('select')}
      />
      <ToolButton
        icon={Move}
        tooltip="Déplacer"
        isActive={activeTool === 'move'}
        onClick={() => handleToolClick('move')}
      />

      <Separator orientation="vertical" className="h-6 mx-2" />

      {/* Zoom & Vue */}
      <ToolButton
        icon={ZoomIn}
        tooltip="Zoom +"
        isActive={activeTool === 'zoomIn'}
        onClick={() => handleToolClick('zoomIn')}
      />
      <ToolButton
        icon={ZoomOut}
        tooltip="Zoom -"
        isActive={activeTool === 'zoomOut'}
        onClick={() => handleToolClick('zoomOut')}
      />
      <ToolButton
        icon={Maximize2}
        tooltip="Plein écran"
        isActive={activeTool === 'fullscreen'}
        onClick={() => handleToolClick('fullscreen')}
      />

      <Separator orientation="vertical" className="h-6 mx-2" />

      {/* Mesure & Dessin */}
      <ToolButton
        icon={Ruler}
        tooltip="Mesurer"
        isActive={activeTool === 'measure'}
        onClick={() => handleToolClick('measure')}
      />
      <ToolButton
        icon={Pencil}
        tooltip="Dessiner"
        isActive={activeTool === 'draw'}
        onClick={() => handleToolClick('draw')}
      />
      <ToolButton
        icon={Eraser}
        tooltip="Effacer"
        isActive={activeTool === 'erase'}
        onClick={() => handleToolClick('erase')}
      />

      <Separator orientation="vertical" className="h-6 mx-2" />

      {/* Calibration */}
      <Button
        variant="outline"
        className={cn(
          'border border-gray-200 text-sm font-medium px-3',
          activeTool === 'calibrate' && 'bg-blue-50 text-blue-600 border-blue-200'
        )}
        onClick={() => handleToolClick('calibrate')}
      >
        Calibrer
      </Button>

      <Separator orientation="vertical" className="h-6 mx-2" />

      {/* Zoom Rapide */}
      <Button
        variant="outline"
        size="icon"
        className="border border-gray-200"
        onClick={() => handleToolClick('zoomIn')}
      >
        <Plus className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="border border-gray-200"
        onClick={() => handleToolClick('zoomOut')}
      >
        <Minus className="h-4 w-4" />
      </Button>
    </div>
  );
};

interface ToolButtonProps {
  icon: React.FC<{ className?: string }>;
  tooltip: string;
  isActive: boolean;
  onClick: () => void;
}

const ToolButton = ({ icon: Icon, tooltip, isActive, onClick }: ToolButtonProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant="outline"
        size="icon"
        className={cn(
          'border border-gray-200 hover:bg-gray-100 transition-colors',
          isActive && 'bg-blue-50 text-blue-600 border-blue-200'
        )}
        onClick={onClick}
      >
        <Icon className="h-5 w-5" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>{tooltip}</TooltipContent>
  </Tooltip>
);

export default ProjectToolbar;
