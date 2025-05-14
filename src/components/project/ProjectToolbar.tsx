
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  MousePointer, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Save, 
  History, 
  Settings,
  Ruler,
  Pencil,
  Eraser,
  Move,
  Plus,
  Minus
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

type Tool = 'select' | 'zoomIn' | 'zoomOut' | 'fullscreen' | 'calibrate' | 'measure' | 'draw' | 'erase' | 'move';

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
    <div className="w-full h-14 bg-white border-b border-gray-200 flex items-center px-4 justify-between shadow-sm">
      <div className="flex items-center space-x-2">
        {/* Selection and manipulation tools */}
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

        <Separator orientation="vertical" className="h-8 mx-1" />

        {/* Zoom and view tools */}
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

        <Separator orientation="vertical" className="h-8 mx-1" />

        {/* Measurement and drawing tools */}
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

        <Separator orientation="vertical" className="h-8 mx-1" />
        
        {/* Calibration button */}
        <Button 
          variant="outline" 
          className={cn(
            "border border-gray-200 text-sm font-medium",
            activeTool === 'calibrate' && "bg-blue-50 text-blue-700 border-blue-200"
          )}
          onClick={() => handleToolClick('calibrate')}
        >
          Calibrer
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Quick zoom buttons */}
        <Button variant="outline" size="icon" className="border border-gray-200">
          <Plus className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="border border-gray-200">
          <Minus className="h-4 w-4" />
        </Button>
        
        {/* Settings dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border border-gray-200">
              <Settings className="mr-2 h-4 w-4" />
              Menu
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <Save className="mr-2 h-4 w-4" />
              Sauvegarder
            </DropdownMenuItem>
            <DropdownMenuItem>
              <History className="mr-2 h-4 w-4" />
              Historique des versions
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Gestion de projet
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

interface ToolButtonProps {
  icon: React.FC<{ className?: string }>;
  tooltip: string;
  isActive: boolean;
  onClick: () => void;
}

const ToolButton = ({ icon: Icon, tooltip, isActive, onClick }: ToolButtonProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "border border-gray-200",
            isActive && "bg-blue-50 text-blue-700 border-blue-200"
          )}
          onClick={onClick}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
};

export default ProjectToolbar;
