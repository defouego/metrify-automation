
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
  Minus,
  Square,
  Hash,
  Scan,
  GitCompare,
  Layers,
  Download,
  Save
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
  | 'calibrate'
  | 'surface'
  | 'length'
  | 'counter'
  | 'detection'
  | 'compare'
  | 'layer';

interface ProjectToolbarProps {
  onCalibrationStart?: () => void;
  onToolChange?: (tool: Tool) => void;
  onExportExcel?: () => void;
  onSaveProject?: () => void;
}

const ProjectToolbar = ({ 
  onCalibrationStart, 
  onToolChange,
  onExportExcel,
  onSaveProject
}: ProjectToolbarProps) => {
  const [activeTool, setActiveTool] = useState<Tool>('select');

  const handleToolClick = (tool: Tool) => {
    setActiveTool(tool);
    if (onToolChange) {
      onToolChange(tool);
    }
    
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

      {/* Outils de mesure */}
      <ToolButton
        icon={Square}
        tooltip="Surface"
        isActive={activeTool === 'surface'}
        onClick={() => handleToolClick('surface')}
      />
      <ToolButton
        icon={Ruler}
        tooltip="Longueur"
        isActive={activeTool === 'length'}
        onClick={() => handleToolClick('length')}
      />
      <ToolButton
        icon={Hash}
        tooltip="Compteur"
        isActive={activeTool === 'counter'}
        onClick={() => handleToolClick('counter')}
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

      {/* Intelligence artificielle & Couches */}
      <ToolButton
        icon={Scan}
        tooltip="Détection automatique"
        isActive={activeTool === 'detection'}
        onClick={() => handleToolClick('detection')}
      />
      <ToolButton
        icon={GitCompare}
        tooltip="Comparer les plans"
        isActive={activeTool === 'compare'}
        onClick={() => handleToolClick('compare')}
      />
      <ToolButton
        icon={Layers}
        tooltip="Calques"
        isActive={activeTool === 'layer'}
        onClick={() => handleToolClick('layer')}
      />

      <Separator orientation="vertical" className="h-6 mx-2" />

      {/* Édition & Dessin */}
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

      {/* Export & Save */}
      <ToolButton
        icon={Download}
        tooltip="Exporter Excel"
        onClick={onExportExcel}
      />
      <ToolButton
        icon={Save}
        tooltip="Enregistrer le projet"
        onClick={onSaveProject}
      />
    </div>
  );
};

interface ToolButtonProps {
  icon: React.FC<{ className?: string }>;
  tooltip: string;
  isActive?: boolean;
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
